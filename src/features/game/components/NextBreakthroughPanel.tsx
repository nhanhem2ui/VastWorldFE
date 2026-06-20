import { useEffect, useState } from "react";
import styles from "../assets/css/nextBreakthroughPanel.module.css";
import { getAuthToken } from "@/shared/hooks/authSession";
import type { ServiceResult } from "@/types/ServiceResult";
import { usePlayer } from "@/shared/hooks/playerStore";

interface NextBreakthroughResponse {
  nextRealm: string;
  nextStage: string;
  isTribulation: boolean;
  breakthroughPoints: number;
  chanceOfSuccess: number;
}

function useNextBreakthrough(playerId: string | undefined) {
  const [data, setData] = useState<NextBreakthroughResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { player } = usePlayer();

  useEffect(() => {
    if (!playerId) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = getAuthToken();

        const res = await fetch(
          `${baseUrl}/api/players/nextBreakthrough/${playerId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result: ServiceResult<NextBreakthroughResponse> =
          await res.json();

        if (!result.success) {
          setError(result.message);
          return;
        }

        setData(result.data);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Could not load breakthrough info.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [playerId, player?.cultivationPoint, player?.realmId, player?.realmStage]);

  return { data, loading, error };
}

interface NextBreakthroughPanelProps {
  playerId: string;
  cultivationPoint: number;
  onBreakthrough?: () => void;
}

export function NextBreakthroughPanel({
  playerId,
  cultivationPoint,
  onBreakthrough,
}: NextBreakthroughPanelProps) {
  const { data, loading, error } = useNextBreakthrough(playerId);

  if (loading || error || !data) {
    return null;
  }

  const {
    nextRealm,
    nextStage,
    isTribulation,
    breakthroughPoints,
    chanceOfSuccess,
  } = data;

  const progress =
    breakthroughPoints > 0
      ? Math.min(100, (cultivationPoint / breakthroughPoints) * 100)
      : 0;

  const isReady = cultivationPoint >= breakthroughPoints;

  return (
    <div className={styles.panel}>
      {isTribulation && (
        <div className={styles.tribulationBadge}>⚡ Độ Kiếp</div>
      )}

      <div className={styles.realmText}>
        {nextRealm} <span className={styles.stageText}>{nextStage}</span>
      </div>

      <div className={styles.barTrack}>
        <div
          className={`${styles.barFill} ${isReady ? styles.barFillReady : ""}`}
          style={{ width: `${progress}%` }}
        />
        <span className={styles.barLabel}>
          {Math.floor(cultivationPoint).toLocaleString()} /{" "}
          {breakthroughPoints.toLocaleString()}
        </span>
      </div>

      <div className={styles.chanceText}>
        Tỷ lệ thành công: {Math.round(chanceOfSuccess * 100)}%
      </div>

      {isReady && (
        <button className={styles.breakthroughButton} onClick={onBreakthrough}>
          Đột Phá
        </button>
      )}
    </div>
  );
}
