import { useCallback, useEffect, useState } from "react";
import styles from "../assets/css/InventoryPanel.module.css";
import type { ServiceResult } from "@/types/ServiceResult";
import type {
  GetPlayerInventoryResponse,
  PlayerInventorySlot,
} from "../types/PlayerInventoryTypes";
import { EQUIPMENT_CHANGED_EVENT } from "../types/PlayerInventoryTypes";

interface InventoryPanelProps {
  playerId: string;
  /**
   * Bump this number (e.g. a counter kept in the parent) whenever an item is
   * equipped/unequipped elsewhere — like the stats panel's unequip button —
   * so this panel refetches and shows the item again.
   */
  inventoryVersion?: number;
  /**
   * Called after this panel changes the inventory (using/equipping an
   * item), so sibling panels — like the stats panel's equipment grid —
   * know to refetch too.
   */
  onInventoryChange?: () => void;
}

const STAT_LABELS: {
  key: keyof NonNullable<GetPlayerInventoryResponse["stats"]>;
  label: string;
  isPercent?: boolean;
}[] = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "Tấn công" },
  { key: "defense", label: "Phòng thủ" },
  { key: "critRate", label: "Tỉ lệ chí mạng", isPercent: true },
  { key: "critDamage", label: "Sát thương chí mạng", isPercent: true },
  { key: "speed", label: "Tốc độ" },
  { key: "lifeSteal", label: "Hút máu", isPercent: true },
  { key: "cultivationSpeed", label: "Tốc độ tu luyện" },
];

