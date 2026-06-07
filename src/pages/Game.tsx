import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useExistingPlayer } from "../hooks/checkPlayer";
import { setFlashMessage } from "../hooks/flashMessage";
import { useState, useEffect } from "react";
import styles from "../assets/css/game.module.css";

const DESKTOP_BACKGROUNDS = [
  "../img/places/desktop/bg1.png",
  "../img/places/desktop/bg2.png",
];

const MOBILE_BACKGROUNDS = [
  "../img/places/mobile/bg1_mobile.png",
  "../img/places/mobile/bg2_mobile.png",
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
    ? "../img/char/m_default.png"
    : "../img/char/f_default.png";

  return (
    <section className={styles.main}>
      <Navbar />
      <div className={styles.mainVisual}>
        <img
          className={styles.background}
          src={bgSrc}
          alt=""
          aria-hidden="true"
        />
        <img
          className={styles.character}
          src={charSrc}
          alt={player.gender ? "Male character" : "Female character"}
        />
      </div>
    </section>
  );
}

export default Game;
