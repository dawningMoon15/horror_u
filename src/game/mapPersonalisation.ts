/**
 * mapPersonalisation.ts — ValidatedCapsule → GameConfig.
 *
 * This is where personal data SHRINKS.
 * Input:  RawCapsule (has themes, motifs, aesthetic, tone)
 * Output: GameConfig (has only opaque IDs and enums — no personal strings)
 *
 * After this function runs, the RawCapsule is discarded.
 * The game engine only ever sees GameConfig.
 */

import { type RawCapsule, type GameConfig, PROGRESS_SCHEMA_VERSION } from './schema';
import { validateSessionToken } from './session';

/** Maps theme tokens to prewritten clue variant IDs. */
const THEME_TO_CLUE_VARIANTS: Record<string, string[]> = {
  astronomy:       ['clue_stars_a', 'clue_observatory_b'],
  retro_computers: ['clue_terminal_a', 'clue_floppy_b'],
  true_crime:      ['clue_casefile_a', 'clue_photo_b'],
  mythology:       ['clue_runes_a', 'clue_altar_b'],
  gaming:          ['clue_cartridge_a', 'clue_highscore_b'],
  music:           ['clue_vinyl_a', 'clue_notation_b'],
  literature:      ['clue_manuscript_a', 'clue_bookmark_b'],
  cooking:         ['clue_recipe_a', 'clue_spice_b'],
  nature:          ['clue_specimen_a', 'clue_pressed_b'],
  film:            ['clue_reel_a', 'clue_clapboard_b'],
};

/** Maps aesthetic tokens to a numeric puzzle seed (0–999). */
const AESTHETIC_TO_SEED: Record<string, number> = {
  rainy_noir:        0,
  cozy_unease:       111,
  brutalist_digital: 222,
  solarpunk_decay:   333,
  vaporwave_horror:  444,
};

/** Maps tone tokens to ending variant. */
const TONE_TO_ENDING: Record<string, GameConfig['endingVariant']> = {
  slow_dread:  'LOOP',
  paranoid:    'TRANSCEND',
  melancholic: 'LOOP',
  surreal:     'TRANSCEND',
  clinical:    'LOOP',
};

export interface MapResult {
  ok: true;
  config: GameConfig;
}

export interface MapError {
  ok: false;
  reason: 'session_mismatch';
}

export function mapPersonalisation(
  capsule: RawCapsule,
  expectedSession: string,
): MapResult | MapError {
  // Reject stale capsules generated for a different session
  if (!validateSessionToken(expectedSession, capsule.session)) {
    return { ok: false, reason: 'session_mismatch' };
  }

  // Pick clue variants from the first matched theme
  const primaryTheme = capsule.themes[0];
  const clueVariantIds = THEME_TO_CLUE_VARIANTS[primaryTheme] ?? ['clue_default_a'];

  const config: GameConfig = {
    schemaVersion:  PROGRESS_SCHEMA_VERSION,
    themeId:        primaryTheme,
    visualVariant:  capsule.aesthetic,
    clueVariantIds,
    puzzleSeed:     AESTHETIC_TO_SEED[capsule.aesthetic] ?? 0,
    endingVariant:  TONE_TO_ENDING[capsule.tone] ?? 'LOOP',
  };

  return { ok: true, config };
}

/** Generic (no-personalisation) GameConfig — exercises every puzzle and ending. */
export const GENERIC_GAME_CONFIG: GameConfig = {
  schemaVersion:  PROGRESS_SCHEMA_VERSION,
  themeId:        'retro_computers',
  visualVariant:  'brutalist_digital',
  clueVariantIds: ['clue_terminal_a', 'clue_floppy_b'],
  puzzleSeed:     222,
  endingVariant:  'LOOP',
};
