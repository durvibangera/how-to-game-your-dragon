# 🐉 How To Save Your Dragon

> An immersive 3D dragon flight experience through six themed realms inspired by *How to Train Your Dragon* — featuring aerial combat, mini-games, boss fights, and a cinematic epilogue.

**[▶ Play Now — Live Demo](https://how-to-save-your-dragon.vercel.app/)**

---

## 📸 Screenshots

<!-- Replace the placeholder paths below with actual screenshot images -->

| Landing Page | Dragon Flight |
|:---:|:---:|
| ![Landing Page](screenshots/landing.png) | ![Dragon Flight](screenshots/flight.png) |

| Quiz Gate | Mini-Game: Siege |
|:---:|:---:|
| ![Quiz Gate](screenshots/quiz-gate.png) | ![Siege Game](screenshots/siege-game.png) |

| Boss Fight: Bewilderbeast | Epilogue |
|:---:|:---:|
| ![Boss Fight](screenshots/boss-fight.png) | ![Epilogue](screenshots/epilogue.png) |

---

## 🎮 Overview

**How To Save Your Dragon** is a fully browser-based 3D experience built with Next.js and Three.js. You ride Toothless the Night Fury through six dragon realms on an epic roller-coaster flight, battling enemies, solving quizzes, and ultimately facing the Bewilderbeast in an intense 3D aerial boss fight — all rendered in real-time with procedurally generated textures and audio.

### Key Highlights

- **Six unique themed realms** — from Berk Village to the Red Death's Lair
- **Free-flight dragon controls** — WASD + mouse with banking, boost, and barrel rolls
- **Fire hoop gates** — fly through hoops at realm boundaries for a score boost
- **Interactive mini-games** — a top-down pixel adventure siege game
- **Epic 3D boss fight** — Toothless vs the Bewilderbeast with 4 phases and 12+ attack patterns
- **Cinematic epilogue** — a poetic text-beat finale with starfield, ambient audio, and pastel sparkle ending
- **Zero external assets** — all textures, audio, and effects are procedurally generated
- **Themed 404 page** — even getting lost feels on-brand

---

## 🗺️ The Six Realms

| # | Realm | Theme |
|---|-------|-------|
| 1 | **Berk Village** | Viking huts, glowing torches, docks, green hills, and ocean |
| 2 | **The Cove** | Hidden lake, rocky cliffs, waterfalls, bioluminescent plants |
| 3 | **Dragon Training Arena** | Stone arena with shields, weapons, iron chains |
| 4 | **Cloud Kingdom** | Soaring above clouds, golden sun rays, floating islands, rainbow arcs |
| 5 | **Volcanic Nest** | Dark volcanic island, lava rivers, dragon nests, ember particles |
| 6 | **The Red Death's Lair** | Jagged rock pillars, ominous red sky, skulls, lightning |

After completing all six realms, a dramatic fall sequence transitions into the **Siege mini-game**, followed by the **Bewilderbeast Boss Fight**, and finally a cinematic **Epilogue Sequence**.

---

## 🕹️ Controls

### Dragon Flight (Main Experience)

| Key | Action |
|-----|--------|
| `W` / `↑` | Pitch down (dive) |
| `S` / `↓` | Pitch up (climb) |
| `A` / `←` | Bank left |
| `D` / `→` | Bank right |
| `Shift` | Boost |
| `Space` | Ascend |
| `Mouse` | Look around |
| `Esc` | Pause menu |

### Bewilderbeast Boss Fight (Pointer Lock)

| Key | Action |
|-----|--------|
| `Mouse` | Aim / look |
| `Left Click` | Plasma blast (auto-fire while held) |
| `Right Click` / `E` | Charged plasma blast (high damage, cooldown) |
| `W/A/S/D` | Fly forward / strafe / backward |
| `Space` | Ascend |
| `C` | Descend |
| `Shift` | Barrel-roll dodge (i-frames) |
| `Q` | Summon allies (when Focus bar is full) |
| `Esc` | Pause |

---

## 🏗️ Architecture

```
app/
├── page.js                  # Landing page with "Start the Adventure" button
├── layout.js                # Root layout with metadata
├── not-found.js             # Dragon-themed 404 page
├── globals.css              # Global styles
├── experience/
│   └── page.js              # Direct-launch route for the ride
└── final-game/
    └── page.js              # Standalone boss fight → epilogue flow

lib/
├── engine/
│   ├── RollerCoasterEngine.js   # Main orchestrator — scene, track, areas, games
│   ├── TrackBuilder.js          # CatmullRom spline track + fire hoops
│   └── CameraController.js     # Third-person follow camera with dynamic banking
├── areas/
│   ├── AreaBase.js              # Base class for realm environments
│   ├── AreaManager.js           # Activates/deactivates areas based on progress
│   └── Area1.js – Area6.js     # Individual realm environments
├── quiz/
│   ├── QuizGateSystem.js        # Quiz gates at area boundaries
│   ├── GameManager.js           # Mini-game orchestration
│   ├── quizData.js              # Quiz question bank
│   ├── gameData.js              # Game configuration data
│   └── games/
│       ├── SiegeGame.js         # Top-down pixel siege mini-game
│       └── DragonBossGame.js    # 2D canvas dragon boss mini-game
├── bossfight/
│   └── BewilderbeastBossFight.js  # 3D POV aerial boss fight (2,200+ lines)
├── epilogue/
│   └── EpilogueSequence.js     # Cinematic epilogue with text beats & pastel ending
├── effects/
│   └── ParticleSystem.js       # Sparkles, fireworks, trails, ambient effects
├── audio/
│   └── AudioManager.js         # Web Audio API procedural sound generation
├── ui/
│   └── UIOverlay.js            # DOM-based HUD overlay (titles, messages, progress)
└── utils/
    └── ProceduralTextures.js   # Canvas2D procedural texture generation
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| **[Next.js](https://nextjs.org/) 16** | App Router, React framework, SSR/SSG |
| **[React](https://react.dev/) 19** | UI components, state management, refs |
| **[Three.js](https://threejs.org/) 0.182** | 3D rendering, scene graph, splines, GLTF loading, materials |
| **Web Audio API** | Procedural audio — no bundled audio files |
| **Canvas2D** | Procedural texture generation, 2D mini-game rendering |
| **[Tailwind CSS](https://tailwindcss.com/) 4** | Utility-first CSS framework |
| **Pointer Lock API** | FPS-style mouse controls in the boss fight |
| **GLTF Loader** | 3D dragon model loading |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

```bash
# Clone the repository
git clone https://github.com/durvibangera/how-to-save-your-dragon.git
cd how-to-save-your-dragon

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 📁 Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — background image, title, and "Start the Adventure" button |
| `/experience` | Direct-launch — immediately starts the dragon flight experience |
| `/final-game` | Standalone Bewilderbeast boss fight followed by the epilogue sequence |

---

## 🎬 Game Flow

```
Landing Page (/)
       │
       ▼
  Dragon Flight through 6 Realms
  (with fire hoops & quiz gates)
       │
       ▼
  Dragon Fall → "Toothless is hit!"
       │
       ▼
  Siege Mini-Game
       │
       ▼
  Bewilderbeast Boss Fight (/final-game)
  (4 phases, 12+ attack patterns)
       │
       ▼
  Epilogue Sequence
  (cinematic text beats → pastel sparkle ending)
       │
       ▼
  "Ride Again" → back to Landing Page
```

---

## ✨ Features In Detail

### Procedural Generation
Every texture in the game — grass, wood, stone, sand, clouds, lava, dark rock — is generated at runtime using Canvas2D. No image assets are required for the environments.

### Procedural Audio
All sound effects and ambient audio are synthesized using the Web Audio API. Celebration tones, wrong-answer buzzes, boss fight impacts, and the epilogue's ambient pad are all created programmatically.

### Bewilderbeast Boss Fight
A full 3D POV aerial combat experience featuring:
- 4 escalating difficulty phases
- 12+ unique attack patterns (ice beams, shockwaves, minion swarms)
- Charged plasma blasts with cooldowns
- Barrel-roll dodge with invincibility frames
- Ally summoning system (Stormfly & Astrid)
- Combo system with damage multiplier

### Epilogue Sequence
A cinematic finale that plays after the boss fight victory:
- Void environment with slowly appearing stars
- Poetic text beats that fade in and out
- Ambient audio pad with wind noise
- Golden light swell
- Transition to a pastel background with floating sparkles
- "Ride Again" button to restart the adventure

---

## 🌐 Deployment

The project is deployed on **Vercel**:

**[https://how-to-save-your-dragon.vercel.app/](https://how-to-save-your-dragon.vercel.app/)**

To deploy your own instance:

1. Push to a GitHub repository
2. Import the project on [Vercel](https://vercel.com/new)
3. Vercel auto-detects Next.js and deploys

---

## 📝 License

This project is for educational and entertainment purposes.

---

<p align="center">
  <em>Best experienced on desktop with sound on 🔊</em>
</p>
