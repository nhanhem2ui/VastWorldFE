import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/shared/hooks/playerStore";
import { mapComponent } from "../components/mapComponent";
import { regionComponent } from "../components/regionComponent";
import FlashMessage from "@/shared/components/FlashMessage";
import type {
  MapComponentHandle,
  InteractableOfMap,
  DecorationsOfRegion,
} from "../types/types";
import type { ServiceResult } from "@/types/ServiceResult";
import { getAuthToken } from "@/shared/hooks/authSession";
import styles from "../assets/css/Map.module.css";

type ViewMode = "map" | "region";

const VIEW_MODE_STORAGE_KEY = "vastworld:mapViewMode";

function readStoredViewMode(): ViewMode {
  if (typeof window === "undefined") return "map";
  const stored = window.sessionStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return stored === "region" ? "region" : "map";
}

function writeStoredViewMode(mode: ViewMode) {
  window.sessionStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
}

function labelForInteractable(type: InteractableOfMap["type"]): string {
  const titleCased = type.charAt(0) + type.slice(1).toLowerCase();
  return `Enter ${titleCased}`;
}

export default function Map() {
  const ref = useRef<HTMLDivElement>(null);
  const { player, loading: playerLoading, error: playerError } = usePlayer();

  const [viewMode, setViewMode] = useState<ViewMode>(readStoredViewMode);

  const [mapError, setMapError] = useState<string | null>(null);
  const [travelError, setTravelError] = useState<string | null>(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [activeInteractable, setActiveInteractable] =
    useState<InteractableOfMap | null>(null);

  const [regionError, setRegionError] = useState<string | null>(null);
  const [isTravelingToMap, setIsTravelingToMap] = useState(false);
  const travelInFlightRef = useRef(false);

  const handleRef = useRef<
    { app: MapComponentHandle["app"] } | MapComponentHandle | null
  >(null);
  const playerId = player?.id;

  // Persist every view-mode change so a manual refresh lands back where
  // the player was.
  useEffect(() => {
    writeStoredViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!travelError) return;
    const t = window.setTimeout(() => setTravelError(null), 3000);
    return () => clearTimeout(t);
  }, [travelError]);

  useEffect(() => {
    if (!ref.current || !playerId) return;

    let disposed = false;
    setMapError(null);
    setRegionError(null);
    setTravelError(null);
    setActiveInteractable(null);

    const container = ref.current;

    const init =
      viewMode === "map"
        ? mapComponent(container, playerId, {
            onTravelStart: () => setIsTraveling(true),
            onTravelEnd: () => setIsTraveling(false),
            onTravelError: (msg) => {
              setIsTraveling(false);
              setTravelError(msg);
            },
            onInteractableChange: (interactable) =>
              setActiveInteractable(interactable),
          })
        : regionComponent(container, playerId, {
            onDecorationClick: handleDecorationClick,
            onError: (msg) => setRegionError(msg),
          });

    init
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
            err instanceof Error ? err.message : "Failed to load view.";
          if (viewMode === "map") {
            setMapError(message);
          } else {
            setRegionError(message);
          }
          console.error("[Map] init error:", err);
        }
      });

    return () => {
      disposed = true;
      if (handleRef.current) {
        handleRef.current.app.destroy(true, { children: true, texture: false });
        handleRef.current = null;
        container.innerHTML = "";
        console.log("[Map] Pixi application disposed.");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, viewMode]);

  async function handleDecorationClick(decoration: DecorationsOfRegion) {
    if (!playerId || travelInFlightRef.current) return;

    travelInFlightRef.current = true;
    setIsTravelingToMap(true);
    setRegionError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = getAuthToken();

      const res = await fetch(`${baseUrl}/api/map/travel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playerId,
          x: 0,
          y: 0,
          mapId: decoration.mapId,
        }),
      });

      const body: ServiceResult<unknown> = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.message ?? "Failed to travel to that location.");
      }

      // Travel succeeded — the destination map should be shown
      writeStoredViewMode("map");
      window.location.reload();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to travel to that location.";
      setRegionError(message);
      console.error("[Region] travel error:", err);
      travelInFlightRef.current = false;
      setIsTravelingToMap(false);
    }
  }

  function handleEnterInteractable() {
    if (viewMode !== "map") return;
    const handle = handleRef.current as MapComponentHandle | null;
    const interactable = handle?.enterInteractable();
    if (!interactable) return;
    console.log("[Map] Entering interactable:", interactable);
  }

  function toggleView() {
    setViewMode((prev) => (prev === "map" ? "region" : "map"));
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

      <div ref={ref} className={styles.canvas}>
        <button
          type="button"
          onClick={toggleView}
          disabled={isTravelingToMap}
          className={styles.viewToggleButton}
        >
          {viewMode === "map" ? "View Region" : "Back to Map"}
        </button>

        {viewMode === "map" && isTraveling && (
          <div className={styles.travelBanner}>
            <span className={styles.travelDot} />
            <span className={styles.overlayText}>Traveling…</span>
          </div>
        )}

        {viewMode === "region" && isTravelingToMap && (
          <div className={styles.travelBanner}>
            <span className={styles.travelDot} />
            <span className={styles.overlayText}>Traveling…</span>
          </div>
        )}

        {viewMode === "map" && travelError && (
          <div className={styles.toast}>
            <span className={styles.toastErrorText}>{travelError}</span>
          </div>
        )}

        {viewMode === "map" && activeInteractable && !isTraveling && (
          <button
            type="button"
            onClick={handleEnterInteractable}
            className={styles.enterButton}
          >
            {labelForInteractable(activeInteractable.type)}
          </button>
        )}

        {viewMode === "map" && mapError && (
          <div className={styles.overlayAbsolute}>
            <span className={styles.errorText}>{mapError}</span>
          </div>
        )}

        {viewMode === "region" && regionError && (
          <div className={styles.overlayAbsolute}>
            <span className={styles.errorText}>{regionError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
