import { useState, type FormEvent, type JSX } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import FlashMessage from "../components/FlashMessage";
import Navbar from "../components/Navbar";
import {
  getAuthToken,
  getStoredUser,
  isAuthenticated,
} from "../hooks/authSession";
import { setFlashMessage } from "../hooks/flashMessage";
import { sleep } from "../hooks/sleep";
import type { ServiceResult } from "../types/ServiceResult";
import "../assets/css/createPlayer.css";
import { useExistingPlayer } from "../hooks/checkPlayer";
import type { PlayerResponse } from "../types/PlayerResponse";
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

interface PlayerSpiritRootDTO {
  id: string;
  spiritRootName: string;
  isVariant: boolean;
}

interface RollSpiritRootDTO {
  playerId: string;
  remainingRollNum: number;
  isVariantRoll: boolean;
  spiritRoots: PlayerSpiritRootDTO[];
}

const SPIRIT_ROOT_MAP: Record<string, () => JSX.Element> = {
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
};

function SpiritRootBadge({ name }: { name: string }) {
  const Component = SPIRIT_ROOT_MAP[name.toLowerCase()];
  if (!Component) return <span className="spiritRoot unknown">{name}</span>;
  return <Component />;
}

// ─── Spirit Root Roll Phase ──────────────────────────────────────────────────

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
  const [rollResult, setRollResult] = useState<RollSpiritRootDTO | null>(null);
  const [rollMessage, setRollMessage] = useState("");
  const [hasRolled, setHasRolled] = useState(false);

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

      const result: ServiceResult<RollSpiritRootDTO> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Roll failed.");
      }

      setRollResult(result.data);
      setHasRolled(true);
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

  return (
    <div className="login-card create-player-card spirit-roll-card">
      <div className="login-card-header">
        <p className="eyebrow">Spirit Root</p>
        <h2 id="create-player-title">Awaken your spirit root</h2>
      </div>

      <p className="spirit-roll-description">
        Before entering VastWorld, you must awaken your spirit root — the
        elemental affinity that defines your path as a cultivator.
      </p>

      {rollResult !== null && (
        <div
          className={`spirit-roll-result ${rollResult.isVariantRoll ? "is-variant" : ""}`}
        >
          {rollResult.isVariantRoll && (
            <p className="spirit-roll-variant-label">✦ Variant Spirit Root ✦</p>
          )}

          <div className="spirit-root-list">
            {rollResult.spiritRoots.map((sr) => (
              <SpiritRootBadge
                key={sr.spiritRootName}
                name={sr.spiritRootName}
              />
            ))}
          </div>

          {remainingRolls !== null && (
            <p className="spirit-roll-remaining">
              {remainingRolls > 0
                ? `${remainingRolls} roll${remainingRolls > 1 ? "s" : ""} remaining`
                : "No rolls remaining"}
            </p>
          )}
        </div>
      )}

      {rollMessage && <p className="login-message">{rollMessage}</p>}

      <div className="spirit-roll-actions">
        {canRollAgain && (
          <button
            className="button primary login-submit"
            type="button"
            onClick={handleRoll}
            disabled={isRolling}
          >
            {isRolling
              ? "Rolling..."
              : hasRolled
                ? "Roll again"
                : "Roll spirit root"}
          </button>
        )}

        {hasRolled && (
          <button
            className="button secondary login-submit"
            type="button"
            onClick={handleContinue}
          >
            Accept & continue
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

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
    <main className="login-page create-player-page">
      <Navbar />

      <FlashMessage />

      <section
        className="login-visual"
        aria-label="Create your VastWorld player"
      >
        <a className="login-brand" href="/">
          VastWorld
        </a>

        <div className="login-copy">
          <p className="eyebrow">Tạo nhân vật</p>

          <h1>Create your player.</h1>

          <p>
            Choose the identity you will use before entering VastWorld for the
            first time.
          </p>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="create-player-title">
        {phase === "roll" && createdPlayerId ? (
          <SpiritRootRollPhase
            playerId={createdPlayerId}
            token={token ?? ""}
            baseUrl={baseUrl}
          />
        ) : (
          <div className="login-card create-player-card">
            <div className="login-card-header">
              <p className="eyebrow">First character</p>

              <h2 id="create-player-title">Create player</h2>
            </div>

            {loading ? (
              <p className="login-message">Checking your player...</p>
            ) : player ? (
              <div className="login-form">
                <p className="login-message">A player already exists.</p>

                <button
                  className="button primary login-submit"
                  type="button"
                  onClick={() => navigate("/game")}
                >
                  Continue
                </button>
              </div>
            ) : (
              <form className="login-form" onSubmit={handleSubmit}>
                <fieldset className="choice-field">
                  <legend>Select gender</legend>

                  <label className="remember-option" htmlFor="gender-male">
                    <input
                      id="gender-male"
                      name="gender"
                      type="radio"
                      value="male"
                      required
                    />

                    <span>Male</span>
                  </label>

                  <label className="remember-option" htmlFor="gender-female">
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
                  className="button primary login-submit"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating player..." : "Create player"}
                </button>

                {(message || error) && (
                  <p className="login-message">{message || error}</p>
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
