import "server-only";
import { sanitizeReferralForOrgView } from "@/lib/organization/snapshot";
import type {
  OrganizationConsentRecord,
  OrganizationReferralListItem,
  OrganizationReferralRecord,
  OrganizationReferralStatus,
  SharedSnapshotPayload,
} from "@/lib/organization/types";
import { getSupabaseService } from "@/lib/supabaseServer";
import { appendReferralEvent } from "./organizationEvents";

const SELECT =
  "id, organization_id, project_id, status, shared_snapshot, consent_record, referral_reason, registry_partner_id, recommendation_id, first_status_at, created_at, updated_at";

interface DbReferralRow {
  id: string;
  organization_id: string;
  project_id: string;
  status: OrganizationReferralStatus;
  shared_snapshot: SharedSnapshotPayload;
  consent_record: OrganizationConsentRecord;
  referral_reason: string | null;
  registry_partner_id: string | null;
  recommendation_id: string | null;
  first_status_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: DbReferralRow): OrganizationReferralRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    projectId: row.project_id,
    status: row.status,
    sharedSnapshot: row.shared_snapshot,
    consentRecord: row.consent_record,
    referralReason: row.referral_reason,
    registryPartnerId: row.registry_partner_id,
    recommendationId: row.recommendation_id,
    firstStatusAt: row.first_status_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toListItem(row: OrganizationReferralRecord): OrganizationReferralListItem {
  const snapshot = sanitizeReferralForOrgView(row.sharedSnapshot);
  return {
    id: row.id,
    organizationId: row.organizationId,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    firstStatusAt: row.firstStatusAt,
    readinessScore: snapshot.readiness?.overallScore ?? null,
    referralReason: row.referralReason,
    hasTitle: Boolean(snapshot.invention?.title),
    hasSummary: Boolean(snapshot.invention?.plainSummary),
  };
}

export async function createOrganizationReferral(input: {
  organizationId: string;
  projectId: string;
  sharedSnapshot: SharedSnapshotPayload;
  consentRecord: OrganizationConsentRecord;
  referralReason?: string | null;
  registryPartnerId?: string | null;
  recommendationId?: string | null;
}): Promise<OrganizationReferralRecord | null> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("organization_referrals")
    .insert({
      organization_id: input.organizationId,
      project_id: input.projectId,
      status: "received",
      shared_snapshot: input.sharedSnapshot,
      consent_record: input.consentRecord,
      referral_reason: input.referralReason ?? null,
      registry_partner_id: input.registryPartnerId ?? null,
      recommendation_id: input.recommendationId ?? null,
    })
    .select(SELECT)
    .single();

  if (error || !data) return null;
  const referral = mapRow(data as DbReferralRow);

  await appendReferralEvent({
    referralId: referral.id,
    organizationId: referral.organizationId,
    eventType: "referral_created",
    actorType: "inventor",
    actorId: input.projectId,
    newStatus: "received",
  });
  await appendReferralEvent({
    referralId: referral.id,
    organizationId: referral.organizationId,
    eventType: "snapshot_shared",
    actorType: "inventor",
    actorId: input.projectId,
    metadata: {
      sharedFieldKeys: input.sharedSnapshot.sharedFieldKeys,
    },
  });

  return referral;
}

export async function listOrganizationReferrals(
  organizationId: string,
): Promise<OrganizationReferralListItem[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("organization_referrals")
    .select(SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as DbReferralRow[]).map(mapRow).map(toListItem);
}

export async function getOrganizationReferralById(
  referralId: string,
  organizationId: string,
): Promise<OrganizationReferralRecord | null> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("organization_referrals")
    .select(SELECT)
    .eq("id", referralId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as DbReferralRow);
}

export async function updateOrganizationReferralStatus(input: {
  referralId: string;
  organizationId: string;
  status: OrganizationReferralStatus;
  actorUserId: string;
}): Promise<OrganizationReferralRecord | null> {
  const sb = getSupabaseService();
  const existing = await getOrganizationReferralById(
    input.referralId,
    input.organizationId,
  );
  if (!existing) return null;

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status: input.status,
    updated_at: now,
  };
  if (!existing.firstStatusAt && input.status !== "received") {
    patch.first_status_at = now;
  }

  const { data, error } = await sb
    .from("organization_referrals")
    .update(patch)
    .eq("id", input.referralId)
    .eq("organization_id", input.organizationId)
    .select(SELECT)
    .single();

  if (error || !data) return null;
  const updated = mapRow(data as DbReferralRow);

  await appendReferralEvent({
    referralId: updated.id,
    organizationId: updated.organizationId,
    eventType: "status_changed",
    actorType: "org_member",
    actorId: input.actorUserId,
    priorStatus: existing.status,
    newStatus: updated.status,
  });

  return updated;
}

export async function getAllReferralsForOrganization(
  organizationId: string,
): Promise<OrganizationReferralRecord[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("organization_referrals")
    .select(SELECT)
    .eq("organization_id", organizationId);
  if (error || !data) return [];
  return (data as DbReferralRow[]).map(mapRow);
}

export function referralToOrgApiView(
  referral: OrganizationReferralRecord,
): Omit<OrganizationReferralRecord, "sharedSnapshot"> & {
  sharedSnapshot: SharedSnapshotPayload;
} {
  return {
    ...referral,
    sharedSnapshot: sanitizeReferralForOrgView(referral.sharedSnapshot),
  };
}
