import { useEffect, useRef, useState } from "react";
import { initPixi } from "../components/initPixi";
import { Application } from "pixi.js";
import { regionPixi } from "../components/regionPixi";

export default function MapBuilder() {
  const ref = useRef<HTMLDivElement>(null);

  const appRef = useRef<Application | null>(null);
  const exportSqlRef = useRef<((mapId: number) => string) | null>(null);

  const mapId = 2;

  const [mapError, setMapError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // useEffect(() => {
  //   if (!ref.current) return;

  //   initPixi(ref.current).then(({ app, generateSql }) => {
  //     appRef.current = app;
  //     exportSqlRef.current = generateSql;
  //   });

  //   return () => {
  //     appRef.current?.destroy(true, {
  //       children: true,
  //       texture: false,
  //     });
  //   };
  // }, []);

  useEffect(() => {
    if (!ref.current) return;

    setMapError(null);
    setIsProcessing(true);

    regionPixi(ref.current)
      .then((app) => {
        appRef.current = app;
        setIsProcessing(false);
      })
      .catch((err) => {
        setIsProcessing(false);
        const message =
          err instanceof Error ? err.message : "Failed to load region canvas.";
        setMapError(message);
        console.error("[MapBuilder] regionPixi error:", err);
      });

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, {
          children: true,
          texture: false,
        });
        appRef.current = null;
      }
    };
  }, []);

  const copySql = async () => {
    if (!exportSqlRef.current) {
      setToastMessage(
        "SQL Export target function is not active or configured.",
      );
      return;
    }

    try {
      const sql = exportSqlRef.current(mapId);
      await navigator.clipboard.writeText(sql);
      setToastMessage("SQL copied to clipboard!");
    } catch (err) {
      setToastMessage("Failed to write to system clipboard.");
    }
  };

  return (
    /* .container */
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        border: "2px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        overflow: "hidden",
      }}
    >
      <style>{`
        .pixi-canvas-target canvas {
          transform: scale(0.8);
          transform-origin: top left;
        }
        @keyframes travelPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>

      {/* .canvas (Pixi container mount point matches standard game view layout) */}
      <div
        ref={ref}
        className="pixi-canvas-target"
        style={{
          position: "relative",
        }}
      >
        {isProcessing && (
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(13, 11, 8, 0.9)",
              border: "1px solid #d4a843",
              borderRadius: "4px",
              padding: "6px 16px",
              pointerEvents: "none",
              zIndex: 1000,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#d4a843",
                animation: "travelPulse 1s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--game-font-body, serif)",
                color: "#d4a843",
                fontSize: "1rem",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}
            >
              Loading Map Assets…
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={copySql}
          style={{
            position: "absolute",
            bottom: "24px",
            left: "24px",
            fontFamily: "var(--game-font-body, serif)",
            color: "#1d1d1d",
            background: "#d4a843",
            border: "1px solid #f0d27a",
            borderRadius: "4px",
            padding: "8px 18px",
            fontSize: "0.95rem",
            letterSpacing: "0.04em",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          }}
        >
          Copy SQL Script
        </button>

        {toastMessage && (
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(13, 11, 8, 0.92)",
              border: "1px solid #e05252",
              borderRadius: "4px",
              padding: "8px 18px",
              pointerEvents: "none",
              zIndex: 1000,
            }}
          >
            <span
              style={{
                fontFamily: "var(--game-font-body, serif)",
                color: "#e05252",
                letterSpacing: "0.05em",
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
              }}
            >
              {toastMessage}
            </span>
          </div>
        )}

        {mapError && (
          /* .overlayAbsolute */
          <div
            style={{
              width: "858px",
              height: "858px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1d1d1d",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontFamily: "var(--game-font-body, serif)",
                color: "#e05252",
                fontSize: "1rem",
                letterSpacing: "0.05em",
              }}
            >
              {mapError}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
