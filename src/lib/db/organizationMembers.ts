import "server-only";
import type {
  OrganizationMemberRecord,
  OrganizationMemberRole,
  OrganizationMemberStatus,
} from "@/lib/organization/types";
import { getSupabaseService } from "@/lib/supabaseServer";

const SELECT =
  "id, organization_id, user_id, email, role, status, invited_at, joined_at";

interface DbMemberRow {
  id: string;
  organization_id: string;
  user_id: string;
  email: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
  invited_at: string;
  joined_at: string | null;
}

function mapRow(row: DbMemberRow): OrganizationMemberRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    email: row.email,
    role: row.role,
    status: row.status,
    invitedAt: row.invited_at,
    joinedAt: row.joined_at,
  };
}

export async function getActiveMembershipForUser(
  userId: string,
  organizationId?: string,
): Promise<OrganizationMemberRecord | null> {
  const sb = getSupabaseService();
  let query = sb
    .from("organization_members")
    .select(SELECT)
    .eq("user_id", userId)
    .eq("status", "active");

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error || !data) return null;
  return mapRow(data as DbMemberRow);
}

export async function listOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMemberRecord[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("organization_members")
    .select(SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as DbMemberRow[]).map(mapRow);
}

export async function upsertOrganizationMember(input: {
  organizationId: string;
  userId: string;
  email: string;
  role: OrganizationMemberRole;
}): Promise<OrganizationMemberRecord | null> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("organization_members")
    .upsert(
      {
        organization_id: input.organizationId,
        user_id: input.userId,
        email: input.email,
        role: input.role,
        status: "active",
        joined_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,user_id" },
    )
    .select(SELECT)
    .single();
  if (error || !data) return null;
  return mapRow(data as DbMemberRow);
}

export async function revokeOrganizationMember(
  memberId: string,
  organizationId: string,
): Promise<boolean> {
  const sb = getSupabaseService();
  const { error } = await sb
    .from("organization_members")
    .update({ status: "revoked" })
    .eq("id", memberId)
    .eq("organization_id", organizationId);
  return !error;
}

export async function updateOrganizationMemberRole(
  memberId: string,
  organizationId: string,
  role: OrganizationMemberRole,
): Promise<boolean> {
  const sb = getSupabaseService();
  const { error } = await sb
    .from("organization_members")
    .update({ role })
    .eq("id", memberId)
    .eq("organization_id", organizationId)
    .eq("status", "active");
  return !error;
}
