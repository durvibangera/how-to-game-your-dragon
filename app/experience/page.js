"use client";

import { useEffect, useRef } from "react";

export default function ExperiencePage() {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { RollerCoasterEngine } = await import("../../lib/engine/RollerCoasterEngine");
      if (!mounted || !containerRef.current) return;
      
      const engine = new RollerCoasterEngine(containerRef.current);
      engineRef.current = engine;
      engine.start();
    }

    init();

    return () => {
      mounted = false;
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="experience-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#000",
      }}
    />
  );
}
