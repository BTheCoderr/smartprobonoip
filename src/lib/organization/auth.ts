import "server-only";
import { NextResponse } from "next/server";
import { verifyOrganizationMembership } from "@/lib/organization/roles";
import type { OrganizationMemberRecord } from "@/lib/organization/types";
import { getActiveMembershipForUser } from "@/lib/db/organizationMembers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GENERIC_UNAUTHORIZED } from "@/lib/security/api";

export interface OrganizationAuthContext {
  userId: string;
  email: string;
  membership: OrganizationMemberRecord;
}

export async function requireOrganizationAuth(options?: {
  organizationId?: string;
  requireAdmin?: boolean;
  clientOrganizationId?: string | null;
}): Promise<OrganizationAuthContext | NextResponse> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 401 });
  }

  const membership = await getActiveMembershipForUser(
    data.user.id,
    options?.organizationId,
  );
  if (!membership) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 403 });
  }

  const check = verifyOrganizationMembership(
    {
      userId: data.user.id,
      organizationId: membership.organizationId,
      clientOrganizationId: options?.clientOrganizationId,
      role: membership.role,
      status: membership.status,
    },
    { requireAdmin: options?.requireAdmin },
  );

  if (!check.authorized) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 403 });
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? membership.email,
    membership,
  };
}

export function isOrgAuthContext(
  value: OrganizationAuthContext | NextResponse,
): value is OrganizationAuthContext {
  return !(value instanceof NextResponse);
}
