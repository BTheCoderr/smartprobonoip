import "server-only";
import { RESOURCE_LABELS } from "@/lib/labels";
import { shouldTriggerOwnershipSignal } from "@/lib/ownership";
import { getIdeaLabel } from "@/lib/packet";
import { DEFAULT_FOLLOW_UP } from "@/lib/records";
import { normalizeProfileSignals } from "@/lib/signals";
import { getSupabaseService } from "@/lib/supabaseServer";
import type {
  FollowUpStatus,
  IntakeAnswers,
  ProjectRecord,
  ReadinessProfile,
} from "@/lib/types";
import type { PilotTracking } from "@/lib/partnerTracking";
import type { SupabaseClient } from "@supabase/supabase-js";

const SMARTPROBONOIP_VENTURE_SLUG = "smartprobonoip";

interface ProjectRow {
  id: string;
  title: string | null;
  item_type: string | null;
  public_disclosure: boolean;
  location: string | null;
  generator: string;
  created_at: string;
  pilot_session_id: string;
  is_demo: boolean;
  partner_slug: string | null;
  partner_name: string | null;
  source: string | null;
  campaign: string | null;
  smartprobonoip_answers: {
    payload: IntakeAnswers | null;
    pre_clarity_score: number | null;
  }[];
  smartprobonoip_profiles: { payload: ReadinessProfile | null }[];
  smartprobonoip_impact_metrics: {
    pre_clarity_score: number | null;
    post_clarity_score: number | null;
  }[];
  followups: { followup_type: string; status: string }[];
}

const NESTED_SELECT =
  "id, title, item_type, public_disclosure, location, generator, created_at, pilot_session_id, is_demo, " +
  "partner_slug, partner_name, source, campaign, " +
  "smartprobonoip_answers(payload, pre_clarity_score), smartprobonoip_profiles(payload), " +
  "smartprobonoip_impact_metrics(pre_clarity_score, post_clarity_score), " +
  "followups(followup_type, status)";

let cachedVentureId: string | null = null;

async function getSmartProBonoIpVentureId(
  sb: SupabaseClient,
): Promise<string> {
  if (cachedVentureId) return cachedVentureId;
  const { data, error } = await sb
    .from("ventures")
    .select("id")
    .eq("slug", SMARTPROBONOIP_VENTURE_SLUG)
    .maybeSingle();
  if (error || !data?.id) {
    throw new Error(
      "SmartProBonoIP venture not found. Run supabase/umbrella_schema.sql on your Supabase project.",
    );
  }
  cachedVentureId = data.id as string;
  return cachedVentureId;
}

async function ensurePilotSession(
  sb: SupabaseClient,
  ventureId: string,
  pilotSessionId: string,
  isDemo: boolean,
  tracking?: PilotTracking | null,
): Promise<void> {
  const payload: Record<string, unknown> = {
    venture_id: ventureId,
    pilot_session_id: pilotSessionId,
    is_demo: isDemo,
    status: "active",
  };
  if (tracking && !isDemo) {
    if (tracking.partnerSlug) payload.partner_slug = tracking.partnerSlug;
    if (tracking.partnerName) payload.partner_name = tracking.partnerName;
    if (tracking.source) payload.source = tracking.source;
    if (tracking.campaign) payload.campaign = tracking.campaign;
  }
  await sb.from("pilot_sessions").upsert(payload, { onConflict: "pilot_session_id" });
}

function answersToColumns(answers: IntakeAnswers) {
  const shared = answers.sharedChannels.filter((c) => c !== "none");
  return {
    what_created: answers.whatCreated,
    problem_solved: answers.problemSolved,
    who_for: answers.whoFor,
    how_it_works: answers.howItWorks,
    main_parts: answers.mainParts,
    what_different: answers.whatDifferent,
    prototype_status: answers.hasPrototype ? "yes" : "no",
    brand_name_status: answers.hasBrandIdentity ? "yes" : "no",
    public_sharing_status:
      shared.length > 0 ? shared.join(",") : "none",
    public_sharing_notes:
      shared.length > 0 ? "Reported via intake channels" : null,
    materials_available: answers.assets.join(","),
    goals_support_needed: answers.goals.join(","),
    pro_bono_interest: answers.wantsProBono,
    location: answers.location || null,
    pre_clarity_score: answers.preClarity,
    payload: answers,
    ownership_signal: shouldTriggerOwnershipSignal(answers),
    contributors_involved: answers.contributorsInvolved ?? null,
    contributor_types: (answers.contributorHelpTypes ?? []).join(",") || null,
    agreement_status: answers.agreementStatus ?? null,
    agreement_types: (answers.agreementTypes ?? []).join(",") || null,
    employer_school_grant_flag: answers.institutionRelationship ?? null,
  };
}

