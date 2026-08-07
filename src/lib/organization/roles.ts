import type { OrganizationMemberRole, OrganizationMemberStatus } from "./types";

export const ADMIN_ONLY_MEMBER_OPS = [
  "invite_member",
  "revoke_member",
  "change_member_role",
] as const;

export type AdminOnlyMemberOp = (typeof ADMIN_ONLY_MEMBER_OPS)[number];

export function canPerformAdminOp(
  role: OrganizationMemberRole,
  op: AdminOnlyMemberOp,
): boolean {
  void op;
  return role === "admin";
}

export function isActiveMember(status: OrganizationMemberStatus): boolean {
  return status === "active";
}

export interface MembershipCheckInput {
  userId: string;
  organizationId: string;
  clientOrganizationId?: string | null;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
}

export interface MembershipCheckResult {
  authorized: boolean;
  reason?:
    | "not_member"
    | "revoked"
    | "org_mismatch"
    | "admin_required";
}

/**
 * Never trust client-supplied organization_id — verify JWT user membership.
 */
export function verifyOrganizationMembership(
  input: MembershipCheckInput,
  options?: { requireAdmin?: boolean },
): MembershipCheckResult {
  if (
    input.clientOrganizationId &&
    input.clientOrganizationId !== input.organizationId
  ) {
    return { authorized: false, reason: "org_mismatch" };
  }

  if (!isActiveMember(input.status)) {
    return { authorized: false, reason: "revoked" };
  }

  if (options?.requireAdmin && !canPerformAdminOp(input.role, "invite_member")) {
    return { authorized: false, reason: "admin_required" };
  }

  return { authorized: true };
}

export function memberCanAccessReferral(
  membershipOrganizationId: string,
  referralOrganizationId: string,
  status: OrganizationMemberStatus,
): boolean {
  if (!isActiveMember(status)) return false;
  return membershipOrganizationId === referralOrganizationId;
}
