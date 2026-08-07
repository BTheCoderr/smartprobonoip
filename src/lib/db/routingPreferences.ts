import "server-only";
import {
  dismissRecommendationId,
  normalizeRoutingPreferences,
  restoreAllDismissals,
  restoreRecommendationId,
  type RoutingPreferences,
} from "@/lib/routing/dismissals";
import { getRecordById } from "@/lib/db/records";
import { getSupabaseService } from "@/lib/supabaseServer";

export async function getRoutingPreferences(
  projectId: string,
  pilotSessionId: string,
): Promise<RoutingPreferences | null> {
  const owned = await getRecordById(projectId, pilotSessionId);
  if (!owned) return null;

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_projects")
    .select("routing_preferences")
    .eq("id", projectId)
    .eq("pilot_session_id", pilotSessionId)
    .maybeSingle();

  if (error || !data) return { dismissedRecommendationIds: [] };
  return normalizeRoutingPreferences(data.routing_preferences);
}

export async function updateRoutingPreferences(
  projectId: string,
  pilotSessionId: string,
  updater: (current: RoutingPreferences) => RoutingPreferences,
): Promise<RoutingPreferences> {
  const owned = await getRecordById(projectId, pilotSessionId);
  if (!owned) throw new Error("Record not found");

  const current = (await getRoutingPreferences(projectId, pilotSessionId)) ?? {
    dismissedRecommendationIds: [],
  };
  const next = updater(current);

  const sb = getSupabaseService();
  const { error } = await sb
    .from("smartprobonoip_projects")
    .update({
      routing_preferences: next,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("pilot_session_id", pilotSessionId);

  if (error) throw new Error(error.message);
  return next;
}

export async function dismissRecommendation(
  projectId: string,
  pilotSessionId: string,
  recommendationId: string,
): Promise<RoutingPreferences> {
  return updateRoutingPreferences(projectId, pilotSessionId, (current) =>
    dismissRecommendationId(current, recommendationId),
  );
}

export async function restoreRecommendation(
  projectId: string,
  pilotSessionId: string,
  recommendationId: string,
): Promise<RoutingPreferences> {
  return updateRoutingPreferences(projectId, pilotSessionId, (current) =>
    restoreRecommendationId(current, recommendationId),
  );
}

export async function restoreAllRecommendations(
  projectId: string,
  pilotSessionId: string,
): Promise<RoutingPreferences> {
  return updateRoutingPreferences(projectId, pilotSessionId, () =>
    restoreAllDismissals(),
  );
}
