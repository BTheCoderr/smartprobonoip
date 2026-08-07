import { NextResponse } from "next/server";
import {
  isOrgAuthContext,
  requireOrganizationAuth,
} from "@/lib/organization/auth";
import {
  revokeOrganizationMember,
  updateOrganizationMemberRole,
} from "@/lib/db/organizationMembers";
import {
  ORGANIZATION_MEMBER_ROLES,
  type OrganizationMemberRole,
} from "@/lib/organization/types";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { readJsonWithLimit } from "@/lib/security/requestLimits";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { id } = await params;
  const body = (await readJsonWithLimit(request)) as {
    role?: string;
    organization_id?: string;
  };

  const auth = await requireOrganizationAuth({
    clientOrganizationId: body.organization_id,
    requireAdmin: true,
  });
  if (!isOrgAuthContext(auth)) return auth;

  const role = body.role?.trim() as OrganizationMemberRole | undefined;
  if (!role || !(ORGANIZATION_MEMBER_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const ok = await updateOrganizationMemberRole(
    id,
    auth.membership.organizationId,
    role,
  );
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
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
    requireAdmin: true,
  });
  if (!isOrgAuthContext(auth)) return auth;

  if (id === auth.membership.id) {
    return NextResponse.json({ error: "Cannot revoke self" }, { status: 400 });
  }

  const ok = await revokeOrganizationMember(id, auth.membership.organizationId);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
