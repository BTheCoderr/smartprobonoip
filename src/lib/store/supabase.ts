import { getSupabase } from "../supabaseClient";
import type {
  IntakeAnswers,
  ProjectRecord,
  ReadinessProfile,
} from "../types";
import type { SaveInput, Store } from "./types";

interface ProjectRow {
  id: string;
  idea_summary: string | null;
  item_type: string | null;
  public_disclosure: boolean;
  location: string | null;
  generator: string;
  created_at: string;
  smartprobonoip_answers: { payload: IntakeAnswers }[];
  smartprobonoip_profiles: { payload: ReadinessProfile }[];
  smartprobonoip_impact_metrics: {
    pre_clarity: number | null;
    post_clarity: number | null;
  }[];
}

const NESTED_SELECT =
  "id, idea_summary, item_type, public_disclosure, location, generator, created_at, " +
  "smartprobonoip_answers(payload), smartprobonoip_profiles(payload), " +
  "smartprobonoip_impact_metrics(pre_clarity, post_clarity)";

function toRecord(row: ProjectRow): ProjectRecord | null {
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
  };
}

export const supabaseStore: Store = {
  backend: "supabase",

  async saveRecord(input: SaveInput): Promise<ProjectRecord> {
    const sb = getSupabase();
    const { answers, profile, preClarity } = input;

    const { data: project, error: projectError } = await sb
      .from("smartprobonoip_projects")
      .insert({
        idea_summary: profile.ideaSummary,
        item_type: answers.itemType,
        public_disclosure: profile.publicDisclosure,
        location: answers.location || null,
        generator: profile.generator,
      })
      .select("id, created_at")
      .single();

    if (projectError || !project) {
      throw new Error(projectError?.message ?? "Failed to create project");
    }

    const projectId = project.id as string;

    const [answersRes, profileRes, metricsRes] = await Promise.all([
      sb
        .from("smartprobonoip_answers")
        .insert({ project_id: projectId, payload: answers }),
      sb.from("smartprobonoip_profiles").insert({
        project_id: projectId,
        payload: profile,
        signals: profile.signals,
        recommended_resources: profile.recommendedResources,
        generator: profile.generator,
      }),
      sb
        .from("smartprobonoip_impact_metrics")
        .insert({ project_id: projectId, pre_clarity: preClarity }),
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

    return {
      id: projectId,
      createdAt: (project.created_at as string) ?? new Date().toISOString(),
      answers,
      profile,
      preClarity,
      postClarity: null,
    };
  },

  async getRecord(id: string): Promise<ProjectRecord | null> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("smartprobonoip_projects")
      .select(NESTED_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return toRecord(data as unknown as ProjectRow);
  },

  async listRecords(): Promise<ProjectRecord[]> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("smartprobonoip_projects")
      .select(NESTED_SELECT)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as ProjectRow[])
      .map(toRecord)
      .filter((r): r is ProjectRecord => r !== null);
  },

  async updatePostClarity(id: string, postClarity: number): Promise<void> {
    const sb = getSupabase();
    await sb
      .from("smartprobonoip_impact_metrics")
      .update({ post_clarity: postClarity, updated_at: new Date().toISOString() })
      .eq("project_id", id);
  },

  async updateProfile(id: string, profile: ReadinessProfile): Promise<void> {
    const sb = getSupabase();
    await Promise.all([
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
        .eq("id", id),
    ]);
  },
};
