import { NextResponse } from "next/server";
import { getOrganizationReferralById } from "@/lib/db/organizationReferrals";
import { getSharedProfessionalHandoffForReferral } from "@/lib/handoff/canonicalMapper";
import {
  isOrgAuthContext,
  requireOrganizationAuth,
} from "@/lib/organization/auth";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await requireOrganizationAuth();
  if (!isOrgAuthContext(auth)) return auth;

  const { id } = await params;
  const referral = await getOrganizationReferralById(
    id,
    auth.membership.organizationId,
  );
  if (!referral) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const handoff = await getSharedProfessionalHandoffForReferral({
      organizationId: auth.membership.organizationId,
      referralId: id,
    });
    return NextResponse.json({ handoff });
  } catch (err) {
    logServerError("organization.shared_handoff.get", err, {
      organizationId: auth.membership.organizationId,
      referralId: id,
    });
    return NextResponse.json(
      { error: "Could not load the shared intake." },
      { status: 500 },
    );
  }
}
