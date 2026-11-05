/**
 * Small, privacy-limited pilot funnel summary.
 *
 * Input is already authorized event metadata. Do not return session IDs, project
 * IDs, personal information, invention descriptions, or raw metadata to clients.
 * Unknown provenance is not assumed to mean "real".
 */
export interface PilotFunnelEvent {
  event_name: string;
  pilot_session_id?: string | null;
  anonymous_id?: string | null;
  project_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface PilotFunnelScorecard {
  confirmedRealIntakeSessions: number;
  confirmedRealCompletedSessions: number;
  confirmedRealExportSessions: number;
  matchedCompletionPercent: number | null;
  excludedDemoEvents: number;
  unclassifiedEvents: number;
  unidentifiableRealEvents: number;
  // Proof of review and professional time saved requires verified reviewer input.
  professionalReviewsVerified: null;
  reviewerMinutesSaved: null;
  eventWindowLimited: boolean;
}

const RELEVANT_EVENTS = new Set([
  "intake_started",
  "intake_completed",
  "attorney_export_completed",
]);

function getSessionKey(event: PilotFunnelEvent): string | null {
  // Do not send this key to the browser. Used only for deduplicating event rows.
  if (event.pilot_session_id) return "session:" + event.pilot_session_id;
  if (event.anonymous_id) return "anon:" + event.anonymous_id;
  if (event.project_id) return "project:" + event.project_id;
  return null;
}

/**
 * A positive number means an observed distinct browser/pilot session, not a
 * verified unique human. Counts only events explicitly tagged demo=false.
 * This is a stage snapshot, not a longitudinal cohort or verified handoff.
 */
export function computePilotFunnelScorecard(
  events: readonly PilotFunnelEvent[],
  options: { eventWindowLimited?: boolean } = {},
): PilotFunnelScorecard {
  const started = new Set<string>();
  const completed = new Set<string>();
  const exportsPrepared = new Set<string>();
  let excludedDemoEvents = 0;
  let unclassifiedEvents = 0;
  let unidentifiableRealEvents = 0;

  for (const event of events) {
    if (!RELEVANT_EVENTS.has(event.event_name)) continue;
    const demo = event.metadata?.demo ?? event.metadata?.isDemo;
    if (demo === true) {
      excludedDemoEvents++;
      continue;
    }
    if (demo !== false) {
      unclassifiedEvents++;
      continue;
    }
    const key = getSessionKey(event);
    if (!key) {
      unidentifiableRealEvents++;
      continue;
    }

    if (event.event_name === "intake_started") started.add(key);
    if (event.event_name === "intake_completed") completed.add(key);
    if (event.event_name === "attorney_export_completed") exportsPrepared.add(key);
  }

  let matched = 0;
  for (const session of started) {
    if (completed.has(session)) matched++;
  }

  return {
    confirmedRealIntakeSessions: started.size,
    confirmedRealCompletedSessions: completed.size,
    confirmedRealExportSessions: exportsPrepared.size,
    matchedCompletionPercent:
      started.size === 0 ? null : Math.round((matched / started.size) * 100),
    excludedDemoEvents,
    unclassifiedEvents,
    unidentifiableRealEvents,
    professionalReviewsVerified: null,
    reviewerMinutesSaved: null,
    eventWindowLimited: Boolean(options.eventWindowLimited),
  };
}
