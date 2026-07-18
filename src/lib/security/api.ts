import "server-only";
import { isValidPilotSessionId } from "@/lib/security/apiSession";
import { verifyPartnerSecretValue } from "@/lib/security/partnerAuth";
import {
  GENERIC_SERVER_ERROR,
  GENERIC_UNAUTHORIZED,
} from "@/lib/security/publicErrors";

export { isValidPilotSessionId, GENERIC_SERVER_ERROR, GENERIC_UNAUTHORIZED };

export function readPilotSession(request: Request): string | null {
  const value = request.headers.get("x-pilot-session")?.trim();
  return value || null;
}

export function readPartnerSecretHeader(request: Request): string | null {
  return request.headers.get("x-partner-secret")?.trim() || null;
}

export function verifyPartnerSecretTimingSafe(secret: string | null): boolean {
  return verifyPartnerSecretValue(secret, process.env.PARTNER_DASHBOARD_SECRET);
}
