import crypto from "crypto";

/**
 * Constant-time comparison of a caller-supplied secret against the configured
 * value. Returns false (never throws) on missing/non-string input or length
 * mismatch, so it is safe to call directly with untrusted request data.
 *
 * Length is not itself secret here (the configured secrets are fixed-length
 * tokens), so an early length check is acceptable; the byte comparison for
 * equal-length inputs runs in constant time via crypto.timingSafeEqual.
 */
export function secretsMatch(provided: string | undefined | null, expected: string): boolean {
  if (typeof provided !== "string" || provided.length === 0) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
