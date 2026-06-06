import { useState, type FormEvent, type JSX } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import FlashMessage from "../components/FlashMessage";
import {
  getAuthToken,
  getStoredUser,
  isAuthenticated,
} from "../hooks/authSession";
import { setFlashMessage } from "../hooks/flashMessage";
import { sleep } from "../hooks/sleep";
import type { ServiceResult } from "../types/ServiceResult";
import styles from "../assets/css/createPlayerGame.module.css";
import { useExistingPlayer } from "../hooks/checkPlayer";
import type { PlayerResponse } from "../types/PlayerResponse";
import "../assets/css/spiritRoots.css";
import {
  MetalSpiritRoot,
  WoodSpiritRoot,
  WaterSpiritRoot,
  FireSpiritRoot,
  EarthSpiritRoot,
  WindSpiritRoot,
  LightningSpiritRoot,
  IceSpiritRoot,
  LightSpiritRoot,
  DarkSpiritRoot,
} from "../components/SpiritRoots";
import type { RollSpiritRootResponse } from "../types/RollSpiritRootResponse";

// ─── Spirit root map ──────────────────────────────────────────────────────────

const SPIRIT_ROOT_MAP: Record<string, () => JSX.Element> = {
  // English keys
  metal: MetalSpiritRoot,
  wood: WoodSpiritRoot,
  water: WaterSpiritRoot,
  fire: FireSpiritRoot,
  earth: EarthSpiritRoot,
  wind: WindSpiritRoot,
  lightning: LightningSpiritRoot,
  ice: IceSpiritRoot,
  light: LightSpiritRoot,
  dark: DarkSpiritRoot,

  // Vietnamese keys
  kim: MetalSpiritRoot,
  mộc: WoodSpiritRoot,
  thủy: WaterSpiritRoot,
  hỏa: FireSpiritRoot,
  thổ: EarthSpiritRoot,
  phong: WindSpiritRoot,
  lôi: LightningSpiritRoot,
  băng: IceSpiritRoot,
  quang: LightSpiritRoot,
  ám: DarkSpiritRoot,
};

// ─── Orb wrapper — picks the right entrance class per position ────────────────
//
// Animation strategy:
//   index 0              → orbEnter       (rises from below, white flash)
//   index 1, isVariant   → orbVariantSecondary (orbits around first orb, slams in)
//   index 2, isVariant   → orbVariantTertiary  (spiral from opposite side)
//   index 1–2, normal    → orbEnter with stagger delay
//   index 3–4            → orbEnterFast   (quick drop, less fanfare)
//
// display:inline-block on the wrapper is critical — display:contents would
// make filter/transform no-ops, so animations wouldn't be visible.

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

  // Update the return statement here:
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

// ─── Rarity helpers ───────────────────────────────────────────────────────────

type Rarity = "legendary" | "epic" | "normal";

function getRarity(roll: RollSpiritRootResponse): Rarity {
  if (roll.isVariantRoll) return "epic";
  if (roll.spiritRoots.length === 1) return "legendary";
  if (roll.spiritRoots.length >= 2 && roll.spiritRoots.length <= 3)
    return "epic";
  return "normal";
}

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

// ─── Spirit Root Roll Phase ───────────────────────────────────────────────────

interface SpiritRootRollPhaseProps {
  playerId: string;
  token: string;
  baseUrl: string;
}

function SpiritRootRollPhase({
  playerId,
  token,
  baseUrl,
}: SpiritRootRollPhaseProps) {
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
  const rarity = rollResult ? getRarity(rollResult) : null;

  return (
    <div className={`${styles.card} ${styles.cardWide}`}>
      <div className={styles.cardHeader}>
        <p className={styles.eyebrow}>Spirit Root</p>
        <h2 id="create-player-title">Awaken your spirit root</h2>
      </div>

      <p className={styles.rollDescription}>
        Before entering VastWorld, you must awaken your spirit root — the
        elemental affinity that defines your path as a cultivator.
      </p>

      {isRolling && <p className={styles.scanning}>Scanning heavenly fate…</p>}

      {rollResult !== null && !isRolling && rarity && (
        <div
          key={revealKey}
          className={`${styles.rarityBackdrop} ${RARITY_CLASS[rarity]}`}
        >
          {/* Burst ring re-fires on every new reveal via key remount */}
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
            Accept &amp; continue
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Phase = "create" | "roll";

function CreatePlayer() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>("create");
  const [createdPlayerId, setCreatedPlayerId] = useState<string | null>(null);

  const { player, loading, error } = useExistingPlayer();

  const token = getAuthToken();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

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
        {phase === "roll" && createdPlayerId ? (
          <SpiritRootRollPhase
            playerId={createdPlayerId}
            token={token ?? ""}
            baseUrl={baseUrl}
          />
        ) : (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.eyebrow}>First character</p>
              <h2 id="create-player-title">Create player</h2>
            </div>

            {loading ? (
              <p className={styles.messageNeutral}>Checking your player…</p>
            ) : player ? (
              <div className={styles.form}>
                <p className={styles.messageNeutral}>
                  A player already exists.
                </p>
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
