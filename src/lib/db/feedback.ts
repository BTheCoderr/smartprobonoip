import "server-only";
import type { PilotFeedbackInput, PilotFeedbackRecord } from "@/lib/feedback";
import { getRecordById } from "@/lib/db/records";
import { getSupabaseService } from "@/lib/supabaseServer";

interface FeedbackRow {
  id: string;
  project_id: string;
  pilot_session_id: string;
  partner_slug: string | null;
  partner_name: string | null;
  source: string | null;
  campaign: string | null;
  clarity_helped: string | null;
  would_bring_to_expert: string | null;
  support_needed: string[] | null;
  confusion_note: string | null;
  follow_up_requested: boolean;
  created_at: string;
}

function mapRow(row: FeedbackRow): PilotFeedbackRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    pilotSessionId: row.pilot_session_id,
    partnerSlug: row.partner_slug,
    partnerName: row.partner_name,
    source: row.source,
    campaign: row.campaign,
    clarityHelped: (row.clarity_helped ?? "not_sure") as PilotFeedbackRecord["clarityHelped"],
    wouldBringToExpert: (row.would_bring_to_expert ??
      "not_sure") as PilotFeedbackRecord["wouldBringToExpert"],
    supportNeeded: (row.support_needed ?? []) as PilotFeedbackRecord["supportNeeded"],
    confusionNote: row.confusion_note ?? undefined,
    followUpRequested: row.follow_up_requested,
    createdAt: row.created_at,
  };
}

export async function saveFeedback(input: {
  projectId: string;
  pilotSessionId: string;
  feedback: PilotFeedbackInput;
}): Promise<PilotFeedbackRecord> {
  const owned = await getRecordById(input.projectId, input.pilotSessionId);
  if (!owned) throw new Error("Packet not found");
  if (owned.isDemo) throw new Error("Demo packets do not save pilot feedback");

  const sb = getSupabaseService();
  const payload = {
    project_id: input.projectId,
    pilot_session_id: input.pilotSessionId,
    partner_slug: owned.partnerSlug,
    partner_name: owned.partnerName,
    source: owned.source,
    campaign: owned.campaign,
    clarity_helped: input.feedback.clarityHelped,
    would_bring_to_expert: input.feedback.wouldBringToExpert,
    support_needed: input.feedback.supportNeeded,
    confusion_note: input.feedback.confusionNote ?? null,
    follow_up_requested: input.feedback.followUpRequested,
  };

  const { data, error } = await sb
    .from("smartprobonoip_feedback")
    .upsert(payload, { onConflict: "project_id" })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not save feedback");
  return mapRow(data as FeedbackRow);
}

export async function getFeedbackForProject(
  projectId: string,
  pilotSessionId: string,
): Promise<PilotFeedbackRecord | null> {
  const owned = await getRecordById(projectId, pilotSessionId);
  if (!owned) return null;

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_feedback")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as FeedbackRow);
}

export async function listFeedbackRecords(): Promise<PilotFeedbackRecord[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as FeedbackRow[]).map(mapRow);
}

export async function getFeedbackMapByProjectIds(
  projectIds: string[],
): Promise<Map<string, PilotFeedbackRecord>> {
  const map = new Map<string, PilotFeedbackRecord>();
  if (projectIds.length === 0) return map;

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_feedback")
    .select("*")
    .in("project_id", projectIds);

  if (error || !data) return map;
  for (const row of data as FeedbackRow[]) {
    map.set(row.project_id, mapRow(row));
  }
  return map;
}
