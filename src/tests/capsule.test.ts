/**
 * capsule.test.ts — Tests for the capsule decode pipeline.
 *
 * IMPORTANT: Never log or snapshot decoded capsule content here.
 * Tests assert shape and error codes — not personal data values.
 */

import { describe, it, expect } from 'vitest';
import { decodeCapsule } from '../game/decodeCapsule';
import type { RawCapsule } from '../game/schema';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Encode a capsule object into base64 — uses Buffer in Node, btoa in browser */
function encodeCapsule(capsule: unknown): string {
  const json = JSON.stringify(capsule);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(json).toString('base64');
  }
  return btoa(json);
}

const VALID_CAPSULE: RawCapsule = {
  version:   '1',
  session:   '00000000-0000-0000-0000-000000000001',
  themes:    ['astronomy'],
  aesthetic: 'rainy_noir',
  motifs:    ['stars', 'night'],
  tone:      'slow_dread',
};

// ─── Happy path ──────────────────────────────────────────────────────────────

describe('decodeCapsule — valid input', () => {
  it('decodes a well-formed capsule', () => {
    const encoded = encodeCapsule(VALID_CAPSULE);
    const result = decodeCapsule(encoded);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.capsule.version).toBe('1');
      // Do NOT assert specific personal values here
      expect(result.capsule.themes.length).toBeGreaterThan(0);
    }
  });

  it('strips a markdown code fence and still decodes', () => {
    const encoded = encodeCapsule(VALID_CAPSULE);
    const fenced  = `\`\`\`json\n${encoded}\n\`\`\``;
    const result  = decodeCapsule(fenced);
    expect(result.ok).toBe(true);
  });

  it('strips a conversational prefix and still decodes', () => {
    const encoded = encodeCapsule(VALID_CAPSULE);
    const result  = decodeCapsule(`Here is your capsule: ${encoded}`);
    // sanitizePaste strips non-base64 prefix
    // This test validates the UX fallback for common LLM artifacts
    expect(result.ok).toBe(true);
  });
});

// ─── Error cases ─────────────────────────────────────────────────────────────

describe('decodeCapsule — invalid input', () => {
  it('rejects empty string', () => {
    const result = decodeCapsule('');
    expect(result.ok).toBe(false);
  });

  it('rejects input exceeding size limit', () => {
    const huge = 'A'.repeat(9_000);
    const result = decodeCapsule(huge);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('too_large');
  });

  it('rejects non-base64 input', () => {
    const result = decodeCapsule('not-valid-base64!!!');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_base64');
  });

  it('rejects valid base64 that is not JSON', () => {
    const result = decodeCapsule(btoa('hello world'));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_json');
  });

  it('rejects a capsule with wrong version', () => {
    const result = decodeCapsule(encodeCapsule({ ...VALID_CAPSULE, version: '99' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('schema_invalid');
  });

  it('rejects a capsule with an unknown theme', () => {
    const result = decodeCapsule(encodeCapsule({ ...VALID_CAPSULE, themes: ['__evil_theme__'] }));
    expect(result.ok).toBe(false);
  });

  it('rejects a capsule with too many themes', () => {
    const result = decodeCapsule(encodeCapsule({
      ...VALID_CAPSULE,
      themes: ['astronomy', 'gaming', 'music', 'cooking', 'film', 'nature'],
    }));
    expect(result.ok).toBe(false);
  });

  it('rejects a motif with HTML content', () => {
    const result = decodeCapsule(encodeCapsule({
      ...VALID_CAPSULE,
      motifs: ['<script>alert(1)</script>'],
    }));
    expect(result.ok).toBe(false);
  });

  it('strips unknown extra fields (Zod default strips, not rejects)', () => {
    // By default Zod .strip()s unknown fields — the capsule is still valid.
    // To change this to strict rejection, add .strict() to RawCapsuleSchema.
    // The test documents the current intentional behaviour.
    const result = decodeCapsule(encodeCapsule({
      ...VALID_CAPSULE,
      injectedField: 'bad',
    }));
    // Zod strips the unknown field and the capsule passes
    expect(result.ok).toBe(true);
    if (result.ok) {
      // The injected field must NOT appear in the parsed capsule
      expect((result.capsule as Record<string, unknown>)['injectedField']).toBeUndefined();
    }
  });

  it('never echoes decoded content in result on failure', () => {
    const malicious = encodeCapsule({ ...VALID_CAPSULE, version: 'evil', personal: 'private' });
    const result = decodeCapsule(malicious);
    expect(result.ok).toBe(false);
    // Ensure the result object has no trace of the input content
    expect(JSON.stringify(result)).not.toContain('private');
    expect(JSON.stringify(result)).not.toContain('evil');
  });
});
