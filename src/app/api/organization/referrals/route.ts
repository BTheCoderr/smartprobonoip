import { NextResponse } from "next/server";
import {
  isOrgAuthContext,
  requireOrganizationAuth,
} from "@/lib/organization/auth";
import { listOrganizationReferrals } from "@/lib/db/organizationReferrals";
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

  const referrals = await listOrganizationReferrals(auth.membership.organizationId);
  return NextResponse.json({ referrals });
}
