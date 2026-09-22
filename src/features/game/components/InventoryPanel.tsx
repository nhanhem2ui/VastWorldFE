import { useEffect, useState } from "react";
import styles from "../assets/css/InventoryPanel.module.css";
import type { ServiceResult } from "@/types/ServiceResult";
import type {
  GetPlayerInventoryResponse,
  PlayerInventorySlot,
} from "../types/PlayerInventoryTypes";

interface InventoryPanelProps {
  playerId: string;
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

  const load = async () => {
    if (!playerId) return;
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${baseUrl}/api/player-inventories`, {
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
  };

  useEffect(() => {
    load();
  }, [playerId]);

  return { items, loading, error, refetch: load };
}

export function InventoryPanel({ playerId }: InventoryPanelProps) {
  const { items, loading, error } = useInventory(playerId);
  const [selectedItem, setSelectedItem] =
    useState<GetPlayerInventoryResponse | null>(null);

  const handleUseItem = () => {
    // TODO: implement "use item" call — no backend endpoint wired up yet.
    // e.g. POST `${baseUrl}/api/player-inventories/use/${selectedItem.itemId}`
    console.log("Use item requested:", selectedItem?.itemId);
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
              onClick={() => item && setSelectedItem(item)}
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
              ×
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

            <button className={styles.useButton} onClick={handleUseItem}>
              Sử Dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
