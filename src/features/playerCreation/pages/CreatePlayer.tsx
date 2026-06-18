import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import FlashMessage from "@/shared/components/FlashMessage";
import {
  getAuthToken,
  getStoredUser,
  isAuthenticated,
} from "@/shared/hooks/authSession";
import { setFlashMessage } from "@/shared/hooks/flashMessage";
import { sleep } from "@/shared/hooks/sleep";
import type { ServiceResult } from "@/types/ServiceResult";
import styles from "../assets/css/createPlayerGame.module.css";
import { usePlayerSpiritRoot } from "@/shared/hooks/checkPlayer";
import type { PlayerResponse } from "@/types/PlayerResponse";
import type { RollSpiritRootResponse } from "@/types/RollSpiritRootResponse";
import { SPIRIT_ROOT_MAP } from "@/shared/constants/spiritRootMap";
import { usePlayer } from "@/shared/hooks/playerStore";

function OrbWrapper({
  name,
  index,
  isVariant,
  revealKey,
}: {
  name: string;
  index: number;
  isVariant: boolean;
  revealKey: number;
}) {
  const Component = SPIRIT_ROOT_MAP[name.toLowerCase()];
  if (!Component) return <span>{name}</span>;

  let animClass: string;
  let delay: string;

  if (index === 0) {
    animClass = styles.orbEnter;
    delay = "0s";
  } else if (index === 1 && isVariant) {
    animClass = styles.orbVariantSecondary;
    delay = "0.5s";
  } else if (index === 2 && isVariant) {
    animClass = styles.orbVariantTertiary;
    delay = "0.7s";
  } else if (index >= 3) {
    animClass = styles.orbEnterFast;
    delay = `${0.1 + index * 0.1}s`;
  } else {
    animClass = styles.orbEnter;
    delay = `${index * 0.15}s`;
  }

  return (
    <span
      key={`${revealKey}-${name}`}
      className={animClass}
      style={{ animationDelay: delay }}
    >
      <span className={styles.orbInner}>
        <Component />
        <span className={styles.orbLabel}>{name}</span>
      </span>
    </span>
  );
}

type Rarity = "legendary" | "epic" | "normal";

const RARITY_LABELS: Record<Rarity, string> = {
  legendary: "✦  Thiên linh căn  ✦",
  epic: "✦  Chân linh căn  ✦",
  normal: "◈  Ngụy linh căn  ◈",
};

const RARITY_CLASS: Record<Rarity, string> = {
  legendary: styles.rarityLegendary,
  epic: styles.rarityEpic,
  normal: styles.rarityNormal,
};

