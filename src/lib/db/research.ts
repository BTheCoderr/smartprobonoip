import "server-only";
import { buildResearchPrepFromRecord } from "@/lib/research/buildLinks";
import type {
  ResearchWorkspaceData,
  SaveReferenceInput,
  SavedReference,
  UpdateReferenceInput,
} from "@/lib/research/types";
import type { CompareReferenceOutput } from "@/lib/research/types";
import {
  computeResearchMetrics,
  type ProjectResearchSummary,
} from "@/lib/researchMetrics";
import { getRecordById, listLiveRecords } from "@/lib/db/records";
import { getSupabaseService } from "@/lib/supabaseServer";

function mapReference(row: {
  id: string;
  reference_title: string | null;
  reference_url: string | null;
  reference_type: string | null;
  search_query_used: string | null;
  what_looks_similar: string | null;
  what_seems_different: string | null;
  expert_questions: string | null;
  notes: string | null;
  comparison_notes: CompareReferenceOutput | null;
  created_at: string;
  updated_at: string;
}): SavedReference {
  return {
    id: row.id,
    title: row.reference_title ?? "",
    url: row.reference_url ?? "",
    referenceType: row.reference_type ?? "",
    searchQueryUsed: row.search_query_used ?? "",
    looksSimilar: row.what_looks_similar ?? "",
    seemsDifferent: row.what_seems_different ?? "",
    expertQuestions: row.expert_questions ?? "",
    notes: row.notes ?? "",
    comparison: row.comparison_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadReferencesForProject(
  projectId: string,
  pilotSessionId: string,
): Promise<SavedReference[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_saved_references")
    .select(
      "id, reference_title, reference_url, reference_type, search_query_used, what_looks_similar, what_seems_different, expert_questions, notes, comparison_notes, created_at, updated_at",
    )
    .eq("project_id", projectId)
    .eq("pilot_session_id", pilotSessionId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapReference(row as Parameters<typeof mapReference>[0]));
}

export async function getResearchWorkspace(
  projectId: string,
  pilotSessionId: string,
): Promise<ResearchWorkspaceData | null> {
  const record = await getRecordById(projectId, pilotSessionId);
  if (!record) return null;

  const prep = buildResearchPrepFromRecord(record);
  const savedReferences = await loadReferencesForProject(projectId, pilotSessionId);

  return {
    projectId,
    searchKeywords: prep.searchKeywords,
    suggestedQueries: prep.suggestedQueries,
    savedReferences,
  };
}

export async function saveResearchReference(
  projectId: string,
  pilotSessionId: string,
  input: SaveReferenceInput,
): Promise<SavedReference> {
  const record = await getRecordById(projectId, pilotSessionId);
  if (!record) throw new Error("Record not found");

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_saved_references")
    .insert({
      project_id: projectId,
      pilot_session_id: pilotSessionId,
      partner_slug: record.partnerSlug ?? null,
      source: record.source ?? null,
      campaign: record.campaign ?? null,
      reference_title: input.title,
      reference_url: input.url ?? null,
      reference_type: input.referenceType ?? null,
      search_query_used: input.searchQueryUsed ?? null,
      what_looks_similar: input.looksSimilar ?? null,
      what_seems_different: input.seemsDifferent ?? null,
      expert_questions: input.expertQuestions ?? null,
      notes: input.notes ?? null,
    })
    .select(
      "id, reference_title, reference_url, reference_type, search_query_used, what_looks_similar, what_seems_different, expert_questions, notes, comparison_notes, created_at, updated_at",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to save reference");
  return mapReference(data as Parameters<typeof mapReference>[0]);
}

export async function updateResearchReference(
  projectId: string,
  pilotSessionId: string,
  input: UpdateReferenceInput,
): Promise<SavedReference> {
  const existing = await loadReferencesForProject(projectId, pilotSessionId);
  const owned = existing.find((ref) => ref.id === input.id);
  if (!owned) throw new Error("Reference not found");

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_saved_references")
    .update({
      reference_title: input.title ?? owned.title,
      reference_url: input.url ?? owned.url,
      reference_type: input.referenceType ?? owned.referenceType,
      search_query_used: input.searchQueryUsed ?? owned.searchQueryUsed,
      what_looks_similar: input.looksSimilar ?? owned.looksSimilar,
      what_seems_different: input.seemsDifferent ?? owned.seemsDifferent,
      expert_questions: input.expertQuestions ?? owned.expertQuestions,
      notes: input.notes ?? owned.notes,
      comparison_notes: input.comparison ?? owned.comparison ?? {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("project_id", projectId)
    .eq("pilot_session_id", pilotSessionId)
    .select(
      "id, reference_title, reference_url, reference_type, search_query_used, what_looks_similar, what_seems_different, expert_questions, notes, comparison_notes, created_at, updated_at",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update reference");
  return mapReference(data as Parameters<typeof mapReference>[0]);
}

export async function deleteResearchReference(
  projectId: string,
  pilotSessionId: string,
  refId: string,
): Promise<void> {
  const sb = getSupabaseService();
  const { error } = await sb
    .from("smartprobonoip_saved_references")
    .delete()
    .eq("id", refId)
    .eq("project_id", projectId)
    .eq("pilot_session_id", pilotSessionId);

  if (error) throw new Error(error.message);
}

export async function getSavedReferencesForPdf(
  projectId: string,
  pilotSessionId?: string,
): Promise<SavedReference[]> {
  if (!pilotSessionId) return [];
  return loadReferencesForProject(projectId, pilotSessionId);
}

export async function getResearchPrepStartedProjectIds(
  projectIds: string[],
): Promise<Set<string>> {
  const started = new Set<string>();
  if (projectIds.length === 0) return started;

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_analytics_events")
    .select("project_id")
    .in("project_id", projectIds)
    .eq("event_name", "research_workspace_viewed");

  if (error || !data) return started;
  for (const row of data) {
    if (row.project_id) started.add(row.project_id as string);
  }
  return started;
}

export async function getProjectResearchSummaries(
  projectIds: string[],
): Promise<Map<string, ProjectResearchSummary>> {
  const summaries = new Map<string, ProjectResearchSummary>();
  if (projectIds.length === 0) return summaries;

  const sb = getSupabaseService();
  const [refsRes, startedIds] = await Promise.all([
    sb
      .from("smartprobonoip_saved_references")
      .select("project_id, reference_type")
      .in("project_id", projectIds),
    getResearchPrepStartedProjectIds(projectIds),
  ]);

  if (refsRes.error) throw new Error(refsRes.error.message);

  const grouped = new Map<string, { count: number; types: string[] }>();
  for (const row of refsRes.data ?? []) {
    const projectId = row.project_id as string;
    const current = grouped.get(projectId) ?? { count: 0, types: [] };
    current.count += 1;
    if (row.reference_type) current.types.push(row.reference_type as string);
    grouped.set(projectId, current);
  }

  for (const projectId of projectIds) {
    const entry = grouped.get(projectId);
    summaries.set(projectId, {
      projectId,
      savedReferenceCount: entry?.count ?? 0,
      referenceTypes: entry?.types ?? [],
      researchPrepStarted:
        startedIds.has(projectId) || (entry?.count ?? 0) > 0,
    });
  }

  return summaries;
}

export async function getResearchMetricsForLiveRecords() {
  const records = await listLiveRecords();
  const summaries = await getProjectResearchSummaries(records.map((r) => r.id));
  const startedCount = [...summaries.values()].filter(
    (s) => s.researchPrepStarted,
  ).length;
  return computeResearchMetrics({
    summaries: [...summaries.values()],
    researchPrepStartedCount: startedCount,
  });
}

export async function getResearchCsvMap(projectIds: string[]) {
  const summaries = await getProjectResearchSummaries(projectIds);
  return summaries;
}
