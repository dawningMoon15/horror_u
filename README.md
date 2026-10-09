# THE CONTEXT

> A browser-based psychological horror escape room that personalises itself using a compact memory capsule from your AI assistant.

## What it is

THE CONTEXT is a three-level puzzle game. You paste a prompt into ChatGPT, Gemini, Claude, or any assistant you use — they generate a small encoded capsule — you paste it back into the game. Broad themes from your interests appear as props, file names, and atmosphere. The game never sees your raw chat history, and the capsule is discarded after setup.

You can also play without personalisation at any time.

## Privacy model

- The capsule is decoded **locally in your browser**. It is never sent to any server.
- After setup, the capsule is cleared from memory. It is not written to localStorage, sessionStorage, cookies, or any storage.
- No analytics, no session replay, no third-party tracking in the MVP.
- The encoding is a transport mechanic, not encryption. Don't paste anything you wouldn't want decoded by a technically capable person.
- See [docs/PRD.md](docs/PRD.md) §9 for the full privacy and trust model.

## Stack

| Layer | Choice |
|---|---|
| Language | TypeScript |
| UI | React + Vite |
| Validation | Zod |
| Tests | Vitest |
| Hosting | Vercel (static) |

## Running locally

```bash
npm install
npm run dev
```

## Running tests

```bash
npx vitest run
npx vitest run --coverage
```

## Building for production

```bash
npm run build
# Output in dist/ — deploy as static assets
```

## Deployment

Deploy the `dist/` folder to Vercel, Cloudflare Pages, or any static host. The `vercel.json` in this repo includes the Content Security Policy headers. No server functions, database, or LLM API required.

## Architecture

```
Paste string
  → decodeCapsule    (I/O boundary — string → RawCapsule | Error)
  → mapPersonalisation (RawCapsule → GameConfig — personal data discarded here)
  → gameReducer      (GameConfig + actions → GameState — never sees personal data)
```

Adding a new theme: one line in `src/game/schema.ts`.
Adding a new puzzle: one entry in `src/game/puzzles.ts`.
Adding a new ending: one entry in `src/game/endings.ts`.

## Limitations

- The assistant may not have access to all past chats or persistent memory.
- Prompt instructions cannot guarantee perfect omission of sensitive details.
- Players must copy and paste between the game and their assistant.
- No backend means no cross-device save or account management in this version.
- Free-tier hosting terms can change; check them before public launch.

## Docs

- [PRD](docs/PRD.md) — product requirements
- [TRD](docs/TRD.md) — technical requirements