function profileToColumns(profile: ReadinessProfile) {
  return {
    plain_language_summary: profile.ideaSummary,
    possible_ip_signals: profile.signals,
    missing_information: profile.missingInfo,
    recommended_resources: profile.recommendedResources,
    expert_questions: profile.expertQuestions,
    public_disclosure_note: profile.publicDisclosureNote,
    patent_prep: {},
    similar_patent_discovery_prep: {},
    ai_provider: profile.generator,
    disclaimer: profile.disclaimer,
    payload: profile,
  };
}

function followUpFromRows(
  rows: { followup_type: string; status: string }[],
): FollowUpStatus {
  const status: FollowUpStatus = { ...DEFAULT_FOLLOW_UP };
  for (const row of rows) {
    const state = row.status as FollowUpStatus["day30"];
    if (row.followup_type === "30") status.day30 = state;
    if (row.followup_type === "60") status.day60 = state;
    if (row.followup_type === "90") status.day90 = state;
  }
  return status;
}

export function rowToRecord(row: ProjectRow): ProjectRecord | null {
  const answers = row.smartprobonoip_answers[0]?.payload;
  const profile = row.smartprobonoip_profiles[0]?.payload;
  if (!answers || !profile) return null;
  const metrics = row.smartprobonoip_impact_metrics[0];
  return {
    id: row.id,
    createdAt: row.created_at,
    answers,
    profile: {
      ...profile,
      signals: normalizeProfileSignals(profile.signals, answers),
    },
    preClarity:
      metrics?.pre_clarity_score ??
      row.smartprobonoip_answers[0]?.pre_clarity_score ??
      answers.preClarity ??
      0,
    postClarity: metrics?.post_clarity_score ?? null,
    isDemo: row.is_demo,
    followUpStatus: followUpFromRows(row.followups ?? []),
    partnerSlug: row.partner_slug,
    partnerName: row.partner_name,
    source: row.source,
    campaign: row.campaign,
  };
}

