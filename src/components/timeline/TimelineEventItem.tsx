import { formatEventDate, formatEventRelative } from "@/lib/timeline/format";
import { timelineEventTone } from "@/lib/timeline/eventTypes";
import type { TimelineEvent } from "@/lib/timeline/types";

const DOT_TONES: Record<ReturnType<typeof timelineEventTone>, string> = {
  teal: "bg-teal-500 ring-teal-100",
  aqua: "bg-aqua-400 ring-aqua-100",
  navy: "bg-navy-500 ring-navy-100",
  gray: "bg-mist-300 ring-mist-100",
};

export function TimelineEventItem({
  event,
  contextLabel,
  isLast = false,
}: {
  event: TimelineEvent;
  /** Invention title, when the event is shown in a cross-invention feed. */
  contextLabel?: string;
  isLast?: boolean;
}) {
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute left-[5px] top-4 h-full w-px bg-mist-200"
        />
      ) : null}
      <span
        aria-hidden="true"
        className={`relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${DOT_TONES[timelineEventTone(event.type)]}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="text-sm font-semibold text-navy-900">{event.label}</p>
          <time
            dateTime={event.occurredAt}
            title={formatEventDate(event.occurredAt)}
            className="text-xs text-navy-400"
          >
            {formatEventRelative(event.occurredAt)}
          </time>
        </div>
        {contextLabel ? (
          <p className="truncate text-xs font-medium text-teal-700">
            {contextLabel}
          </p>
        ) : null}
        {event.detail ? (
          <p className="mt-0.5 text-sm leading-relaxed text-navy-500">
            {event.detail}
          </p>
        ) : null}
      </div>
    </li>
  );
}
