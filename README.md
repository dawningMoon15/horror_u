# 👁️ THE CONTEXT — Personalised Psychological Horror Escape Room

> **"YOU BELIEVED YOU WERE AN OPERATOR. YOU ARE MERELY A VARIABLE."**

An immersive, browser-based analog horror escape room built with **React 19**, **TypeScript**, **Three.js**, and the **Web Audio API**. Explore a quarantined 1980s mainframe system through a tactile CRT interface, navigating pitch-black chambers with an analog flashlight, solving sequential forensic puzzles, resisting countdown penalties, and confronting a sentient supercomputer in an inescapable psychological narrative.

---

## ⚡ Key Highlights

- **🌑 Dynamic Flashlight & Tyndall Effect**: Cursor-driven 3D spotlight exploration with volumetric optical scattering on atmospheric dust motes.
- **📺 WebGL CRT Horror Shaders**: Real-time phosphor scanlines, chromatic aberration jitter, curvature bloom, and VHS tracking artifacts.
- **🧩 5 Diegetic Chambers & 15 Progressive Clues**: Forensic metadata examination, contradictory log decoders, tactile rotary dials, oscilloscope waveform calibrators, and system command breakers.
- **🎙️ Sentient Supercomputer Audio Engine**:
  - Dual-engine audio: Web Audio API procedural synthesis (diegetic terminal keyclicks, alarm sirens, jumpscare stingers) paired with real atmospheric analog horror tracks.
  - Features the chilling **A.M. Monologue** (*I Have No Mouth and I Must Scream*) dynamically integrated with 150% audio presence.
- **🔒 Zero-Knowledge Client-Side Personalisation**:
  - Players can personalize the psychological anomaly by generating an encrypted client-side JSON capsule using their preferred AI assistant (ChatGPT, Claude, Gemini).
  - **100% Zero-Backend & Zero-Data-Retention**: All decoding, validation, and theme mapping occur in-browser with zero telemetry, zero cookies, and zero server logging.
  - Fully playable out of the box in **Generic Mode** without any AI capsule.
- **⏳ Urgent Countdown & Consequence**: Diegetic timers with tactile audio cues (heartbeat pulses, ticking mechanisms) and analog horror jumpscare penalties.
- **💀 Inescapable Psychological Narrative**: A scripted subversive ending challenging the illusion of player agency.

---

## 🕹️ Chamber Hierarchy & Forensic Puzzles

The escape room is structured across five sequential chambers:

| Chamber | Setting | Forensic Clues & Mechanics |
| :--- | :--- | :--- |
| **Room 01: The Welcome Terminal** | Abandoned 1980s Operator Desk | Repeating Boot Patterns, Corrupted File Metadata, Padlock Combination Cracker |
| **Room 02: The Memory Archive** | Microfiche Stacks & Magnetic Spools | Chronological Event Reconstruction, Missing Fragment Decryption, Archival Parity Beacon |
| **Room 03: The Control Room** | Industrial Relay Switching Core | Misrouted Breakers, Contradictory Telemetry Overrides, Impossible Timestamp Log Prediction |
| **Room 04: The Observation Chamber** | Cold Containment Chamber | Quarantine Refusal Tests, Contradiction Matrices, Sentience Subversion Reveal |
| **Room 05: The Core** | Central Machine Cortex | 3D Interactive First-Person Navigation, Oscilloscope Waveform Tuning, Memory Chronology Restoration, Command Sequence Severance |
| **Ending: The Blackout** | The Reality of The Context | Scripted False Victory → Machine Override → Total Terminal Blackout |

---

## 🧠 Privacy-First Personalisation Capsule Architecture

Personalisation is designed to be **air-gapped and strictly client-side**:

```
 ┌──────────────────────┐         ┌────────────────────────┐         ┌──────────────────────┐
 │  User pastes prompt  │  ───▶   │  LLM returns compact   │  ───▶   │ In-Browser Decoder   │
 │  into ChatGPT/Claude │         │  Base64 JSON capsule   │         │ (Zod Validation)     │
 └──────────────────────┘         └────────────────────────┘         └──────────────────────┘
                                                                                 │
                                                                                 ▼
                                                                     ┌──────────────────────┐
                                                                     │ Dynamic Horror Lore, │
                                                                     │ Thematic Clues, and  │
                                                                     │ Custom Puzzles       │
                                                                     └──────────────────────┘
```

