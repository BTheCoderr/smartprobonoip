import "server-only";

import { getPlatformAuth } from "@/lib/account/auth";
import { verifyPartnerSecret } from "@/lib/db/records";
import { readPartnerSecretHeader } from "@/lib/security/api";

function configuredAdminEmails(): Set<string> {
  return new Set(
    (process.env.PLATFORM_ADMIN_EMAIL ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Global partner reporting can be unlocked in two ways:
 * 1) legacy x-partner-secret header, when PARTNER_DASHBOARD_SECRET is configured;
 * 2) a signed-in SmartProBono account whose email is listed in PLATFORM_ADMIN_EMAIL.
 *
 * Organization-member auth remains scoped to each organization's portal and is
 * intentionally not treated as global reporting access here.
 */
export async function authorizePartnerAdminRequest(
  request: Request,
): Promise<boolean> {
  if (verifyPartnerSecret(readPartnerSecretHeader(request))) {
    return true;
  }

  const allowedEmails = configuredAdminEmails();
  if (allowedEmails.size === 0) return false;

  const auth = await getPlatformAuth().catch(() => null);
  const email = auth?.email?.trim().toLowerCase();
  return Boolean(email && allowedEmails.has(email));
}