function useInventory(playerId: string | undefined) {
  const [items, setItems] = useState<PlayerInventorySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!playerId) return;

    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${baseUrl}/api/player-inventories`, {
        method: "GET",
        credentials: "include",
      });

      const result: ServiceResult<PlayerInventorySlot[]> = await res.json();

      if (!result.success) {
        setError(result.message);
        return;
      }

      setItems(result.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load inventory.");
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    loading,
    error,
    refetch: load,
  };
}

/**
 * POSTs JSON and reports success. The response body is parsed defensively:
 * a void/204 endpoint (empty body) or a differently-shaped body must not
 * make a successful request look like a failure.
 */
async function postAction(
  url: string,
  body: unknown,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  let result: { success?: boolean; message?: string } | null = null;
  try {
    result = await res.json();
  } catch {
    result = null; // empty or non-JSON body
  }

  const ok = res.ok && result?.success !== false;
  return {
    ok,
    message:
      result?.message ??
      (res.ok ? undefined : `Request failed (${res.status})`),
  };
}

export function InventoryPanel({
  playerId,
  inventoryVersion,
  onInventoryChange,
}: InventoryPanelProps) {
  const { items, loading, error, refetch } = useInventory(playerId);
  const [selectedItem, setSelectedItem] =
    useState<GetPlayerInventoryResponse | null>(null);

  // Refetch whenever the shared inventory version bumps (e.g. an item was
  // unequipped from the stats panel and should reappear here).
  useEffect(() => {
    if (inventoryVersion === undefined) return;
    refetch();
    // Only re-run when the version itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryVersion]);

  // Second, independent trigger: refetch when another panel (the stats panel's
  // unequip) announces a change. Works synchronously, without depending on a
  // parent re-render.
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.source === "inventory") return; // our own
      refetch();
    };
    window.addEventListener(EQUIPMENT_CHANGED_EVENT, handler);
    return () => window.removeEventListener(EQUIPMENT_CHANGED_EVENT, handler);
  }, [refetch]);

  const handleUseItem = async () => {
    if (!selectedItem) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const { ok, message } = await postAction(
        `${baseUrl}/api/player-inventories/use`,
        { itemId: selectedItem.itemId, quantity: 1 },
      );

      if (!ok) {
        console.error(message ?? "Could not use item.");
        return;
      }

      // Close the details first so it closes even if a refetch is slow/fails.
      setSelectedItem(null);
      await refetch();

      // Tell sibling panels (e.g. PlayerStatsPanel) to refetch too.
      window.dispatchEvent(
        new CustomEvent(EQUIPMENT_CHANGED_EVENT, {
          detail: { source: "inventory" },
        }),
      );
      onInventoryChange?.();
    } catch (e) {
      console.error(e instanceof Error ? e.message : "Could not use item.");
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>Túi Đồ</div>

      {loading && <div className={styles.statusText}>Đang tải...</div>}
      {error && <div className={styles.statusText}>{error}</div>}

      {!loading && !error && (
        <div className={styles.grid}>
          {items.map((item, index) => (
            <button
              key={item?.itemId ?? `empty-${index}`}
              className={`${styles.slot} ${item ? styles.slotFilled : styles.slotEmpty}`}
              onClick={() => {
                if (item && item.itemId) {
                  setSelectedItem(item);
                }
              }}
              disabled={!item}
              aria-label={item ? item.itemName : "Ô trống"}
            >
              {item && (
                <>
                  <img
                    className={styles.slotImage}
                    src={item.itemImageUrl}
                    alt={item.itemName}
                  />
                  {item.quantity > 1 && (
                    <span className={styles.slotQuantity}>{item.quantity}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedItem && (
        <div
          className={styles.detailsOverlay}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className={styles.detailsCard}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.detailsClose}
              onClick={() => setSelectedItem(null)}
              aria-label="Đóng"
            >
              <svg
                viewBox="0 0 24 24"
                width={20}
                height={20}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#ffffff"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <g id="Menu / Close_LG">
                    <path
                      id="Vector"
                      d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </g>
                </g>
              </svg>
            </button>

            <img
              className={styles.detailsImage}
              src={selectedItem.itemImageUrl}
              alt={selectedItem.itemName}
            />
            <div className={styles.detailsName}>{selectedItem.itemName}</div>
            <div className={styles.detailsMeta}>
              {selectedItem.itemType}
              {selectedItem.quantity > 1 && ` · x${selectedItem.quantity}`}
            </div>

            {selectedItem.stats && (
              <div className={styles.detailsStats}>
                {STAT_LABELS.map(({ key, label, isPercent }) => {
                  const value = selectedItem.stats?.[key];
                  if (value === null || value === undefined) return null;
                  const display = isPercent
                    ? `${Math.round(value * 100)}%`
                    : value.toLocaleString();
                  return (
                    <div key={String(key)} className={styles.detailsStatRow}>
                      <span className={styles.detailsStatLabel}>{label}</span>
                      <span className={styles.detailsStatValue}>{display}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Combat Check Logic */}
            {selectedItem.combatOnly ? (
              <div className={styles.combatOnlyTag}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M19 1.48416e-05L23 0C23.2652 -9.53668e-07 23.5195 0.105355 23.7071 0.292891C23.8946 0.480426 24 0.73478 24 0.999997L24 5.00001C24 5.26523 23.8946 5.51958 23.7071 5.70712L11.9142 17.5L13.7071 19.2929C14.0976 19.6834 14.0976 20.3166 13.7071 20.7071C13.3166 21.0977 12.6834 21.0977 12.2929 20.7071L9.79289 18.2071L9.46376 17.878L5.9999 20.9955C6.00096 21.7635 5.70873 22.534 5.12132 23.1214C3.94975 24.293 2.05025 24.293 0.87868 23.1214C-0.292893 21.9498 -0.292893 20.0503 0.87868 18.8787C1.46607 18.2913 2.23647 17.9991 3.00451 18.0002L6.12202 14.5363L5.79287 14.2071L3.29289 11.7071C2.90237 11.3166 2.90237 10.6834 3.29289 10.2929C3.68342 9.90239 4.31658 9.90239 4.70711 10.2929L6.49998 12.0858L18.2929 0.292907C18.4804 0.105372 18.7348 1.57952e-05 19 1.48416e-05ZM7.91419 13.5L8.2071 13.7929L10.2071 15.7929L10.5 16.0858L22 4.5858L22 2L19.4142 2.00001L7.91419 13.5ZM7.53819 15.9524L5.00435 18.7678C5.0441 18.8035 5.08311 18.8405 5.12132 18.8787C5.15952 18.9169 5.19648 18.9559 5.23221 18.9957L8.04759 16.4618L7.53819 15.9524ZM3.20676 20.0214C2.88445 19.954 2.54009 20.0458 2.29289 20.293C1.90237 20.6835 1.90237 21.3166 2.29289 21.7072C2.68342 22.0977 3.31658 22.0977 3.70711 21.7072C3.95431 21.46 4.0461 21.1156 3.97862 20.7933C3.94032 20.6103 3.85075 20.4366 3.70711 20.293C3.56346 20.1493 3.3897 20.0597 3.20676 20.0214Z"
                      fill="#d6d6d6"
                    ></path>{" "}
                  </g>
                </svg>{" "}
                Chỉ dùng trong chiến đấu
              </div>
            ) : (
              <button className={styles.useButton} onClick={handleUseItem}>
                Sử Dụng
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
