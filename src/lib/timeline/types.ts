/**
 * Invention timeline: an append-only record of preparation milestones.
 *
 * Distinct from `DevelopmentTimeline`, which holds inventor-entered dates about
 * the invention itself (when it was first built, first shared) and is evidence
 * for a professional. This is history of what happened in the product.
 */
export type TimelineEventType =
  | "idea_created"
  | "materials_recorded"
  | "packet_generated"
  | "packet_updated"
  | "research_reference_added"
  | "timeline_updated"
  | "document_generated"
  | "professional_handoff_prepared"
  | "clarity_recorded"
  | "status_changed"
  | "title_updated"
  | "recovered";

export type TimelineEventSource = "system" | "user";

export interface TimelineEvent {
  id: string;
  inventionId: string;
  type: TimelineEventType;
  label: string;
  detail: string | null;
  occurredAt: string;
  source: TimelineEventSource;
}

/** A timeline event carrying the invention it belongs to, for cross-invention feeds. */
export interface ActivityEvent extends TimelineEvent {
  inventionTitle: string;
}
