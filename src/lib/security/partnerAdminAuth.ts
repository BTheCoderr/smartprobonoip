import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyPartnerSecret } from "@/lib/db/records";
import { readPartnerSecretHeader } from "@/lib/security/api";
import { isAllowedPlatformAdmin } from "@/lib/security/partnerAdminPolicy";

/** Use a verified Supabase cookie, never browser-provided email or user metadata. */
export async function authorizePartnerAdminRequest(request: Request): Promise<boolean> {
  if (verifyPartnerSecret(readPartnerSecretHeader(request))) return true;
  const configuredAdmins = process.env.PLATFORM_ADMIN_EMAIL;
  if (!configuredAdmins?.trim()) return false;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return false;
    return isAllowedPlatformAdmin(
      { id: data.user.id, email: data.user.email, emailConfirmed: Boolean(data.user.email_confirmed_at) },
      configuredAdmins,
    );
  } catch {
    return false;
  }
}
