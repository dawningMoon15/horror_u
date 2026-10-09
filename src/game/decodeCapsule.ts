/**
 * decodeCapsule.ts — I/O boundary: raw paste string → typed RawCapsule | Error.
 *
 * This is the trust boundary of the entire app.
 * Nothing beyond this file ever sees the raw paste string.
 *
 * Wire format: base64url( JSON.stringify(RawCapsule) )
 */

import { type RawCapsule, RawCapsuleSchema } from './schema';

const MAX_PASTE_BYTES = 8_192; // 8 KB hard cap

export type DecodeErrorReason =
  | 'too_large'
  | 'not_base64'
  | 'not_json'
  | 'schema_invalid';

export type DecodeResult =
  | { ok: true;  capsule: RawCapsule }
  | { ok: false; reason: DecodeErrorReason };

/**
 * Strip common LLM formatting artifacts before parsing.
 *
 * LLMs frequently wrap output in markdown code fences or add
 * a "Here is your capsule:" prefix. We strip these rather than
 * failing immediately, to improve UX without relaxing validation.
 * Strict Zod validation still runs on whatever remains.
 */
function sanitizePaste(raw: string): string {
  return raw
    .trim()
    .replace(/^```[\w]*\r?\n?/i, '')   // opening code fence  ```json\n or ```json\r\n
    .replace(/\r?\n?```$/,        '')   // closing code fence
    .replace(/^[\s\S]*?(?=[A-Za-z0-9+/_-]{20})/, '') // skip prose prefix, find base64 chunk
    .trim();
}

/**
 * Convert base64url → standard base64 for atob().
 */
function base64urlToBase64(s: string): string {
  return s.replace(/-/g, '+').replace(/_/g, '/');
}

/** Validate that a string looks like valid base64 (standard or url-safe). */
function isValidBase64(s: string): boolean {
  // Accepts base64 and base64url characters; padding optional
  return /^[A-Za-z0-9+/=_-]+$/.test(s) && s.length > 0;
}

export function decodeCapsule(paste: string): DecodeResult {
  // 1. Size guard — before any processing
  const byteLength = typeof Buffer !== 'undefined'
    ? Buffer.byteLength(paste, 'utf8')
    : new TextEncoder().encode(paste).length;

  if (byteLength > MAX_PASTE_BYTES) {
    return { ok: false, reason: 'too_large' };
  }

  const cleaned = sanitizePaste(paste);

  // 2. Base64 format check (before decode attempt)
  const b64 = base64urlToBase64(cleaned);
  if (!isValidBase64(b64)) {
    return { ok: false, reason: 'not_base64' };
  }

  // 3. Base64 decode — works in both browser (atob) and Node/jsdom (Buffer)
  let jsonStr: string;
  try {
    if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(b64, 'base64').toString('utf-8');
    } else {
      jsonStr = atob(b64);
    }
  } catch {
    return { ok: false, reason: 'not_base64' };
  }

  // 4. JSON parse
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { ok: false, reason: 'not_json' };
  }

  // 5. Schema validation via Zod — rejects bad enums, bad lengths, wrong version
  const result = RawCapsuleSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, reason: 'schema_invalid' };
  }

  return { ok: true, capsule: result.data };
}

/**
 * User-facing error messages keyed by reason.
 * These must NEVER reference the decoded content or raw paste.
 */
export const DECODE_ERROR_MESSAGES: Record<DecodeErrorReason, string> = {
  too_large:
    'That response is too large. Ask your assistant to be more concise and try again.',
  not_base64:
    'Could not read the format. Make sure you copied the full response without any extra characters.',
  not_json:
    'The response structure was not what was expected. Regenerate using the prompt above.',
  schema_invalid:
    'The response contained unexpected values. Regenerate using the prompt above.',
};
