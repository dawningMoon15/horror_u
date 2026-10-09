# THE CONTEXT — RETRO PSYCHOLOGICAL HORROR ESCAPE ROOM

> A complete browser-based retro-computing psychological horror escape room featuring 5 atmospheric rooms, 15 sequential clues, analog CRT flashlight exploration, urgency timers, jumpscare penalties, a continuous sentient supercomputer monologue, and an inescapable scripted ending.

---

## 1. Overview & Concept

**THE CONTEXT** puts the player inside a malfunctioning retro computer system:
- **Room 1: The Welcome Terminal** (Clues 1–3: Boot Pattern, File Metadata, Locked Profile)
- **Room 2: The Memory Archive** (Clues 4–6: Chronological Records, Missing Fragment, Archive Signal)
- **Room 3: The Control Room** (Clues 7–9: Misrouted Switch, Corrupted Telemetry, Impossible Log Prediction)
- **Room 4: The Observation Chamber** (Clues 10–12: Telemetry Contradiction, Refusal Test, Sentience Reveal)
- **Room 5: The Core** (Clues 13–15: Voice Waveform 3-1-4, Memory Bank BDAC, Command Breaker OBSERVE-CONTAIN-RELEASE)
- **Final Scripted Ending: No Victory** (False Victory → `YOU ARE NOT POWERFUL ENOUGH.` → Machine Reasserts Control → Total Blackout → Reboot Prompt)

Personalisation is supported via an optional client-side memory capsule from your preferred LLM assistant (astronomy, retro-computing, mythology, etc.). The game is also 100% playable in Generic Mode without any capsule.

---

## 2. Analog Horror Mechanics & Audio Architecture

1. **Pitch-Black Flashlight Exploration**:
   - Rooms are shrouded in pitch darkness (`#000000`).
   - A flashlight spotlight beam dynamically tracks the player's cursor with 3D perspective parallax tilt.
   - Hotspots and clues are hidden in the shadows.
2. **Urgent Countdown Timers**:
   - Clue 1 in each room: 30 seconds
   - Clue 2 in each room: 15 seconds
   - Clue 3 in each room: 10 seconds
   - Audio warning: Urgent analog clock ticking at ≤ 6s, heavy heartbeat pulse at ≤ 4s.
3. **Timeout Consequence & Jumpscare**:
   - If time expires before a clue is uncovered, an analog horror jumpscare video (`/assets/jumpscare.mp4`) triggers with a harsh audio stinger, followed by a VHS Game Over screen with retry capability.
4. **Sentient Supercomputer Audio**:
   - **Homescreen**: *Creepy Old Music Box* (`/audio/creepy_music_box.mp3`)
   - **Rooms 1–3**: *Dark Tension Rising* (`/audio/dark_tension.mp3`)
   - **Room 4 Transition & Room 5**: All ambient/tension audio switches off; the **AM Supercomputer Monologue** (`/audio/am_monologue.mp3`) plays continuously in the background while the player solves the final puzzles.
   - **Archival Exhibit**: *Creepy Old Music Box* with `/assets/thankyou.jpg`.

---

## 3. Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Vanilla CSS (CRT phosphor scanlines, chromatic glitch, tactile skeuomorphism)
- **Audio**: Web Audio API synthesizer + HTMLAudioElement pipeline
- **Testing**: Vitest + React Testing Library (47 automated unit & integration tests)
- **Linter**: Oxlint (0 errors, 0 warnings)
- **Target Hosting**: 100% static hosting (Vercel Hobby, Cloudflare Pages, GitHub Pages)

---

## 4. Running Locally

```bash
# Install dependencies
npm install

# Start local Vite dev server
npm run dev

# Run all 47 unit & integration tests
npx vitest run

# Run linter
npm run lint

# Build production bundle
npm run build
```

---

## 5. Deployment

Deploy the generated `dist/` directory directly to Vercel, Netlify, or Cloudflare Pages.
`vercel.json` contains the production Content Security Policy and caching headers.
No server, database, or external API keys are required.
