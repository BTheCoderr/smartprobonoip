import { createHash, timingSafeEqual } from "crypto";

/** Hash before compare so unequal lengths do not short-circuit on string length. */
export function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = createHash("sha256").update(a).digest();
  const bufB = createHash("sha256").update(b).digest();
  return timingSafeEqual(bufA, bufB);
}

export function verifyPartnerSecretValue(
  secret: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!expected || !secret) return false;
  return timingSafeEqualString(secret, expected);
}
