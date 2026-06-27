import "server-only";
import { timingSafeEqual } from "crypto";

export const GENERIC_SERVER_ERROR = "Request could not be completed.";
export const GENERIC_UNAUTHORIZED = "Unauthorized.";

export function readPilotSession(request: Request): string | null {
  const value = request.headers.get("x-pilot-session")?.trim();
  return value || null;
}

export function readPartnerSecretHeader(request: Request): string | null {
  return request.headers.get("x-partner-secret")?.trim() || null;
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyPartnerSecretTimingSafe(secret: string | null): boolean {
  const expected = process.env.PARTNER_DASHBOARD_SECRET;
  if (!expected || !secret) return false;
  return timingSafeEqualString(secret, expected);
}

export function isValidPilotSessionId(value: string | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < 12 || trimmed.length > 128) return false;
  return !/[\r\n\t<>]/.test(trimmed);
}
