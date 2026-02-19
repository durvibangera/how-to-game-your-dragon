"use client";

import { useEffect, useRef } from "react";
import { BewilderbeastBossFight } from "../../lib/bossfight/BewilderbeastBossFight";

export default function FinalGamePage() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
      if (!mounted || !containerRef.current) return;

      const game = new BewilderbeastBossFight(containerRef.current, (success) => {
        if (success) {
          const screen = document.createElement('div');
          screen.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            background:radial-gradient(ellipse at center, rgba(10,30,10,0.95), rgba(0,0,0,0.98));
            z-index:6000;font-family:'Georgia',serif;
            animation:fadeIn 2s ease;
          `;
          screen.innerHTML = `
            <h1 style="font-size:clamp(2.5rem,6vw,4rem);color:#44ff88;text-shadow:0 0 40px rgba(68,255,136,0.5);margin-bottom:0.3em;">
              You saved Toothless!
            </h1>
            <p style="font-size:clamp(1rem,3vw,1.5rem);color:rgba(200,255,220,0.8);font-style:italic;letter-spacing:0.1em;margin-bottom:2em;">
              The Night Fury rises again. The bond between dragon and rider is unbreakable.
            </p>
            <button style="
              font-family:'Georgia',serif;font-size:clamp(1rem,2.5vw,1.3rem);
              padding:16px 48px;border:1px solid rgba(68,255,136,0.4);
              background:rgba(68,255,136,0.15);color:#44ff88;
              border-radius:50px;cursor:pointer;
              transition:all 0.3s ease;letter-spacing:0.1em;
            " onmouseover="this.style.background='rgba(68,255,136,0.3)';this.style.boxShadow='0 0 30px rgba(68,255,136,0.3)'"
               onmouseout="this.style.background='rgba(68,255,136,0.15)';this.style.boxShadow='none'"
            >Ride Again</button>
          `;
          document.body.appendChild(screen);
          screen.querySelector('button').addEventListener('click', () => {
            window.location.href = '/';
          });
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
