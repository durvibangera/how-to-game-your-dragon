"use client";

import { useEffect, useRef } from "react";
import { DragonBossGame } from "../../lib/quiz/games/DragonBossGame";

export default function FinalGamePage() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
        if (!mounted || !containerRef.current) return;

        console.log("Initializing DragonBossGame...");
        const game = new DragonBossGame(containerRef.current, (success) => {
            console.log("Game completed. Success:", success);
            if (success) {
                alert("You saved Toothless!");
            } else {
                alert("Game Over — Try again!");
            }
        });

        gameRef.current = game;
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (gameRef.current) {
        gameRef.current.dispose();
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "#000",
          zIndex: 9999
        }}
      />
      <div style={{
          position: 'fixed',
          top: 10,
          left: 10,
          color: 'white',
          fontFamily: 'monospace',
          zIndex: 10001,
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.5)',
          padding: '10px'
      }}>
          <h2>Dragon Boss Fight</h2>
          <p>Arrow Keys / WASD: Move</p>
          <p>Space / Click: Plasma Blast</p>
          <p>Shift: Barrel Roll (Dodge)</p>
      </div>
    </>
  );
}
