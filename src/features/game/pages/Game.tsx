import { Navigate } from "react-router-dom";
import { setFlashMessage } from "@/shared/hooks/flashMessage";
import { useState, useEffect } from "react";
import styles from "../assets/css/game.module.css";
import { PlayerStatsPanel } from "../components/PlayerStatsPanel";
import { usePlayer } from "@/shared/hooks/playerStore";

import btnMin from "@/shared/assets/img/common/btn_min.png";
import btnFull from "@/shared/assets/img/common/btn_full.png";
import { MeditationPanel } from "../components/MeditationPanel";
import { NextBreakthroughPanel } from "../components/NextBreakthroughPanel";
import FlashMessage from "@/shared/components/FlashMessage";

const DESKTOP_BACKGROUNDS = [
  "src/shared/assets/img/places/desktop/bg1.png",
  "src/shared/assets/img/places/desktop/bg2.png",
];

const MOBILE_BACKGROUNDS = [
  "src/shared/assets/img/places/mobile/bg1_mobile.png",
  "src/shared/assets/img/places/mobile/bg2_mobile.png",
];

const BREAKTHROUGH_SUCCESS =
  "src/shared/assets/animation/breakthrough-success.mp4";
const BREAKTHROUGH_FAILED =
  "src/shared/assets/img/char/breakthrough-failed.png";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function Game() {
  const { player, loading: playerLoading, error } = usePlayer();
  const isMobile = useIsMobile();
  const [bgIndex] = useState(0);
  const [showStatsPanel, setShowStatsPanel] = useState(true);
  const [mobileView, setMobileView] = useState<"main" | "stats" | "cultivate">(
    "main",
  );

  const [breakthroughState, setBreakthroughState] = useState<
    "idle" | "success" | "failed"
  >("idle");

  // Handles the instant results notification logic
  const handleBreakthroughResult = (result: "success" | "failed") => {
    setBreakthroughState(result);

    if (result === "failed") {
      setFlashMessage("Đột phá thất bại");

      setTimeout(() => {
        setBreakthroughState("idle");
      }, 3000);
    }
  };

  if (playerLoading) return null;

  if (error) {
    setFlashMessage("Lỗi vào game");
    return <Navigate to={"/"} replace />;
  }

  if (player === null) {
    setFlashMessage("Tu sĩ chưa được tạo");
    return <Navigate to={"/createPlayer"} replace />;
  }

  const backgrounds = isMobile ? MOBILE_BACKGROUNDS : DESKTOP_BACKGROUNDS;
  const bgSrc = backgrounds[bgIndex % backgrounds.length];
  const charSrc = player.gender
    ? "src/shared/assets/img/char/m_obs.png"
    : "src/shared/assets/img/char/f_obs.png";
  const spinningOrb = "src/shared/assets/animation/spinningOrb.gif";

  function breakthroughSuccess() {
    setBreakthroughState("idle");
    setFlashMessage("Đột phá thành công");
  }

  return (
    <section className={styles.main}>
      <FlashMessage />

      {/* Fullscreen Breakthrough Animation Overlay */}
      {breakthroughState !== "idle" && (
        <div
          className={styles.breakthroughOverlay}
          onClick={() => {
            if (breakthroughState === "success") {
              breakthroughSuccess();
            } else {
              setBreakthroughState("idle");
            }
          }}
        >
          {breakthroughState === "success" ? (
            <video
              className={styles.breakthroughMedia}
              src={BREAKTHROUGH_SUCCESS}
              autoPlay
              playsInline
              onEnded={breakthroughSuccess}
            />
          ) : (
            <img
              className={styles.breakthroughMedia}
              src={BREAKTHROUGH_FAILED}
              alt="Đột phá thất bại"
            />
          )}
        </div>
      )}

      {/* Visual Canvas */}
      <div
        className={`${styles.mainVisual} ${isMobile && mobileView !== "main" ? styles.hiddenMobile : ""}`}
      >
        <img
          className={styles.background}
          src={bgSrc}
          alt=""
          aria-hidden="true"
        />
        <div>
          <img
            className={styles.character}
            src={charSrc}
            alt={player.gender ? "Male character" : "Female character"}
          />
          <img className={styles.spinningOrb} src={spinningOrb} alt="" />
        </div>

        <NextBreakthroughPanel
          playerId={player.id}
          cultivationPoint={player.cultivationPoint}
          onBreakthroughResult={handleBreakthroughResult}
        />
      </div>

      {/* DESKTOP HUD */}
      {!isMobile && (
        <div className={styles.hud}>
          <div className={styles.hudLayoutContainer}>
            <div
              className={`${styles.statsPanel} ${showStatsPanel ? styles.statsPanelVisible : styles.statsPanelHidden}`}
            >
              <PlayerStatsPanel player={player} />
              <MeditationPanel
                playerId={player.id}
                cultivationSpeed={player.cultivationSpeed}
              />
            </div>
            <button
              className={`${styles.statsPanelToggle} ${showStatsPanel ? styles.statsPanelToggleOpen : styles.statsPanelToggleClose}`}
              onClick={() => setShowStatsPanel((v) => !v)}
              aria-label={
                showStatsPanel ? "Hide stats panel" : "Show stats panel"
              }
            >
              <img
                src={showStatsPanel ? btnMin : btnFull}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE HUD */}
      {isMobile && (
        <>
          <div className={styles.mobilePanelContainer}>
            {mobileView === "stats" && (
              <div className={styles.mobilePanelContent}>
                <PlayerStatsPanel player={player} />
              </div>
            )}
            {mobileView === "cultivate" && (
              <div className={styles.mobilePanelContent}>
                <MeditationPanel
                  playerId={player.id}
                  cultivationSpeed={player.cultivationSpeed}
                />
              </div>
            )}
          </div>

          <nav className={styles.mobileNavBar}>
            <button
              className={mobileView === "main" ? styles.activeTab : ""}
              onClick={() => setMobileView("main")}
            >
              View Game
            </button>
            <button
              className={mobileView === "stats" ? styles.activeTab : ""}
              onClick={() => setMobileView("stats")}
            >
              Stats
            </button>
            <button
              className={mobileView === "cultivate" ? styles.activeTab : ""}
              onClick={() => setMobileView("cultivate")}
            >
              Cultivate
            </button>
          </nav>
        </>
      )}
    </section>
  );
}

export default Game;
