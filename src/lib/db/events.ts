import "server-only";
import { timelineEventDetail, timelineEventLabel } from "@/lib/timeline/eventTypes";
import type {
  TimelineEvent,
  TimelineEventSource,
  TimelineEventType,
} from "@/lib/timeline/types";
import { isTimelineEventType } from "@/lib/timeline/eventTypes";
import { getSupabaseService } from "@/lib/supabaseServer";
import { logServerError } from "@/lib/security/safeLog";

const TABLE = "smartprobonoip_project_events";

interface EventRow {
  id: string;
  project_id: string;
  event_type: string;
  source: string;
  occurred_at: string;
  detail: string | null;
}

function rowToEvent(row: EventRow): TimelineEvent | null {
  if (!isTimelineEventType(row.event_type)) return null;
  return {
    id: row.id,
    inventionId: row.project_id,
    type: row.event_type,
    label: timelineEventLabel(row.event_type),
    detail: row.detail ?? timelineEventDetail(row.event_type),
    occurredAt: row.occurred_at,
    source: row.source === "user" ? "user" : "system",
  };
}

export interface RecordEventInput {
  projectId: string;
  pilotSessionId: string | null;
  type: TimelineEventType;
  source?: TimelineEventSource;
  detail?: string | null;
  metadata?: Record<string, unknown>;
  /** Set for milestones that must appear at most once per invention. */
  dedupeKey?: string;
  occurredAt?: string;
}

/**
 * Appends a timeline event.
 *
 * Timeline history is user-facing, so a failure is logged rather than swallowed
 * silently — but it never fails the surrounding request, because losing a
 * history row must not cost an inventor the packet write that produced it.
 */
export async function recordProjectEvent(input: RecordEventInput): Promise<void> {
  try {
    const sb = getSupabaseService();
    const { error } = await sb.from(TABLE).insert({
      project_id: input.projectId,
      pilot_session_id: input.pilotSessionId,
      event_type: input.type,
      source: input.source ?? "system",
      occurred_at: input.occurredAt ?? new Date().toISOString(),
      detail: input.detail ?? timelineEventDetail(input.type),
      metadata: input.metadata ?? {},
      dedupe_key: input.dedupeKey ?? null,
    });
    // A duplicate on the dedupe index means the milestone is already recorded.
    if (error && error.code !== "23505") {
      throw new Error(error.message);
    }
  } catch (err) {
    logServerError("events.record", err, { route: "events" });
  }
}

export async function listProjectEvents(
  projectId: string,
  limit = 50,
): Promise<TimelineEvent[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from(TABLE)
    .select("id, project_id, event_type, source, occurred_at, detail")
    .eq("project_id", projectId)
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as EventRow[])
    .map(rowToEvent)
    .filter((event): event is TimelineEvent => event !== null);
}

/** Newest events across every invention owned by a session. */
export async function listEventsForProjects(
  projectIds: string[],
  limit = 25,
): Promise<TimelineEvent[]> {
  if (projectIds.length === 0) return [];

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from(TABLE)
    .select("id, project_id, event_type, source, occurred_at, detail")
    .in("project_id", projectIds)
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as EventRow[])
    .map(rowToEvent)
    .filter((event): event is TimelineEvent => event !== null);
}

/** Newest event timestamp per invention, for portfolio "last activity". */
export async function getLastEventAtByProject(
  projectIds: string[],
): Promise<Record<string, string>> {
  if (projectIds.length === 0) return {};

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from(TABLE)
    .select("project_id, occurred_at")
    .in("project_id", projectIds)
    .order("occurred_at", { ascending: false });

  if (error || !data) return {};

  const latest: Record<string, string> = {};
  for (const row of data as { project_id: string; occurred_at: string }[]) {
    if (!latest[row.project_id]) latest[row.project_id] = row.occurred_at;
  }
  return latest;
}
