import { useEffect, useRef } from "react";
import { initPixi } from "../components/initPixi";
import { Application } from "pixi.js";

export default function MapBuilder() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    let appInstance: Application | null = null;

    // Run initialization
    initPixi(ref.current).then((app) => {
      appInstance = app;
    });

    // Cleanup hook running directly when a user navigates away
    return () => {
      if (appInstance) {
        appInstance.destroy(true, { children: true, texture: false });
        console.log("Pixi application successfully disposed");
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: "100%", border: "2px solid #333" }}
    ></div>
  );
}
