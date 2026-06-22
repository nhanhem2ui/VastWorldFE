import { useEffect, useRef } from "react";
import { initPixi } from "../components/initPixi";

export default function Map() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    initPixi(ref.current);
  }, []);

  return <div ref={ref}></div>;
}
