import { NextResponse } from "next/server";
import {
  isOrgAuthContext,
  requireOrganizationAuth,
} from "@/lib/organization/auth";
import { computeOrganizationMetrics } from "@/lib/organization/metrics";
import { getAllReferralsForOrganization } from "@/lib/db/organizationReferrals";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const clientOrgId = url.searchParams.get("organization_id");

  const auth = await requireOrganizationAuth({
    clientOrganizationId: clientOrgId,
  });
  if (!isOrgAuthContext(auth)) return auth;

  const referrals = await getAllReferralsForOrganization(
    auth.membership.organizationId,
  );
  const metrics = computeOrganizationMetrics(referrals);

  return NextResponse.json({ metrics });
}
