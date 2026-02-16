"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
    const [floaters, setFloaters] = useState([]);

    // Generate floating items on mount
    useEffect(() => {
        const newFloaters = [];
        const colors = ['#ff9a9e', '#fad0c4', '#fbc2eb', '#a18cd1', '#ffecd2'];
        const emojis = ['✨', '⭐', '☁️', '🌟', '🎮'];

        for (let i = 0; i < 20; i++) {
            newFloaters.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 5,
                duration: 10 + Math.random() * 10,
                size: 1 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                emoji: emojis[Math.floor(Math.random() * emojis.length)]
            });
        }
        setFloaters(newFloaters);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 25%, #e8eaf6 50%, #fce4ec 75%, #fff3e0 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientBG 15s ease infinite',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#5d4037'
        }}>


            {/* Floating Background Items */}
            {floaters.map(h => (
                <div key={h.id} style={{
                    position: 'absolute',
                    left: `${h.left}%`,
                    bottom: '-10vh',
                    fontSize: `${h.size}rem`,
                    color: h.color,
                    animation: `floatUp ${h.duration}s ${h.delay}s linear infinite`,
                    pointerEvents: 'none',
                    zIndex: 1
                }}>
                    {h.emoji}
                </div>
            ))}

            {/* Main Card */}
            <div style={{
                position: 'relative',
                padding: '40px 60px',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(15px)',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 10px 40px rgba(255, 182, 193, 0.2)',
                textAlign: 'center',
                maxWidth: '90%',
                width: '500px',
                zIndex: 10,
                animation: 'pulse 4s ease-in-out infinite'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🎢</div>
                <h1 style={{
                    fontSize: '3.5rem',
                    margin: '0 0 10px 0',
                    color: '#8e44ad',
                    textShadow: '2px 2px 0px rgba(255,255,255,0.5)'
                }}>404</h1>

                <h2 style={{
                    fontSize: '1.8rem',
                    marginBottom: '15px',
                    fontWeight: 'normal',
                    color: '#5d4037'
                }}>
                    Start of the Line?
                </h2>

                <p style={{
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    marginBottom: '30px',
                    fontFamily: "'Lato', sans-serif",
                    color: '#795548'
                }}>
                    Looks like this part of the adventure hasn't been written yet. Let's get you back on track!
                </p>

                <Link href="/" style={{
                    display: 'inline-block',
                    padding: '14px 32px',
                    background: 'linear-gradient(45deg, #ff9a9e, #fad0c4)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '50px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(255, 154, 158, 0.4)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    fontFamily: "'Lato', sans-serif",
                    letterSpacing: '0.05em'
                }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 154, 158, 0.6)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 154, 158, 0.4)';
                    }}
                >
                    Return to the Ride
                </Link>
            </div>
        </div>
    );
}
