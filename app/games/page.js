"use client";

import { useEffect, useRef } from "react";
import { EpilogueSequence } from "../../lib/epilogue/EpilogueSequence";
import * as THREE from "three";
import { UIOverlay } from "../../lib/ui/UIOverlay";

export default function TestGameButtonsPage() {
    const mountRef = useRef(null);

    useEffect(() => {
        // Basic Three.js setup to satisfy EpilogueSequence dependencies
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Create UI Overlay
        const ui = new UIOverlay(document.body);

        // Create EpilogueSequence
        const epilogue = new EpilogueSequence(document.body, scene, camera, renderer, ui);

        // Manually trigger the "cute background" and buttons immediately for testing
        // We simulate the stare by creating the cute overlay and appending buttons
        epilogue._createOverlay();

        // Trigger the background sequence
        epilogue._showCuteBackground();

        // The background takes 2.5s to fade in (hardcoded in EpilogueSequence).
        // We wait 3s to be safe before showing the buttons.
        setTimeout(() => {
            epilogue._showRideAgainButton();
        }, 3000);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            epilogue.update(0.016);
        };
        animate();

        return () => {
            epilogue.dispose();
            ui.dispose();
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div ref={mountRef} style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }} />
    );
}
