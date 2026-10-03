import { useCallback, useEffect, useState } from "react";
import type { PlayerResponse } from "@/types/PlayerResponse";
import type { ServiceResult } from "@/types/ServiceResult";
import styles from "../assets/css/playerStatsPanel.module.css";
import { SPIRIT_ROOT_MAP } from "@/shared/constants/spiritRootMap";
import {
  EQUIPMENT_CHANGED_EVENT,
  EQUIPMENT_SLOT_TYPES,
  type GetEquipmentsResponse,
} from "../types/PlayerInventoryTypes";

const spiritRootCache = new Map<string, string[]>();

const STAT_LABELS: {
  key: keyof GetEquipmentsResponse["statsOfItem"];
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

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>{value}</dd>
    </>
  );
}

function SpiritRoots({ playerId }: { playerId: string }) {
  const cached = spiritRootCache.get(playerId);
  const [roots, setRoots] = useState<string[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (spiritRootCache.has(playerId)) return;

    let cancelled = false;

    async function getPlayerSpiritRoots() {
      try {
        const res = await fetch(
          `${baseUrl}/api/player-spirit-roots/${playerId}`,
          { credentials: "include" },
        );
        const result: ServiceResult<string[]> = await res.json();
        if (!res.ok || !result.success || !result.data) return;
        if (!cancelled) {
          spiritRootCache.set(playerId, result.data);
          setRoots(result.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getPlayerSpiritRoots();
    return () => {
      cancelled = true;
    };
  }, [playerId, baseUrl]);

  if (loading) return <span className={styles.dimText}>…</span>;
  if (roots.length === 0) return <span className={styles.dimText}>—</span>;

  return (
    <>
      {roots.map((name) => {
        const Component = SPIRIT_ROOT_MAP[name.toLowerCase()];
        return (
          <span key={name} className={styles.rootOrb}>
            {Component ? <Component /> : null}
            <span className={styles.rootLabel}>{name}</span>
          </span>
        );
      })}
    </>
  );
}

function useEquippedItems(playerId: string | undefined) {
  const [equipments, setEquipments] = useState<GetEquipmentsResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!playerId) return;

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${baseUrl}/api/player-inventories/equipments`, {
        method: "GET",
        credentials: "include",
      });

      const result: ServiceResult<GetEquipmentsResponse[]> = await res.json();

      if (!res.ok || !result.success) return;
      setEquipments(result.data ?? []);
    } catch (e) {
      console.error(
        e instanceof Error ? e.message : "Could not load equipments.",
      );
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    load();
  }, [load]);

  return { equipments, loading, refetch: load };
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

interface PlayerStatsPanelProps {
  player: PlayerResponse;
  /**
   * Bump this number (e.g. a counter kept in the parent) whenever an item is
   * equipped or unequipped somewhere else — like the inventory panel — so
   * this panel knows to refetch its equipped items. This is more reliable
   * than a global window event because it doesn't depend on this component
   * still being mounted/listening at the exact moment the event fires.
   */
  inventoryVersion?: number;
  /**
   * Called after this panel changes what's equipped (unequipping), so
   * sibling panels — like the inventory — know to refetch too, since the
   * unequipped item goes back into the inventory.
   */
  onInventoryChange?: () => void;
}

export function PlayerStatsPanel({
  player,
  inventoryVersion,
  onInventoryChange,
}: PlayerStatsPanelProps) {
  const {
    equipments,
    loading: equipmentsLoading,
    refetch: refetchEquipments,
  } = useEquippedItems(player.id);
  const [selectedEquipment, setSelectedEquipment] =
    useState<GetEquipmentsResponse | null>(null);
  const [unequipping, setUnequipping] = useState(false);

  // Refetch whenever the shared inventory/equipment version bumps (e.g. an
  // item was equipped from the inventory panel).
  useEffect(() => {
    if (inventoryVersion === undefined) return;
    refetchEquipments();
    // Only re-run when the version itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryVersion]);

  // Second, independent trigger: refetch when another panel (the inventory's
  // "use") announces a change. Works synchronously, without depending on a
  // parent re-render.
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.source === "equipment") return; // our own
      refetchEquipments();
    };
    window.addEventListener(EQUIPMENT_CHANGED_EVENT, handler);
    return () => window.removeEventListener(EQUIPMENT_CHANGED_EVENT, handler);
  }, [refetchEquipments]);

  const handleUnequip = async () => {
    if (!selectedEquipment) return;

    setUnequipping(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const { ok, message } = await postAction(
        `${baseUrl}/api/player-inventories/unequip`,
        {
          id: selectedEquipment.id,
          equipmentSlotType: selectedEquipment.equipmentSlotType,
        },
      );

      if (!ok) {
        console.error(message ?? "Could not unequip item.");
        return;
      }

      // Close the details first so it closes even if a refetch is slow/fails.
      setSelectedEquipment(null);
      await refetchEquipments();

      // The item goes back to the inventory — let it know to refetch.
      window.dispatchEvent(
        new CustomEvent(EQUIPMENT_CHANGED_EVENT, {
          detail: { source: "equipment" },
        }),
      );
      onInventoryChange?.();
    } catch (e) {
      console.error(e instanceof Error ? e.message : "Could not unequip item.");
    } finally {
      setUnequipping(false);
    }
  };

  return (
    <aside className={styles.panel} aria-label="Player stats">
      {/* Identity */}
      <header className={styles.identity}>
        <p className={styles.eyebrow}>{player.realmName}</p>
        <p className={styles.stageName}>{player.realmStageName}</p>
        <h2 className={styles.playerName}>{player.accountUsername}</h2>
      </header>

      {/* Spirit roots */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Linh căn</h3>
        <div className={styles.spiritRootList}>
          <SpiritRoots playerId={player.id} />
        </div>
      </section>

      {/* Combat */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Chiến đấu</h3>
        <dl className={styles.statGrid}>
          <StatRow label="HP" value={player.hp} />
          <StatRow label="Tấn công" value={player.attack} />
          <StatRow label="Phòng thủ" value={player.defense} />
          <StatRow label="Tỉ lệ chí mạng" value={`${player.critRate}%`} />
          <StatRow
            label="Sát thương chí mạng"
            value={`${player.critDamage}%`}
          />
          <StatRow label="Tốc độ" value={player.speed} />
          <StatRow label="Hút máu" value={`${player.lifeSteal}%`} />
          <StatRow label="Tốc độ tu luyện" value={player.cultivationSpeed} />
        </dl>
      </section>

      {/* Resources */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Tài nguyên</h3>
        <dl className={styles.statGrid}>
          <StatRow
            label="Tu vi"
            value={(player.cultivationPoint ?? 0).toLocaleString()}
          />
          <StatRow
            label="Danh tiếng"
            value={(player.reputation ?? 0).toLocaleString()}
          />
          <StatRow
            label="Linh thạch"
            value={(player.spiritStone ?? 0).toLocaleString()}
          />
        </dl>
      </section>

      {/* Equipment — backed by GET /api/player-inventories/equipments */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Trang bị</h3>
        <div className={styles.equipmentGrid}>
          {EQUIPMENT_SLOT_TYPES.map((slotType) => {
            const found = equipments.find(
              (e) => e.equipmentSlotType?.toUpperCase() === slotType,
            );
            // A slot only counts as filled if the item is real (has an itemId).
            const equipped = found && found.itemId ? found : undefined;
            return (
              <button
                key={slotType}
                type="button"
                className={`${styles.equipSlot} ${
                  equipped ? styles.equipSlotFilled : ""
                }`}
                onClick={() => {
                  if (equipped && equipped.itemId) {
                    setSelectedEquipment(equipped);
                  }
                }}
                disabled={!equipped}
                aria-label={equipped ? equipped.itemName : "Ô trống"}
                title={equipped?.itemName}
              >
                {!equipmentsLoading && equipped && (
                  <img
                    className={styles.equipSlotImage}
                    src={equipped.itemImageUrl}
                    alt={equipped.itemName}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/*TODO: api Relics */}
      <section className={`${styles.section} ${styles.sectionFuture}`}>
        <h3 className={styles.sectionTitle}>Bảo vật</h3>
        <div className={styles.relicGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.relicSlot} aria-label="Ô trống" />
          ))}
        </div>
      </section>

      {/* Equipped item details modal */}
      {selectedEquipment && selectedEquipment.itemId && (
        <div
          className={styles.detailsOverlay}
          onClick={() => setSelectedEquipment(null)}
        >
          <div
            className={styles.detailsCard}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.detailsClose}
              onClick={() => setSelectedEquipment(null)}
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
                <path
                  d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>

            <img
              className={styles.detailsImage}
              src={selectedEquipment.itemImageUrl}
              alt={selectedEquipment.itemName}
            />
            <div className={styles.detailsName}>
              {selectedEquipment.itemName}
            </div>
            <div className={styles.detailsMeta}>
              {selectedEquipment.equipmentSlotType}
            </div>

            <div className={styles.detailsStats}>
              {STAT_LABELS.map(({ key, label, isPercent }) => {
                const value = selectedEquipment.statsOfItem?.[key];
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

            <button
              className={styles.unequipButton}
              onClick={handleUnequip}
              disabled={unequipping}
            >
              {unequipping ? "Đang tháo..." : "Tháo Trang Bị"}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
