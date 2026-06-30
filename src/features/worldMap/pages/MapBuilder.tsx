import { useEffect, useRef } from "react";
import { initPixi } from "../components/initPixi";
import { Application } from "pixi.js";

export default function MapBuilder() {
  const ref = useRef<HTMLDivElement>(null);

  const appRef = useRef<Application | null>(null);
  const exportSqlRef = useRef<((mapId: number) => string) | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    initPixi(ref.current).then(({ app, generateSql }) => {
      appRef.current = app;
      exportSqlRef.current = generateSql;
    });

    return () => {
      appRef.current?.destroy(true, {
        children: true,
        texture: false,
      });
    };
  }, []);

  const copySql = async () => {
    if (!exportSqlRef.current) return;

    const sql = exportSqlRef.current(1);

    await navigator.clipboard.writeText(sql);

    alert("SQL copied to clipboard!");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <button
        onClick={copySql}
        style={{
          position: "absolute",
          top: "90vh",
          left: 16,
          zIndex: 1000,
          padding: "10px 18px",
          cursor: "pointer",
        }}
      >
        Copy SQL
      </button>

      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          border: "2px solid #333",
        }}
      />
    </div>
  );
}