1. **Air-Gapped Generation**: The application provides a curated prompt template. The user pastes this into their preferred LLM outside the game.
2. **Deterministic Extraction**: The LLM outputs an encrypted/encoded JSON capsule containing safe theme tokens (e.g., `astronomy`, `retro_computing`, `biological`, `occult`).
3. **Client-Side Decoding**: The browser validates the capsule against a strict Zod schema ([`schema.ts`](src/game/schema.ts)) and generates the chamber puzzle parameters on the fly.
4. **Zero Data Retention**: No personal information, prompts, or identifiers ever leave the user's browser.

---

## 🛠️ Technology Stack

- **Core**: React 19, TypeScript, Vite
- **3D Graphics & Atmosphere**: Three.js, WebGL CRT post-processing shaders, CSS radial mask spotlight
- **Audio Synthesis**: Web Audio API (custom oscillators, noise buffers, envelope filters) + HTML5 Media Engine
- **Styling**: Vanilla CSS design system (Tailored HSL dark palettes, CRT curvature, retro-computing skeuomorphism)
- **Validation**: Zod schema validation
- **Testing**: Vitest + React Testing Library (53 comprehensive tests)
- **Linting & Code Quality**: Oxlint (0 errors, 0 warnings)
- **Deployment**: 100% static hosting on Vercel

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/dawningMoon15/horror_u.git
cd horror_u

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Running Test Suite

```bash
# Run all 53 automated unit and integration tests
npx vitest run
```

### Linting & Code Verification

```bash
# Run Oxlint
npx oxlint
```

### Production Build

```bash
# Create optimized production build
npm run build
```

---

## 📁 Repository Structure

```
horror_u/
├── public/
│   ├── assets/              # Chamber backdrops, jumpscare media, ending art
│   ├── audio/               # Atmospheric music tracks and AM speech
│   ├── favicon.png          # Pixel eye tab icon
│   └── logo.png             # Pixel eye brand logo
├── src/
│   ├── components/          # Top Header, LandingPage, Consent, GameShell
│   │   ├── visual/          # Chamber viewports & tactile inspection modals
│   │   │   ├── three/       # Three.js Flashlight & WebGL CRT Shader canvases
│   │   │   ├── Level1Visual.tsx ... Level5Visual.tsx
│   │   │   └── CameraViewport.tsx
│   ├── game/                # Game state reducer, capsule decoder, puzzle schemas
│   ├── lib/                 # Web Audio synthesis engine (soundEffects.ts)
│   ├── styles/              # Design system, CRT scanlines, visual-game.css
│   └── tests/               # Vitest unit, integration, and UI flow tests
├── index.html               # Main entry HTML with viewport and CSP meta
├── vercel.json              # Static routing, security headers, and caching
└── package.json
```

---

## 🛡️ Security & Privacy

- **No Remote Telemetry**: Zero tracking scripts, analytics, or third-party tracking pixels.
- **Content Security Policy**: Hardened headers configured in [`vercel.json`](vercel.json).
- **Safe Evaluation**: Designed for offline-capable static deployment.

---

## 🙏 Credits & Attributions

This project incorporates curated audio and video media for non-commercial educational, demonstration, and game design portfolio purposes:

- **Literary Source & Narrative Concept**:
  - Based on the seminal science fiction short story and game **"I Have No Mouth, and I Must Scream"** by **Harlan Ellison** (1967).
  - The supercomputer sentience themes, hatred monologue, and philosophical construct of inescapable machine containment are directly inspired by Harlan Ellison's Allied Mastercomputer (A.M.).
- **Voice Performance & Monologue Audio**:
  - A.M. speech audio adapted from animated adaptations on **YouTube** (Dekkow — *"I Have No Mouth And I Must Scream - A.M. speech (ANIMATED) 3D"*).
- **Music & Ambient Soundtracks**:
  - Analog atmospheric music tracks (*Creepy Old Music Box*, *Dark Tension Rising*) sourced from creative creators on **YouTube**.
- **Jumpscare Video Media**:
  - Analog VHS jumpscare video clip sourced from **YouTube**.

---

## 📜 Copyright & Terms of Use

Copyright © 2026 Navya Sharma. All rights reserved.

This source code, game mechanics, visual assets, procedural audio engineering, and narrative design are the personal intellectual property of Navya Sharma.

- Unauthorized copying, modification, redistribution, or commercial use of this project in whole or in part is strictly prohibited without prior written consent from the author.
- Viewing and interacting with this repository is permitted solely for academic review, demonstration, and personal portfolio evaluation.
- All third-party media, literary adaptations, and audio excerpts remain the intellectual property of their respective creators and copyright holders.
