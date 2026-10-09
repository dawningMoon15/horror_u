/**
 * schema.ts — Single source of truth for all data contracts.
 *
 * ALL allowlists, enums, and Zod schemas live here.
 * TypeScript types, runtime validation, and the personalisation mapper
 * all derive from this file. Adding a new theme = one line here.
 *
 * Wire format (v1):
 *   base64url( JSON.stringify(RawCapsule) )
 *
 * base64url avoids '+' and '/' which some LLMs corrupt in copy-paste.
 * The prompt instructs the LLM to output ONLY the encoded string —
 * no markdown fences, no prefix text.
 */

import { z } from 'zod';

// ─── Schema version ────────────────────────────────────────────────────────
export const CAPSULE_SCHEMA_VERSION = '1' as const;
export const PROGRESS_SCHEMA_VERSION = '1' as const;

// ─── Allowlists (source of truth) ──────────────────────────────────────────

export const THEMES = [
  'astronomy',
  'retro_computers',
  'true_crime',
  'mythology',
  'gaming',
  'music',
  'literature',
  'cooking',
  'nature',
  'film',
] as const;

export const AESTHETICS = [
  'rainy_noir',
  'cozy_unease',
  'brutalist_digital',
  'solarpunk_decay',
  'vaporwave_horror',
] as const;

export const TONES = [
  'slow_dread',
  'paranoid',
  'melancholic',
  'surreal',
  'clinical',
] as const;

export const ENDINGS = ['TRANSCEND', 'LOOP'] as const;

// ─── Derived TypeScript types ───────────────────────────────────────────────
export type ThemeToken     = (typeof THEMES)[number];
export type AestheticToken = (typeof AESTHETICS)[number];
export type ToneToken      = (typeof TONES)[number];
export type EndingVariant  = (typeof ENDINGS)[number];

// ─── Zod schemas (derived from the same allowlists — zero duplication) ──────

/** Motif: a short freeform token. No HTML, no quotes, no URLs. */
const MotifSchema = z
  .string()
  .min(1)
  .max(32)
  .regex(/^[\w\s-]+$/, 'Motif may only contain word characters, spaces, or hyphens');

/** The raw capsule — as decoded from the LLM response. */
export const RawCapsuleSchema = z.object({
  version:   z.literal(CAPSULE_SCHEMA_VERSION),
  // Accept any UUID-shaped string — crypto.randomUUID() always produces valid v4,
  // but test fixtures may use all-zeros UUIDs which fail Zod's strict RFC check.
  session:   z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'session must be UUID-shaped',
  ),
  themes:    z.array(z.enum(THEMES)).min(1).max(5),
  aesthetic: z.enum(AESTHETICS),
  motifs:    z.array(MotifSchema).max(3),
  tone:      z.enum(TONES),
  checksum:  z.string().regex(/^[0-9a-f]{8}$/).optional(),
});

export type RawCapsule = z.infer<typeof RawCapsuleSchema>;

/**
 * GameConfig — the minimal, de-personalised object the game engine consumes.
 * Personal data is gone by this point; only safe, opaque IDs remain.
 */
export const GameConfigSchema = z.object({
  schemaVersion:  z.literal(PROGRESS_SCHEMA_VERSION),
  themeId:        z.enum(THEMES),
  visualVariant:  z.enum(AESTHETICS),
  clueVariantIds: z.array(z.string()),
  puzzleSeed:     z.number().int().min(0).max(999),
  endingVariant:  z.enum(ENDINGS),
});

export type GameConfig = z.infer<typeof GameConfigSchema>;

/**
 * PersistedProgress — safe to write to sessionStorage.
 * Contains NO capsule content, NO GameConfig personal fields.
 * Only opaque flag IDs and level number.
 */
export const PersistedProgressSchema = z.object({
  schemaVersion: z.literal(PROGRESS_SCHEMA_VERSION),
  level:         z.union([z.literal(1), z.literal(2), z.literal(3)]),
  clueFlags:     z.array(z.string()),
  hintsUsed:     z.number().int().min(0),
});

export type PersistedProgress = z.infer<typeof PersistedProgressSchema>;
