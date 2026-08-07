import "server-only";
import {
  PROJECT_EVENTS_TABLE,
} from "@/lib/privacy/deletionCascade";
import { getSupabaseService } from "@/lib/supabaseServer";

/**
 * Pilot data deletion — single path.
 *
 * Always DELETE from `smartprobonoip_projects`. Child tables listed in
 * `PROJECT_CHILD_TABLES` (including `smartprobonoip_project_events`) are
 * removed by `ON DELETE CASCADE`. Never DELETE from the events table directly.
 */

export interface InventionDeletionResult {
  projectId: string;
  deleted: boolean;
}

export interface SessionDeletionResult {
  pilotSessionId: string;
  deletedProjectIds: string[];
  deletedCount: number;
}

async function countEventsForProject(projectId: string): Promise<number> {
  const sb = getSupabaseService();
  const { count, error } = await sb
    .from(PROJECT_EVENTS_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Deletes one invention. Project events (and other cascaded children) go with it.
 */
export async function deleteInventionById(
  projectId: string,
): Promise<InventionDeletionResult> {
  const id = projectId.trim();
  if (!id) {
    return { projectId: "", deleted: false };
  }

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_projects")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);

  const deleted = Array.isArray(data) && data.length > 0;
  return { projectId: id, deleted };
}

/**
 * Deletes every invention owned by a pilot session.
 *
 * Ownership is read from `smartprobonoip_projects.pilot_session_id` at delete
 * time. Events are not filtered by their denormalized session column — recovery
 * can leave that column stale — so session cleanup always goes through projects.
 */
export async function deleteInventionsForSession(
  pilotSessionId: string,
): Promise<SessionDeletionResult> {
  const session = pilotSessionId.trim();
  if (!session) {
    return { pilotSessionId: "", deletedProjectIds: [], deletedCount: 0 };
  }

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_projects")
    .delete()
    .eq("pilot_session_id", session)
    .select("id");

  if (error) throw new Error(error.message);

  const deletedProjectIds = (data ?? []).map((row) => row.id as string);
  return {
    pilotSessionId: session,
    deletedProjectIds,
    deletedCount: deletedProjectIds.length,
  };
}

/**
 * Post-delete verification for ops. Returns how many timeline events still
 * reference the invention. Must be 0 after a successful invention delete.
 */
export async function countSurvivingProjectEvents(
  projectId: string,
): Promise<number> {
  return countEventsForProject(projectId.trim());
}

/**
 * Events whose project_id no longer exists. Must stay 0 while CASCADE is intact.
 * Used by retention verification — not a deletion path.
 */
export async function countOrphanProjectEvents(): Promise<number> {
  const sb = getSupabaseService();
  // PostgREST cannot express anti-joins cleanly; use an RPC-free heuristic:
  // fetch event project_ids and compare to existing projects in batches.
  const { data: eventRows, error: eventError } = await sb
    .from(PROJECT_EVENTS_TABLE)
    .select("project_id");

  if (eventError) throw new Error(eventError.message);
  if (!eventRows?.length) return 0;

  const projectIds = [
    ...new Set(
      (eventRows as { project_id: string }[]).map((row) => row.project_id),
    ),
  ];

  const { data: projects, error: projectError } = await sb
    .from("smartprobonoip_projects")
    .select("id")
    .in("id", projectIds);

  if (projectError) throw new Error(projectError.message);

  const existing = new Set((projects ?? []).map((row) => row.id as string));
  return projectIds.filter((id) => !existing.has(id)).length;
}
