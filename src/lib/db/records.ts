import { DEFAULT_FOLLOW_UP } from "@/lib/records";
import { getSupabaseService } from "@/lib/supabaseServer";
import type {
  FollowUpStatus,
  IntakeAnswers,
  ProjectRecord,
  ReadinessProfile,
} from "@/lib/types";

interface ProjectRow {
  id: string;
  idea_summary: string | null;
  item_type: string | null;
  public_disclosure: boolean;
  location: string | null;
  generator: string;
  created_at: string;
  pilot_session_id: string | null;
  is_demo: boolean;
  smartprobonoip_answers: { payload: IntakeAnswers }[];
  smartprobonoip_profiles: { payload: ReadinessProfile }[];
  smartprobonoip_impact_metrics: {
    pre_clarity: number | null;
    post_clarity: number | null;
  }[];
  followups: {
    interval_days: number | null;
    status: string;
  }[];
}

const NESTED_SELECT =
  "id, idea_summary, item_type, public_disclosure, location, generator, created_at, pilot_session_id, is_demo, " +
  "smartprobonoip_answers(payload), smartprobonoip_profiles(payload), " +
  "smartprobonoip_impact_metrics(pre_clarity, post_clarity), " +
  "followups(interval_days, status)";

function followUpFromRows(
  rows: { interval_days: number | null; status: string }[],
): FollowUpStatus {
  const status: FollowUpStatus = { ...DEFAULT_FOLLOW_UP };
  for (const row of rows) {
    if (row.interval_days === 30) status.day30 = row.status as FollowUpStatus["day30"];
    if (row.interval_days === 60) status.day60 = row.status as FollowUpStatus["day60"];
    if (row.interval_days === 90) status.day90 = row.status as FollowUpStatus["day90"];
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
    profile,
    preClarity: metrics?.pre_clarity ?? answers.preClarity ?? 0,
    postClarity: metrics?.post_clarity ?? null,
    isDemo: row.is_demo,
    followUpStatus: followUpFromRows(row.followups ?? []),
  };
}

export async function createRecord(input: {
  answers: IntakeAnswers;
  profile: ReadinessProfile;
  preClarity: number;
  pilotSessionId: string;
  isDemo?: boolean;
}): Promise<ProjectRecord> {
  const sb = getSupabaseService();
  const { answers, profile, preClarity, pilotSessionId, isDemo = false } = input;

  const { data: project, error: projectError } = await sb
    .from("smartprobonoip_projects")
    .insert({
      idea_summary: profile.ideaSummary,
      item_type: answers.itemType,
      public_disclosure: profile.publicDisclosure,
      location: answers.location || null,
      generator: profile.generator,
      pilot_session_id: pilotSessionId,
      is_demo: isDemo,
    })
    .select("id, created_at")
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Failed to create project");
  }

  const projectId = project.id as string;

  const [answersRes, profileRes, metricsRes] = await Promise.all([
    sb.from("smartprobonoip_answers").insert({
      project_id: projectId,
      payload: answers,
    }),
    sb.from("smartprobonoip_profiles").insert({
      project_id: projectId,
      payload: profile,
      signals: profile.signals,
      recommended_resources: profile.recommendedResources,
      generator: profile.generator,
    }),
    sb.from("smartprobonoip_impact_metrics").insert({
      project_id: projectId,
      pre_clarity: preClarity,
    }),
  ]);

  const writeError = answersRes.error || profileRes.error || metricsRes.error;
  if (writeError) throw new Error(writeError.message);

  if (profile.recommendedResources.length > 0) {
    await sb.from("smartprobonoip_referrals").insert(
      profile.recommendedResources.map((resource) => ({
        project_id: projectId,
        resource_category: resource,
        referral_type: resource,
        status: "suggested",
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
        interval_days: days,
        due_at: due.toISOString(),
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
    .update({ post_clarity: postClarity, updated_at: new Date().toISOString() })
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
        payload: profile,
        signals: profile.signals,
        recommended_resources: profile.recommendedResources,
        generator: profile.generator,
      })
      .eq("project_id", id),
    sb
      .from("smartprobonoip_projects")
      .update({
        idea_summary: profile.ideaSummary,
        public_disclosure: profile.publicDisclosure,
        generator: profile.generator,
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
