import { NextResponse } from "next/server";
import {
  isOrgAuthContext,
  requireOrganizationAuth,
} from "@/lib/organization/auth";
import {
  getOrganizationReferralById,
  referralToOrgApiView,
  updateOrganizationReferralStatus,
} from "@/lib/db/organizationReferrals";
import { ORGANIZATION_REFERRAL_STATUSES } from "@/lib/organization/types";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { readJsonWithLimit } from "@/lib/security/requestLimits";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { id } = await params;
  const url = new URL(request.url);
  const clientOrgId = url.searchParams.get("organization_id");

  const auth = await requireOrganizationAuth({
    clientOrganizationId: clientOrgId,
  });
  if (!isOrgAuthContext(auth)) return auth;

  const referral = await getOrganizationReferralById(
    id,
    auth.membership.organizationId,
  );
  if (!referral) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ referral: referralToOrgApiView(referral) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { id } = await params;
  const body = (await readJsonWithLimit(request)) as {
    status?: string;
    organization_id?: string;
  };

  const auth = await requireOrganizationAuth({
    clientOrganizationId: body.organization_id,
  });
  if (!isOrgAuthContext(auth)) return auth;

  const status = body.status?.trim();
  if (
    !status ||
    !(ORGANIZATION_REFERRAL_STATUSES as readonly string[]).includes(status)
  ) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await updateOrganizationReferralStatus({
    referralId: id,
    organizationId: auth.membership.organizationId,
    status: status as (typeof ORGANIZATION_REFERRAL_STATUSES)[number],
    actorUserId: auth.userId,
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ referral: referralToOrgApiView(updated) });
}
