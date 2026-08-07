import type { ProjectRecord } from "@/lib/types";
import { timelineEventDetail, timelineEventLabel } from "./eventTypes";
import type { TimelineEvent, TimelineEventType } from "./types";

/**
 * Reconstructs an invention's history from timestamps the record already
 * carries. Used for the localStorage backend, which has no events table, and as
 * the shape the Postgres backfill mirrors. Every event comes from real stored
 * data — nothing here invents a milestone that did not happen.
 */
export function deriveTimelineEvents(record: ProjectRecord): TimelineEvent[] {
  const updatedAt = record.updatedAt ?? record.createdAt;
  const events: TimelineEvent[] = [];

  const push = (type: TimelineEventType, occurredAt: string) => {
    events.push({
      id: `${record.id}:${type}`,
      inventionId: record.id,
      type,
      label: timelineEventLabel(type),
      detail: timelineEventDetail(type),
      occurredAt,
      source: "system",
    });
  };

  push("idea_created", record.createdAt);

  if (record.answers.hasPrototype || record.answers.assets.length > 0) {
    push("materials_recorded", record.createdAt);
  }

  if (record.profile?.ideaSummary?.trim()) {
    push("packet_generated", record.createdAt);
  }

  const timeline = record.developmentTimeline ?? {};
  if (Object.values(timeline).some((value) => value?.trim())) {
    push("timeline_updated", updatedAt);
  }

  if (record.postClarity !== null && record.postClarity !== undefined) {
    push("clarity_recorded", updatedAt);
  }

  return sortEventsByNewest(events);
}

export function sortEventsByNewest<T extends { occurredAt: string }>(
  events: T[],
): T[] {
  return [...events].sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
  );
}
