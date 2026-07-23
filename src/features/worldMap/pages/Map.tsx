import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/shared/hooks/playerStore";
import { mapComponent } from "../components/mapComponent";
import { Navigate } from "react-router-dom";
import { setFlashMessage } from "@/shared/hooks/flashMessage";
import { isAuthenticated } from "@/shared/hooks/authSession";
import FlashMessage from "@/shared/components/FlashMessage";
import type { MapComponentHandle, InteractableOfMap } from "../types/types";
import styles from "../assets/css/Map.module.css";

function labelForInteractable(type: InteractableOfMap["type"]): string {
  const titleCased = type.charAt(0) + type.slice(1).toLowerCase();
  return `Enter ${titleCased}`;
}

export default function Map() {
  const ref = useRef<HTMLDivElement>(null);
  const { player, loading: playerLoading, error: playerError } = usePlayer();
  const [mapError, setMapError] = useState<string | null>(null);
  const [travelError, setTravelError] = useState<string | null>(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [activeInteractable, setActiveInteractable] =
    useState<InteractableOfMap | null>(null);

  const handleRef = useRef<MapComponentHandle | null>(null);
  const playerId = player?.id;

  useEffect(() => {
    if (!travelError) return;
    const t = window.setTimeout(() => setTravelError(null), 3000);
    return () => clearTimeout(t);
  }, [travelError]);

  useEffect(() => {
    if (!ref.current || !playerId) return;

    let disposed = false;
    setMapError(null);
    setTravelError(null);
    setActiveInteractable(null);

    mapComponent(ref.current, playerId, {
      onTravelStart: () => setIsTraveling(true),
      onTravelEnd: () => setIsTraveling(false),
      onTravelError: (msg) => {
        setIsTraveling(false);
        setTravelError(msg);
      },
      onInteractableChange: (interactable) =>
        setActiveInteractable(interactable),
    })
      .then((handle) => {
        if (disposed) {
          handle.app.destroy(true, { children: true, texture: false });
          return;
        }
        handleRef.current = handle;
      })
      .catch((err) => {
        if (!disposed) {
          const message =
            err instanceof Error ? err.message : "Map failed to load.";
          setMapError(message);
          console.error("[Map] initPixi error:", err);
        }
      });

    return () => {
      disposed = true;
      if (handleRef.current) {
        handleRef.current.app.destroy(true, { children: true, texture: false });
        handleRef.current = null;
        console.log("[Map] Pixi application disposed.");
      }
    };
  }, [playerId]);

  function handleEnterInteractable() {
    const interactable = handleRef.current?.enterInteractable();
    if (!interactable) return;
    console.log("[Map] Entering interactable:", interactable);
  }

  if (playerLoading) {
    return (
      <div className={styles.overlay}>
        <span className={styles.overlayText}>Loading player…</span>
      </div>
    );
  }

  if (playerError) {
    return (
      <div className={styles.overlay}>
        <span className={styles.errorText}>Player error: {playerError}</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <FlashMessage />

      {/* Pixi canvas */}
      <div ref={ref} className={styles.canvas}>
        {/* Traveling indicator */}
        {isTraveling && (
          <div className={styles.travelBanner}>
            <span className={styles.travelDot} />
            <span className={styles.overlayText}>Traveling…</span>
          </div>
        )}

        {/* Travel error toast */}
        {travelError && (
          <div className={styles.toast}>
            <span className={styles.toastErrorText}>{travelError}</span>
          </div>
        )}

        {/* Enter interactable button */}
        {activeInteractable && !isTraveling && (
          <button
            type="button"
            onClick={handleEnterInteractable}
            className={styles.enterButton}
          >
            {labelForInteractable(activeInteractable.type)}
          </button>
        )}

        {/* Hard map load error */}
        {mapError && (
          <div className={styles.overlayAbsolute}>
            <span className={styles.errorText}>{mapError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
