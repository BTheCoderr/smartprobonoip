import "server-only";

import { getSupabaseService } from "@/lib/supabaseServer";

export type ClarificationStatus = "open" | "answered" | "closed";

export interface ClarificationRequestView {
  id: string;
  organizationId: string;
  organizationName: string | null;
  referralId: string;
  projectId: string;
  canonicalKey: string | null;
  questionText: string;
  contextNote: string | null;
  status: ClarificationStatus;
  answerText: string | null;
  answeredAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ClarificationRow {
  id: string;
  organization_id: string;
  referral_id: string;
  project_id: string;
  canonical_key: string | null;
  question_text: string;
  context_note: string | null;
  status: ClarificationStatus;
  answer_text: string | null;
  answered_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  partner_organizations?:
    | { name?: string | null }
    | { name?: string | null }[]
    | null;
}

function organizationName(row: ClarificationRow): string | null {
  const related = row.partner_organizations;
  if (Array.isArray(related)) return related[0]?.name ?? null;
  return related?.name ?? null;
}

function mapRow(row: ClarificationRow): ClarificationRequestView {
  return {
    id: row.id,
    organizationId: row.organization_id,
    organizationName: organizationName(row),
    referralId: row.referral_id,
    projectId: row.project_id,
    canonicalKey: row.canonical_key,
    questionText: row.question_text,
    contextNote: row.context_note,
    status: row.status,
    answerText: row.answer_text,
    answeredAt: row.answered_at,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT =
  "id, organization_id, referral_id, project_id, canonical_key, question_text, context_note, status, answer_text, answered_at, closed_at, created_at, updated_at, partner_organizations(name)";

export async function listReferralClarifications(
  organizationId: string,
  referralId: string,
): Promise<ClarificationRequestView[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_clarification_requests")
    .select(SELECT)
    .eq("organization_id", organizationId)
    .eq("referral_id", referralId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ClarificationRow[]).map(mapRow);
}

export async function createReferralClarification(input: {
  organizationId: string;
  referralId: string;
  projectId: string;
  askedByUserId: string;
  canonicalKey?: string | null;
  questionText: string;
  contextNote?: string | null;
}): Promise<ClarificationRequestView> {
  const sb = getSupabaseService();

  const { data: referral, error: referralError } = await sb
    .from("organization_referrals")
    .select("id")
    .eq("id", input.referralId)
    .eq("organization_id", input.organizationId)
    .eq("project_id", input.projectId)
    .maybeSingle();
  if (referralError || !referral) {
    throw new Error("Referral not found");
  }

  const { data, error } = await sb
    .from("smartprobonoip_clarification_requests")
    .insert({
      organization_id: input.organizationId,
      referral_id: input.referralId,
      project_id: input.projectId,
      asked_by_user_id: input.askedByUserId,
      canonical_key: input.canonicalKey ?? null,
      question_text: input.questionText.trim(),
      context_note: input.contextNote?.trim() || null,
      status: "open",
    })
    .select(SELECT)
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Could not create clarification request");
  }
  return mapRow(data as ClarificationRow);
}

export async function closeReferralClarification(input: {
  organizationId: string;
  referralId: string;
  clarificationId: string;
}): Promise<ClarificationRequestView | null> {
  const sb = getSupabaseService();
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("smartprobonoip_clarification_requests")
    .update({
      status: "closed",
      closed_at: now,
      updated_at: now,
    })
    .eq("id", input.clarificationId)
    .eq("organization_id", input.organizationId)
    .eq("referral_id", input.referralId)
    .select(SELECT)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as ClarificationRow) : null;
}

export async function listProjectClarifications(
  projectId: string,
): Promise<ClarificationRequestView[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_clarification_requests")
    .select(SELECT)
    .eq("project_id", projectId)
    .neq("status", "closed")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ClarificationRow[]).map(mapRow);
}

export async function answerProjectClarification(input: {
  projectId: string;
  clarificationId: string;
  answerText: string;
}): Promise<ClarificationRequestView | null> {
  const sb = getSupabaseService();
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("smartprobonoip_clarification_requests")
    .update({
      status: "answered",
      answer_text: input.answerText.trim(),
      answered_at: now,
      updated_at: now,
    })
    .eq("id", input.clarificationId)
    .eq("project_id", input.projectId)
    .neq("status", "closed")
    .select(SELECT)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as ClarificationRow) : null;
}
