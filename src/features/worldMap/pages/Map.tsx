import { useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";
import { usePlayer } from "@/shared/hooks/playerStore";
import { mapComponent } from "../components/mapComponent";
import { Navigate } from "react-router-dom";
import { setFlashMessage } from "@/shared/hooks/flashMessage";
import { isAuthenticated } from "@/shared/hooks/authSession";
import FlashMessage from "@/shared/components/FlashMessage";

export default function Map() {
  const ref = useRef<HTMLDivElement>(null);
  const { player, loading: playerLoading, error: playerError } = usePlayer();
  const [mapError, setMapError] = useState<string | null>(null);
  const [travelError, setTravelError] = useState<string | null>(null);
  const [isTraveling, setIsTraveling] = useState(false);

  if (player == null || !isAuthenticated) {
    setFlashMessage("No player found");
    <Navigate to={"/"} />;
  }

  const playerId = player?.id;

  // Auto-dismiss travel errors after 3 s
  useEffect(() => {
    if (!travelError) return;
    const t = window.setTimeout(() => setTravelError(null), 3000);
    return () => clearTimeout(t);
  }, [travelError]);

  useEffect(() => {
    if (!ref.current || !playerId) return;

    let appInstance: Application | null = null;
    let disposed = false;

    setMapError(null);
    setTravelError(null);

    mapComponent(ref.current, playerId, {
      onTravelStart: () => setIsTraveling(true),
      onTravelEnd: () => setIsTraveling(false),
      onTravelError: (msg) => {
        setIsTraveling(false);
        setTravelError(msg);
      },
    })
      .then((app) => {
        if (disposed) {
          app.destroy(true, { children: true, texture: false });
          return;
        }
        appInstance = app;
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
      if (appInstance) {
        appInstance.destroy(true, { children: true, texture: false });
        appInstance = null;
        console.log("[Map] Pixi application disposed.");
      }
    };
  }, [playerId]);

  if (playerLoading) {
    return (
      <div style={overlayStyle}>
        <span style={overlayTextStyle}>Loading player…</span>
      </div>
    );
  }

  if (playerError) {
    return (
      <div style={overlayStyle}>
        <span style={{ ...overlayTextStyle, color: "#e05252" }}>
          Player error: {playerError}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        border: "2px solid #333",
      }}
    >
      <FlashMessage />
      {/* Pixi canvas */}
      <div ref={ref} style={{ width: "100%", height: "100%" }} />

      {/* Traveling indicator — top-centre banner */}
      {isTraveling && (
        <div style={travelBannerStyle}>
          <span style={travelDotStyle} />
          <span style={overlayTextStyle}>Traveling…</span>
        </div>
      )}

      {/* Travel error toast — bottom-centre */}
      {travelError && (
        <div style={toastStyle}>
          <span
            style={{
              ...overlayTextStyle,
              color: "#e05252",
              fontSize: "0.85rem",
            }}
          >
            {travelError}
          </span>
        </div>
      )}

      {/* Hard map load error */}
      {mapError && (
        <div style={{ ...overlayStyle, position: "absolute" }}>
          <span style={{ ...overlayTextStyle, color: "#e05252" }}>
            {mapError}
          </span>
        </div>
      )}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#1d1d1d",
};

const overlayTextStyle: React.CSSProperties = {
  fontFamily: "var(--game-font-body, serif)",
  color: "#d4a843",
  fontSize: "1rem",
  letterSpacing: "0.05em",
};

const travelBannerStyle: React.CSSProperties = {
  position: "absolute",
  top: 14,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "rgba(13, 11, 8, 0.82)",
  border: "1px solid #d4a843",
  borderRadius: 4,
  padding: "5px 14px",
  pointerEvents: "none",
};

const travelDotStyle: React.CSSProperties = {
  display: "inline-block",
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "#d4a843",
  animation: "travelPulse 1s ease-in-out infinite",
};

const toastStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(13, 11, 8, 0.88)",
  border: "1px solid #e05252",
  borderRadius: 4,
  padding: "6px 16px",
  pointerEvents: "none",
};
