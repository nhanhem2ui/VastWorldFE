import { useState, useEffect } from "react";
import type { PlayerResponse } from "@/types/PlayerResponse";
import type { ServiceResult } from "@/types/ServiceResult";

import { getAuthToken } from "@/shared/hooks/authSession";
import styles from "../assets/css/playerStatsPanel.module.css";
import { SPIRIT_ROOT_MAP } from "@/shared/constants/spiritRootMap";

const spiritRootCache = new Map<string, string[]>();

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

  const token = getAuthToken();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (spiritRootCache.has(playerId)) return;

    let cancelled = false;

    async function getPlayerSpiritRoots() {
      try {
        const res = await fetch(
          `${baseUrl}/api/player-spirit-roots/${playerId}`,
          { headers: { Authorization: `Bearer ${token}` } },
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
  }, [playerId, baseUrl, token]);

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

export function PlayerStatsPanel({ player }: { player: PlayerResponse }) {
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

      {/* Equipment — ready for items, empty slots for now */}
      <section className={`${styles.section} ${styles.sectionFuture}`}>
        <h3 className={styles.sectionTitle}>Trang bị</h3>
        <div className={styles.equipmentGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.equipSlot} aria-label="Ô trống" />
          ))}
        </div>
      </section>

      {/* Relics — placeholder */}
      <section className={`${styles.section} ${styles.sectionFuture}`}>
        <h3 className={styles.sectionTitle}>Bảo vật</h3>
        <div className={styles.relicGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.relicSlot} aria-label="Ô trống" />
          ))}
        </div>
      </section>
    </aside>
  );
}
