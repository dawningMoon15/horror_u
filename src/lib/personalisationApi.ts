/**
 * personalisationApi.ts — Free AI Asset & Lore Generation for THE CONTEXT.
 *
 * Explores and integrates free API capabilities:
 * 1. Pollinations.ai (100% FREE, no API key needed):
 *    - Image generation: https://image.pollinations.ai/prompt/...
 *    - Lore generation: https://text.pollinations.ai/...
 * 2. Procedural Horror Synth:
 *    - Generates personalized blood-soaked room variations, anomaly reports,
 *      and clue titles directly from the player's memory capsule without needing a backend.
 */

import type { ThemeToken, AestheticToken, ToneToken } from '../game/schema';

export interface PersonalisedAssetConfig {
  theme: ThemeToken;
  aesthetic: AestheticToken;
  tone: ToneToken;
  anomalyName: string;
  bloodDecalColor: string;
  loreSnippet: string;
  generatedImageUrl?: string;
}

/**
 * Builds a dynamic Pollinations.ai URL for custom visual asset generation.
 * Zero API keys, completely free.
 */
export function buildDynamicHorrorPrompt(
  roomType: 'desk' | 'records' | 'vault' | 'ending',
  theme: ThemeToken,
  aesthetic: AestheticToken
): string {
  const basePrompts: Record<string, string> = {
    desk: `dark cinematic horror game room, 1980s retro terminal computer desk, blood splatters, ${theme} artifacts on desk, ${aesthetic} style, intense crimson emergency alarm lighting, photorealistic`,
    records: `dark underground archive filing room, blood splatters and bloody handprints on metal cabinets, classified files about ${theme}, ${aesthetic} atmosphere, flashing red strobe lights, photorealistic`,
    vault: `heavy reinforced steel vault blast door, digital keypad, dripping blood, ${theme} emergency warning signage, ${aesthetic} horror aesthetic, crimson hazard light, photorealistic`,
    ending: `glowing blinding white vertical portal door, blood-stained concrete floor, misty chamber, ${theme} psychological anomaly resolution, cinematic lighting`,
  };

  const prompt = basePrompts[roomType] || basePrompts.desk;
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=768&nologo=true&seed=42`;
}

/**
 * Returns procedural personalized anomaly lore based on player capsule values.
 */
export function getPersonalisedAnomalyData(
  theme?: ThemeToken,
  aesthetic?: AestheticToken,
  tone?: ToneToken
): PersonalisedAssetConfig {
  const currentTheme: ThemeToken = theme ?? 'retro_computers';
  const currentAesthetic: AestheticToken = aesthetic ?? 'brutalist_digital';
  const currentTone: ToneToken = tone ?? 'clinical';

  const loreDatabase: Record<ThemeToken, { name: string; snippet: string; color: string }> = {
    retro_computers: {
      name: 'MAGNETIC PARITY FLIP // SECTOR 0x09',
      snippet: 'Tape spools found tangled in coagulated blood. The CPU clock cycle refuses to halt.',
      color: '#ff1744',
    },
    astronomy: {
      name: 'CELESTIAL OCCULTATION ANOMALY',
      snippet: 'The telescope calibration data shows stars disappearing one by one behind a growing dark void.',
      color: '#e50914',
    },
    nature: {
      name: 'CARNIVOROUS SPORE OUTBREAK',
      snippet: 'Black fungal filaments creeping out of the floor grating, secreting thick crimson sap.',
      color: '#d00000',
    },
    cooking: {
      name: 'ORGANIC TISSUE DEGRADATION',
      snippet: 'Biological residues calcified across the counter surfaces under flickering crimson lamps.',
      color: '#9d0208',
    },
    true_crime: {
      name: 'CLASSIFIED EVIDENCE FILE 87-B',
      snippet: 'Forensic records stained with fresh arterial blood. Fingerprints matching no known citizen.',
      color: '#b7094c',
    },
    mythology: {
      name: 'LABYRINTH BEACON MANIFESTATION',
      snippet: 'Carvings in the steel wall bleeding dark red ichor. An ancient presence pacing behind the blast door.',
      color: '#a01a58',
    },
    gaming: {
      name: 'INFINITE EXECUTION LOOP',
      snippet: 'CRT refresh rates vibrating at human resonant frequency. The screen displays bloody sprites.',
      color: '#c9184a',
    },
    music: {
      name: 'RESONANT INFRASOUND CASCADE',
      snippet: 'Sub-audible vibrations causing capillary hemorrhaging. Blood dripping from the audio monitor.',
      color: '#89023e',
    },
    literature: {
      name: 'AUTOBIOGRAPHICAL ANOMALY MANIFEST',
      snippet: 'Passages from lost memoirs appearing on the terminal screen in fresh bloody text.',
      color: '#ad2831',
    },
    film: {
      name: 'BURNING CELLULOID PROJECTION',
      snippet: '35mm projector spools spinning out of control, projecting shadows of a screaming figure.',
      color: '#640d14',
    },
  };

  const lore = loreDatabase[currentTheme] || loreDatabase.retro_computers;

  return {
    theme: currentTheme,
    aesthetic: currentAesthetic,
    tone: currentTone,
    anomalyName: lore.name,
    bloodDecalColor: lore.color,
    loreSnippet: lore.snippet,
  };
}