export async function createRecord(input: {
  answers: IntakeAnswers;
  profile: ReadinessProfile;
  preClarity: number;
  pilotSessionId: string;
  isDemo?: boolean;
  tracking?: PilotTracking | null;
}): Promise<ProjectRecord> {
  const sb = getSupabaseService();
  const { answers, profile, preClarity, pilotSessionId, isDemo = false, tracking } =
    input;
  const ventureId = await getSmartProBonoIpVentureId(sb);
  await ensurePilotSession(sb, ventureId, pilotSessionId, isDemo, tracking);

  const projectInsert: Record<string, unknown> = {
    venture_id: ventureId,
    pilot_session_id: pilotSessionId,
    title: getIdeaLabel(answers),
    item_type: answers.itemType,
    public_disclosure: profile.publicDisclosure,
    location: answers.location || null,
    generator: profile.generator,
    is_demo: isDemo,
    status: "packet_generated",
  };

  if (!isDemo && tracking) {
    if (tracking.partnerSlug) projectInsert.partner_slug = tracking.partnerSlug;
    if (tracking.partnerName) projectInsert.partner_name = tracking.partnerName;
    if (tracking.source) projectInsert.source = tracking.source;
    if (tracking.campaign) projectInsert.campaign = tracking.campaign;
  }

  const { data: project, error: projectError } = await sb
    .from("smartprobonoip_projects")
    .insert(projectInsert)
    .select("id, created_at")
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Failed to create project");
  }

  const projectId = project.id as string;

  const [answersRes, profileRes, metricsRes] = await Promise.all([
    sb.from("smartprobonoip_answers").insert({
      project_id: projectId,
      ...answersToColumns(answers),
    }),
    sb.from("smartprobonoip_profiles").insert({
      project_id: projectId,
      ...profileToColumns(profile),
    }),
    sb.from("smartprobonoip_impact_metrics").insert({
      project_id: projectId,
      pre_clarity_score: preClarity,
      packet_completed: true,
    }),
  ]);

  const writeError = answersRes.error || profileRes.error || metricsRes.error;
  if (writeError) throw new Error(writeError.message);

  if (profile.recommendedResources.length > 0) {
    await sb.from("smartprobonoip_referrals").insert(
      profile.recommendedResources.map((resource, index) => ({
        project_id: projectId,
        resource_type: resource,
        resource_label: RESOURCE_LABELS[resource],
        priority: index + 1,
        rationale: "Suggested from IP Readiness Packet",
      })),
    );
  }

  const dueBase = new Date(project.created_at as string);
  await sb.from("followups").insert(
    [30, 60, 90].map((days) => {
      const due = new Date(dueBase);
      due.setDate(due.getDate() + days);
      return {
        project_id: projectId,
        followup_type: String(days),
        due_date: due.toISOString().slice(0, 10),
        status: "pending",
      };
    }),
  );

  return {
    id: projectId,
    createdAt: (project.created_at as string) ?? new Date().toISOString(),
    answers,
    profile,
    preClarity,
    postClarity: null,
    isDemo,
    followUpStatus: DEFAULT_FOLLOW_UP,
    partnerSlug: !isDemo ? (tracking?.partnerSlug ?? null) : null,
    partnerName: !isDemo ? (tracking?.partnerName ?? null) : null,
    source: !isDemo ? (tracking?.source ?? null) : null,
    campaign: !isDemo ? (tracking?.campaign ?? null) : null,
  };
}

export async function getRecordById(
  id: string,
  pilotSessionId?: string,
): Promise<ProjectRecord | null> {
  const sb = getSupabaseService();
  let query = sb.from("smartprobonoip_projects").select(NESTED_SELECT).eq("id", id);
  if (pilotSessionId) {
    query = query.eq("pilot_session_id", pilotSessionId);
  }
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return rowToRecord(data as unknown as ProjectRow);
}

export async function listLiveRecords(): Promise<ProjectRecord[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_projects")
    .select(NESTED_SELECT)
    .eq("is_demo", false)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as ProjectRow[])
    .map(rowToRecord)
    .filter((r): r is ProjectRecord => r !== null);
}

export async function updatePostClarity(
  id: string,
  pilotSessionId: string,
  postClarity: number,
): Promise<void> {
  const sb = getSupabaseService();
  const owned = await getRecordById(id, pilotSessionId);
  if (!owned) throw new Error("Record not found");

  const { error } = await sb
    .from("smartprobonoip_impact_metrics")
    .update({
      post_clarity_score: postClarity,
      updated_at: new Date().toISOString(),
    })
    .eq("project_id", id);
  if (error) throw new Error(error.message);
}

export async function updateProfile(
  id: string,
  pilotSessionId: string,
  profile: ReadinessProfile,
): Promise<void> {
  const sb = getSupabaseService();
  const owned = await getRecordById(id, pilotSessionId);
  if (!owned) throw new Error("Record not found");

  const [profileRes, projectRes] = await Promise.all([
    sb
      .from("smartprobonoip_profiles")
      .update({
        ...profileToColumns(profile),
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", id),
    sb
      .from("smartprobonoip_projects")
      .update({
        title: getIdeaLabel(owned.answers),
        public_disclosure: profile.publicDisclosure,
        generator: profile.generator,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("pilot_session_id", pilotSessionId),
  ]);

  if (profileRes.error) throw new Error(profileRes.error.message);
  if (projectRes.error) throw new Error(projectRes.error.message);
}

export function verifyPartnerSecret(secret: string | null): boolean {
  const expected = process.env.PARTNER_DASHBOARD_SECRET;
  if (!expected) return false;
  return secret === expected;
}
