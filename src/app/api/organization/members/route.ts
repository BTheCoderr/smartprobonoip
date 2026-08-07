import { NextResponse } from "next/server";
import {
  isOrgAuthContext,
  requireOrganizationAuth,
} from "@/lib/organization/auth";
import {
  listOrganizationMembers,
  upsertOrganizationMember,
} from "@/lib/db/organizationMembers";
import {
  ORGANIZATION_MEMBER_ROLES,
  type OrganizationMemberRole,
} from "@/lib/organization/types";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { readJsonWithLimit } from "@/lib/security/requestLimits";

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const clientOrgId = url.searchParams.get("organization_id");

  const auth = await requireOrganizationAuth({
    clientOrganizationId: clientOrgId,
    requireAdmin: true,
  });
  if (!isOrgAuthContext(auth)) return auth;

  const members = await listOrganizationMembers(auth.membership.organizationId);
  return NextResponse.json({ members });
}

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = (await readJsonWithLimit(request)) as {
    userId?: string;
    email?: string;
    role?: string;
    organization_id?: string;
  };

  const auth = await requireOrganizationAuth({
    clientOrganizationId: body.organization_id,
    requireAdmin: true,
  });
  if (!isOrgAuthContext(auth)) return auth;

  const userId = body.userId?.trim();
  const email = body.email?.trim();
  const role = body.role?.trim() as OrganizationMemberRole | undefined;

  if (!userId || !email) {
    return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
  }
  if (!role || !(ORGANIZATION_MEMBER_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const member = await upsertOrganizationMember({
    organizationId: auth.membership.organizationId,
    userId,
    email,
    role,
  });

  if (!member) {
    return NextResponse.json({ error: "Could not add member" }, { status: 500 });
  }

  return NextResponse.json({ member });
}
