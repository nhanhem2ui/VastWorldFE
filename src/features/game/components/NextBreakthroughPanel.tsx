import { useCallback, useEffect, useState } from "react";
import styles from "../assets/css/nextBreakthroughPanel.module.css";
import type { ServiceResult } from "@/types/ServiceResult";
import { refreshPlayer, usePlayer } from "@/shared/hooks/playerStore";
import { setFlashMessage } from "@/shared/hooks/flashMessage";
import type {
  NextBreakthroughPanelProps,
  NextBreakthroughResponse,
} from "../types/NextBreakthroughTypes";

function useNextBreakthrough(playerId: string | undefined) {
  const [data, setData] = useState<NextBreakthroughResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { player } = usePlayer();

  const load = useCallback(async () => {
    if (!playerId) return;

    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${baseUrl}/api/players/nextBreakthrough`, {
        credentials: "include",
      });

      const result: ServiceResult<NextBreakthroughResponse> = await res.json();

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
  }, [playerId, player?.cultivationPoint, player?.realmId, player?.realmStage]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    player,
    refetch: load,
  };
}

export function NextBreakthroughPanel({
  playerId,
  cultivationPoint,
  onBreakthroughResult,
}: NextBreakthroughPanelProps) {
  const { data, loading, error, player, refetch } =
    useNextBreakthrough(playerId);
  const [isBreakingThrough, setIsBreakingThrough] = useState(false);

  const handleBreakthrough = async () => {
    try {
      setIsBreakingThrough(true);

      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(
        `${baseUrl}/api/players/breakthrough/${playerId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const result: ServiceResult<void> = await res.json();

      setFlashMessage(result.message);

      if (!result.success) {
        onBreakthroughResult("failed");
        return;
      }

      // 1. Synchronize player state from server first
      await refreshPlayer();

      // 2. Refetch breakthrough threshold for the new realm/stage
      await refetch();

      // 3. Trigger UI success animations
      onBreakthroughResult("success");
    } catch (e) {
      onBreakthroughResult("failed");
    } finally {
      setIsBreakingThrough(false);
    }
  };

  if (loading || error || !data) return null;
  const { isTribulation, breakthroughPoints, chanceOfSuccess } = data;
  const progress =
    breakthroughPoints > 0
      ? Math.min(100, (cultivationPoint / breakthroughPoints) * 100)
      : 0;
  const isReady = cultivationPoint >= breakthroughPoints;

  return (
    <div className={styles.panel}>
      {isTribulation && <div className={styles.tribulationBadge}>Độ Kiếp</div>}
      <div className={styles.realmText}>
        {player?.realmName}{" "}
        <span className={styles.stageText}>{player?.realmStageName}</span>
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
        <button
          className={styles.breakthroughButton}
          onClick={handleBreakthrough}
          disabled={isBreakingThrough}
        >
          {isBreakingThrough ? "Đang đột phá..." : "Đột Phá"}
        </button>
      )}
    </div>
  );
}
