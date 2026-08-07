import type { ActivityEvent, TimelineEvent } from "@/lib/timeline/types";
import { TimelineEventItem } from "./TimelineEventItem";

function hasInventionTitle(
  event: TimelineEvent | ActivityEvent,
): event is ActivityEvent {
  return "inventionTitle" in event;
}

export function Timeline({
  events,
  showInvention = false,
  emptyMessage = "No activity yet.",
  label = "Invention timeline",
}: {
  events: (TimelineEvent | ActivityEvent)[];
  /** Show which invention each event belongs to (cross-invention feeds). */
  showInvention?: boolean;
  emptyMessage?: string;
  label?: string;
}) {
  if (events.length === 0) {
    return <p className="text-sm text-navy-500">{emptyMessage}</p>;
  }

  return (
    <ol aria-label={label} className="m-0 list-none p-0">
      {events.map((event, index) => (
        <TimelineEventItem
          key={event.id}
          event={event}
          contextLabel={
            showInvention && hasInventionTitle(event)
              ? event.inventionTitle
              : undefined
          }
          isLast={index === events.length - 1}
        />
      ))}
    </ol>
  );
}
