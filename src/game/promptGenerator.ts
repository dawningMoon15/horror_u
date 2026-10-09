/**
 * promptGenerator.ts — Generates the provider-neutral prompt for external LLMs
 * and test capsule generators.
 *
 * The prompt asks the assistant to select broad interest categories from
 * allowlists and return a compact base64-encoded JSON capsule.
 */

import {
  THEMES,
  AESTHETICS,
  TONES,
  CAPSULE_SCHEMA_VERSION,
  type ThemeToken,
  type RawCapsule,
} from './schema';

/**
 * Generates the instructions to be copied into ChatGPT, Claude, Gemini, etc.
 */
export function generatePrompt(sessionToken: string): string {
  return `You are helping configure a fictional retro-computer mystery escape room game called "THE CONTEXT".

Based ONLY on harmless, high-level interests you might observe from our conversations (or general curiosity), generate a compact memory capsule.

CRITICAL SAFETY & PRIVACY RULES:
1. DO NOT include any personal identifiers, names, usernames, emails, addresses, or locations.
2. DO NOT include passwords, keys, secrets, financial, medical, or sensitive data.
3. DO NOT include direct quotes, chat logs, trauma, or specific autobiographical events.
4. ONLY choose values from the allowlists below.

SCHEMA REQUIREMENTS:
- version: "${CAPSULE_SCHEMA_VERSION}"
- session: "${sessionToken}" (must match this exact UUID)
- themes: Array of 1 to 3 items chosen strictly from:
  [${THEMES.map((t) => `"${t}"`).join(', ')}]
- aesthetic: Exactly 1 item chosen strictly from:
  [${AESTHETICS.map((a) => `"${a}"`).join(', ')}]
- motifs: Array of 1 to 3 short abstract words (each max 32 characters, letters/numbers/spaces/hyphens only; e.g. ["signal", "clockwork", "fog"])
- tone: Exactly 1 item chosen strictly from:
  [${TONES.map((t) => `"${t}"`).join(', ')}]

OUTPUT INSTRUCTIONS:
Create the JSON object:
{
  "version": "${CAPSULE_SCHEMA_VERSION}",
  "session": "${sessionToken}",
  "themes": [...],
  "aesthetic": "...",
  "motifs": [...],
  "tone": "..."
}

Convert that exact JSON string into base64.
IMPORTANT: Return ONLY the raw base64 string. Do NOT write any introduction, markdown formatting, code fences (\`\`\`), or explanation. Output ONLY the base64 payload.`;
}

/**
 * Generates a valid sample capsule in base64url/base64 for testing and instant preview.
 */
export function generateSampleCapsule(
  sessionToken: string,
  theme: ThemeToken = 'retro_computers',
): string {
  const capsule: RawCapsule = {
    version: CAPSULE_SCHEMA_VERSION,
    session: sessionToken,
    themes: [theme],
    aesthetic: 'brutalist_digital',
    motifs: ['green phosphor', 'terminal tape'],
    tone: 'paranoid',
  };

  const json = JSON.stringify(capsule);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(json).toString('base64');
  }
  return btoa(json);
}
