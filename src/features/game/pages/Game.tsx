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

const DESKTOP_BACKGROUNDS = [
  "src/shared/assets/img/places/desktop/bg1.png",
  "src/shared/assets/img/places/desktop/bg2.png",
];

const MOBILE_BACKGROUNDS = [
  "src/shared/assets/img/places/mobile/bg1_mobile.png",
  "src/shared/assets/img/places/mobile/bg2_mobile.png",
];

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

  // 'main' shows character, 'stats' shows stats panel, 'cultivate' shows meditation panel
  const [mobileView, setMobileView] = useState<"main" | "stats" | "cultivate">(
    "main",
  );

  if (playerLoading) return null;

  if (error) {
    setFlashMessage("Error joining the game");
    return <Navigate to={"/"} replace />;
  }

  if (player === null) {
    setFlashMessage("Player not exist, please create one");
    return <Navigate to={"/createPlayer"} replace />;
  }

  const backgrounds = isMobile ? MOBILE_BACKGROUNDS : DESKTOP_BACKGROUNDS;
  const bgSrc = backgrounds[bgIndex % backgrounds.length];
  const charSrc = player.gender
    ? "src/shared/assets/img/char/m_obs.png"
    : "src/shared/assets/img/char/f_obs.png";
  const spinningOrb = "src/shared/assets/animation/spinningOrb.gif";

  return (
    <section className={styles.main}>
      {/* Visual Canvas (Hidden on mobile if panels are taking full screen) */}
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
          <img className={styles.spinningOrb} src={spinningOrb} alt=""></img>
        </div>

        <NextBreakthroughPanel
          playerId={player.id}
          cultivationPoint={player.cultivationPoint}
          onBreakthrough={() => {
            // TODO: call the actual breakthrough endpoint, then refreshPlayer()
            console.log("Start breakthrough");
          }}
        />
      </div>

      {/* DESKTOP HUD (Only renders/behaves traditionally on desktop) */}
      {!isMobile && (
        <div className={styles.hud}>
          <div className={styles.hudLayoutContainer}>
            <div
              className={`${styles.statsPanel} ${
                showStatsPanel
                  ? styles.statsPanelVisible
                  : styles.statsPanelHidden
              }`}
            >
              <PlayerStatsPanel player={player} />
              <MeditationPanel
                playerId={player.id}
                cultivationSpeed={player.cultivationSpeed}
              />
            </div>
            <button
              className={`${styles.statsPanelToggle} ${
                showStatsPanel
                  ? styles.statsPanelToggleOpen
                  : styles.statsPanelToggleClose
              }`}
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

      {/* MOBILE HUD (Mutually exclusive panels to prevent overlapping) */}
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

          {/* Bottom Navigation for Mobile */}
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
