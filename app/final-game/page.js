"use client";

import { useEffect, useRef } from "react";
import { BewilderbeastBossFight } from "../../lib/bossfight/BewilderbeastBossFight";
import { EpilogueSequence } from "../../lib/epilogue/EpilogueSequence";

export default function FinalGamePage() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const epilogueRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
      if (!mounted || !containerRef.current) return;

      const game = new BewilderbeastBossFight(containerRef.current, (success) => {
        if (success && mounted && containerRef.current) {
          // Dispose the boss fight after a brief delay so the victory animation plays
          setTimeout(() => {
            if (!mounted || !containerRef.current) return;

            // Clean up boss fight
            if (gameRef.current) {
              gameRef.current.dispose();
              gameRef.current = null;
            }

            // Clear any remaining boss fight UI from the container
            while (containerRef.current.firstChild) {
              containerRef.current.removeChild(containerRef.current.firstChild);
            }

            // Remove any boss fight overlays left on document.body
            const bfEnd = document.getElementById("bf-end");
            if (bfEnd && bfEnd.parentNode) bfEnd.parentNode.removeChild(bfEnd);

            // Start the epilogue sequence
            const epilogue = EpilogueSequence.createStandalone(containerRef.current, {
              redirectUrl: "/",
            });
            epilogueRef.current = epilogue;
          }, 4000); // Wait for victory animation to finish
        }
      });

      gameRef.current = game;
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (gameRef.current) {
        gameRef.current.dispose();
        gameRef.current = null;
      }
      if (epilogueRef.current) {
        epilogueRef.current.dispose();
        epilogueRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#060614",
        zIndex: 9999,
      }}
    />
  );
}
