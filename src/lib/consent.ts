/**
 * Intake consent record (pure; shared by browser and server).
 *
 * The version is derived from the exact disclaimer, privacy notice, and
 * checkbox text shown on /disclaimer, so any copy change produces a new
 * version and inventors are asked to accept again.
 */
import {
  CONSENT_CONFIDENTIAL,
  CONSENT_EDUCATIONAL,
  DISCLAIMER,
  PRIVACY_NOTICE,
} from "./disclaimer";

export interface IntakeConsent {
  version: string;
  consentedAt: string;
  educational: true;
  confidential: true;
}

/** 32-bit FNV-1a, hex. Not a security hash: identifies which copy was shown. */
function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function consentVersionFor(texts: readonly string[]): string {
  return `ip-intake-v1:${fnv1a(texts.join("␞"))}`;
}

export const INTAKE_CONSENT_VERSION = consentVersionFor([
  DISCLAIMER,
  PRIVACY_NOTICE,
  CONSENT_EDUCATIONAL,
  CONSENT_CONFIDENTIAL,
]);

export const CONSENT_REQUIRED_ERROR =
  "Please review and accept the disclaimer again before generating your packet.";

const MAX_FUTURE_SKEW_MS = 5 * 60_000;
const MAX_AGE_MS = 180 * 24 * 60 * 60_000;

export function createIntakeConsent(now: Date = new Date()): IntakeConsent {
  return {
    version: INTAKE_CONSENT_VERSION,
    consentedAt: now.toISOString(),
    educational: true,
    confidential: true,
  };
}

/** Validate an untrusted consent payload. Returns a normalized copy or null. */
export function parseIntakeConsent(
  value: unknown,
  now: Date = new Date(),
): IntakeConsent | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.version !== INTAKE_CONSENT_VERSION) return null;
  if (v.educational !== true || v.confidential !== true) return null;
  if (typeof v.consentedAt !== "string" || v.consentedAt.length > 40) return null;
  const at = Date.parse(v.consentedAt);
  if (!Number.isFinite(at)) return null;
  const delta = now.getTime() - at;
  if (delta < -MAX_FUTURE_SKEW_MS || delta > MAX_AGE_MS) return null;
  return {
    version: INTAKE_CONSENT_VERSION,
    consentedAt: new Date(at).toISOString(),
    educational: true,
    confidential: true,
  };
}
