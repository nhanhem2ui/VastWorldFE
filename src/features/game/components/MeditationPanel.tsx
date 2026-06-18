import { useState, useEffect, useCallback } from "react";
import { getAuthToken } from "@/shared/hooks/authSession";
import styles from "../assets/css/meditationPanel.module.css";
import type { ServiceResult } from "@/types/ServiceResult";

interface GetPlayerMeditationByIdResponse {
  startTime: string; // LocalDateTime string
  endTime: string;
  cultivationPerMinute: number;
  totalCultivationReward: number;
  isClaimed: boolean;
}

interface MeditationPanelProps {
  playerId: string;
  cultivationSpeed: number;
}

const MAX_TOTAL_MINUTES = 1440; // 24 hours

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// ── FIXED: Hoisted out of parent to stop focus-loss and performance re-renders ──
interface DurationPickerProps {
  durationMinutes: number;
  setDurationMinutes: (mins: number) => void;
  disabled: boolean;
}

const DurationPicker = ({
  durationMinutes,
  setDurationMinutes,
  disabled,
}: DurationPickerProps) => {
  const currentHours = Math.floor(durationMinutes / 60);
  const currentMinutes = durationMinutes % 60;

  const handleSliderChange = (newHours: number, newMins: number) => {
    let total = newHours * 60 + newMins;

    // Enforce backend limits (1 to 1440 minutes)
    if (total > MAX_TOTAL_MINUTES) total = MAX_TOTAL_MINUTES;
    if (total < 1) total = 1;

    setDurationMinutes(total);
  };

  return (
    <div className={styles.durationPicker}>
      {/* Display Counter */}
      <div className={styles.durationDisplay}>
        <span>{currentHours}g</span>
        <span className={styles.durationSeparator}>:</span>
        <span>{currentMinutes}p</span>
      </div>

      <div className={styles.sliderGroup}>
        {/* Hours Slider */}
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>Giờ</span>
          <input
            type="range"
            min="0"
            max="24"
            value={currentHours}
            disabled={disabled}
            onChange={(e) =>
              handleSliderChange(parseInt(e.target.value) || 0, currentMinutes)
            }
            className={styles.durationSlider}
          />
        </div>

        {/* Minutes Slider */}
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>Phút</span>
          <input
            type="range"
            min="0"
            max="59"
            value={currentMinutes}
            disabled={disabled}
            onChange={(e) =>
              handleSliderChange(currentHours, parseInt(e.target.value) || 0)
            }
            className={styles.durationSlider}
          />
        </div>
      </div>
    </div>
  );
};

export function MeditationPanel({
  playerId,
  cultivationSpeed,
}: MeditationPanelProps) {
  const [meditation, setMeditation] =
    useState<GetPlayerMeditationByIdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const now = useNow();

  const token = getAuthToken();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchMeditation = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/api/player-meditations/${playerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) {
        setMeditation(null);
        return;
      }

      if (!res.ok) throw new Error("Không thể tải dữ liệu tu luyện.");
      const response: ServiceResult<GetPlayerMeditationByIdResponse> =
        await res.json();
      setMeditation(response.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  }, [playerId, baseUrl, token]);

  useEffect(() => {
    fetchMeditation();
  }, [fetchMeditation]);

  const handleBegin = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${baseUrl}/api/player-meditations/beginMeditate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ playerId, durationMinutes }),
        },
      );
      if (!res.ok) throw new Error("Không thể bắt đầu tu luyện.");
      await fetchMeditation();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaim = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${baseUrl}/api/player-meditations/claimMeditate/${playerId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Không thể nhận phần thưởng.");
      await fetchMeditation();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived state ─────────────────────────────────────────────
  const start = meditation
    ? new Date(meditation.startTime.replace("T", " "))
    : null;
  const end = meditation
    ? new Date(meditation.endTime.replace("T", " "))
    : null;

  const totalMs = start && end ? end.getTime() - start.getTime() : 0;
  const elapsedMs = start
    ? Math.min(now.getTime() - start.getTime(), totalMs)
    : 0;
  const progress =
    totalMs > 0 ? Math.max(0, Math.min(1, elapsedMs / totalMs)) : 0;

  const isComplete = end ? now >= end : false;
  const canClaim = isComplete && meditation && !meditation.isClaimed;

  // ── Render ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.panel} aria-label="Tu luyện">
        <div className={styles.dimText}>Đang tải…</div>
      </div>
    );
  }
  const currentReward = meditation
    ? Math.floor(meditation.totalCultivationReward * progress)
    : 0;
  return (
    <div className={styles.panel} aria-label="Tu luyện">
      {error && <p className={styles.errorText}>{error}</p>}

      {!meditation ? (
        /* ── No active session ── */
        <div className={styles.idleState}>
          <p className={styles.idleText}>
            <span className={styles.dimText}>
              Tốc độ tu luyện: {cultivationSpeed}
            </span>
          </p>
          <DurationPicker
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            disabled={actionLoading}
          />

          {/* ROUND IMAGE BUTTON */}
          <button
            className={styles.btnRoundCultivate}
            onClick={handleBegin}
            disabled={actionLoading}
            aria-label="Bắt đầu tu luyện"
          >
            <span className={styles.btnPulseRing}></span>
          </button>
        </div>
      ) : meditation.isClaimed ? (
        /* ── Already claimed ── */
        <div className={styles.claimedState}>
          <div className={styles.claimedGlyph} aria-hidden="true">
            ✦
          </div>
          <p className={styles.claimedText}>Phần thưởng đã được nhận.</p>
          <DurationPicker
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            disabled={actionLoading}
          />

          {/* ROUND IMAGE BUTTON (AGAIN) */}
          <button
            className={styles.btnRoundCultivate}
            onClick={handleBegin}
            disabled={actionLoading}
            aria-label="Tu luyện lần nữa"
          >
            <span className={styles.btnPulseRing}></span>
          </button>
        </div>
      ) : (
        /* ── Active session ── */
        <div className={styles.activeState}>
          {/* Time */}
          <div className={styles.timeRow}>
            <div className={styles.timeLabel}>
              <span className={styles.timeDot}></span>
              Đang tu luyện
            </div>

            <div className={styles.timeArrow}>
              {start?.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" → "}
              {end?.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Progress */}
          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressFill} ${
                isComplete ? styles.progressFillComplete : ""
              }`}
              style={{ width: `${progress * 100}%` }}
            />

            <div className={styles.progressLabel}>
              {(progress * 100).toFixed(0)}%
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statGrid}>
            <div className={styles.statLabel}>Tốc độ</div>
            <div className={styles.statValue}>
              {meditation.cultivationPerMinute}/phút
            </div>

            <div className={styles.statLabel}>Đã hấp thu</div>
            <div className={`${styles.statValue} ${styles.statValueGold}`}>
              {currentReward}
            </div>

            <div className={styles.statLabel}>Còn lại</div>
            <div className={styles.statValue}>
              {isComplete
                ? "Hoàn thành"
                : `${Math.ceil((end!.getTime() - now.getTime()) / 60000)} phút`}
            </div>
          </div>

          {/* Status */}
          {!isComplete && (
            <div className={styles.idleText}>Linh khí đang được hấp thu...</div>
          )}

          {canClaim && (
            <button
              className={styles.btnClaim}
              onClick={handleClaim}
              disabled={actionLoading}
            >
              {actionLoading ? "Đang nhận…" : "✦ Nhận phần thưởng"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
