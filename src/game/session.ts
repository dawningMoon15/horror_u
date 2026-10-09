/**
 * session.ts — Session token management.
 *
 * A session token is a per-page-load correlation ID.
 * Its only job: reject a capsule that was generated for a different
 * session (e.g. the user pasted an old response from last week).
 *
 * It is NOT a secret. It appears in the prompt sent to the LLM.
 * Do not use it as an encryption key or authenticity proof.
 * Do not persist it across page loads.
 */

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

/**
 * Constant-time string comparison.
 * Not required for a non-secret, but establishes good habits
 * for if this ever graduates to a real security boundary.
 */
export function validateSessionToken(expected: string, received: string): boolean {
  if (expected.length !== received.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  }
  return diff === 0;
}
