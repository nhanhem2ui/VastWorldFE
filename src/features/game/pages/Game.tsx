import { Navigate } from "react-router-dom";
import { useExistingPlayer } from "@/shared/hooks/checkPlayer";
import { setFlashMessage } from "@/shared/hooks/flashMessage";
import { useState, useEffect } from "react";
import styles from "../assets/css/game.module.css";
import { PlayerStatsPanel } from "../components/PlayerStatsPanel";

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
  const { player, loading: playerLoading, error } = useExistingPlayer();
  const isMobile = useIsMobile();
  const [bgIndex] = useState(0); // swap this to cycle backgrounds

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
      <div className={styles.mainVisual}>
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
          <img className={styles.spinningOrb} src={spinningOrb}></img>
        </div>
      </div>

      <div className={styles.hud}>
        <PlayerStatsPanel player={player} />
      </div>
    </section>
  );
}

export default Game;