function SpiritRootRollPhase({
  playerId,
  token,
  baseUrl,
}: {
  playerId: string;
  token: string;
  baseUrl: string;
}) {
  const navigate = useNavigate();

  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState<RollSpiritRootResponse | null>(
    null,
  );
  const [rollMessage, setRollMessage] = useState("");
  const [hasRolled, setHasRolled] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

  async function handleRoll() {
    setIsRolling(true);
    setRollMessage("");

    try {
      const response = await fetch(
        `${baseUrl}/api/player-spirit-roots/roll/${playerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result: ServiceResult<RollSpiritRootResponse> =
        await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Roll failed.");
      }

      setRollResult(result.data);
      setHasRolled(true);
      setRevealKey((k) => k + 1);
    } catch (error) {
      setRollMessage(error instanceof Error ? error.message : "Roll failed.");
    } finally {
      setIsRolling(false);
    }
  }

  async function handleContinue() {
    setFlashMessage("Player created successfully");
    await sleep(300);
    navigate("/game");
  }

  const remainingRolls = rollResult?.remainingRollNum ?? null;
  const canRollAgain = remainingRolls === null || remainingRolls > 0;
  let rarity: Rarity | null = null;

  if (rollResult) {
    const count = rollResult.spiritRoots.length;
    rarity =
      rollResult.isVariantRoll || (count >= 2 && count <= 3)
        ? "epic"
        : count === 1
          ? "legendary"
          : "normal";
  }

  return (
    <div className={`${styles.card} ${styles.cardWide}`}>
      <div className={styles.cardHeader}>
        <p className={styles.eyebrow}>Linh căn</p>
        <h2 id="create-player-title">Tìm ra linh căn của bạn</h2>
      </div>

      <p className={styles.rollDescription}>
        Trước khi bước vào Đại thiên thế giới, bạn phải thức tỉnh linh căn của
        mình — thiên phú nguyên tố quyết định con đường tu luyện của bạn với tư
        cách là một tu sĩ.
      </p>

      {isRolling && <p className={styles.scanning}>Truy tìm đạo vận..</p>}

      {rollResult !== null && !isRolling && rarity && (
        <div
          key={revealKey}
          className={`${styles.rarityBackdrop} ${RARITY_CLASS[rarity]}`}
        >
          <div className={styles.burst} />

          {rollResult.isVariantRoll ? (
            <p className={styles.variantLabel}>✦ Dị linh căn ✦</p>
          ) : (
            <p className={styles.rarityLabel}>{RARITY_LABELS[rarity]}</p>
          )}

          <div className={styles.orbList}>
            {rollResult.spiritRoots.map((sr, i) => (
              <OrbWrapper
                key={sr.spiritRootName}
                name={sr.spiritRootName}
                index={i}
                isVariant={rollResult.isVariantRoll}
                revealKey={revealKey}
              />
            ))}
          </div>

          {remainingRolls !== null && (
            <p className={styles.remaining}>
              {remainingRolls > 0
                ? `${remainingRolls} roll${remainingRolls > 1 ? "s" : ""} remaining`
                : "No rolls remaining"}
            </p>
          )}
        </div>
      )}

      {rollMessage && <p className={styles.message}>{rollMessage}</p>}

      <div className={styles.actions}>
        {canRollAgain && (
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type="button"
            onClick={handleRoll}
            disabled={isRolling}
          >
            {isRolling
              ? "Rolling…"
              : hasRolled
                ? "Roll again"
                : "Roll spirit root"}
          </button>
        )}

        {hasRolled && !isRolling && (
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            type="button"
            onClick={handleContinue}
          >
            Chọn &amp; tiếp tục
          </button>
        )}
      </div>
    </div>
  );
}

type Phase = "create" | "roll";

function CreatePlayer() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>("create");
  const [createdPlayerId, setCreatedPlayerId] = useState<string | null>(null);

  const { player, loading, error } = usePlayer();
  const { spiritRoots, loading: rootsLoading } = usePlayerSpiritRoot();
  const token = getAuthToken();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (player && spiritRoots !== null) {
      const needsToRoll = spiritRoots.length === 0;

      if (needsToRoll) {
        setCreatedPlayerId(player.id);
        setPhase("roll");
      }
    }
  }, [player, spiritRoots]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const user = getStoredUser();

    const createPlayerRequest = {
      accountId: user?.userID,
      gender: formData.get("gender") === "male",
    };

    try {
      const response = await fetch(`${baseUrl}/api/players/playable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPlayerRequest),
      });

      const result: ServiceResult<PlayerResponse> = await response.json();
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Create player failed.");
      }

      setCreatedPlayerId(result.data.id);
      setPhase("roll");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Create player failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <FlashMessage />

      <section className={styles.panel} aria-labelledby="create-player-title">
        {(loading || (player && rootsLoading)) && phase === "create" ? (
          <div className={styles.card}>
            <p className={styles.messageNeutral}>Tìm tu tiên giả..</p>
          </div>
        ) : phase === "roll" && createdPlayerId ? (
          <SpiritRootRollPhase
            playerId={createdPlayerId}
            token={token ?? ""}
            baseUrl={baseUrl}
          />
        ) : (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 id="create-player-title">Tạo tu tiên giả</h2>
            </div>

            {loading ? (
              <p className={styles.messageNeutral}>Tìm tu tiên giả..</p>
            ) : player ? (
              <div className={styles.form}>
                <p className={styles.messageNeutral}>Player đã tồn tại</p>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  type="button"
                  onClick={() => navigate("/game")}
                >
                  Continue
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <fieldset className={styles.fieldset}>
                  <legend>Select gender</legend>

                  <label className={styles.radioOption} htmlFor="gender-male">
                    <input
                      id="gender-male"
                      name="gender"
                      type="radio"
                      value="male"
                      required
                    />
                    <span>Male</span>
                  </label>

                  <label className={styles.radioOption} htmlFor="gender-female">
                    <input
                      id="gender-female"
                      name="gender"
                      type="radio"
                      value="female"
                    />
                    <span>Female</span>
                  </label>
                </fieldset>

                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating player…" : "Create player"}
                </button>

                {(message || error) && (
                  <p className={styles.message}>{message || error}</p>
                )}
              </form>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default CreatePlayer;
