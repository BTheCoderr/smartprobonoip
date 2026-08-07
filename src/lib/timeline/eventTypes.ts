import type { TimelineEventType } from "./types";

interface TimelineEventMeta {
  label: string;
  /** Default detail used when an event is derived rather than stored. */
  defaultDetail: string;
  tone: "navy" | "teal" | "aqua" | "gray";
}

const EVENT_META: Record<TimelineEventType, TimelineEventMeta> = {
  idea_created: {
    label: "Idea created",
    defaultDetail: "Invention record created from intake.",
    tone: "teal",
  },
  materials_recorded: {
    label: "Materials recorded",
    defaultDetail: "Prototype and supporting materials noted during intake.",
    tone: "aqua",
  },
  packet_generated: {
    label: "Packet generated",
    defaultDetail: "IP Readiness Packet generated.",
    tone: "teal",
  },
  packet_updated: {
    label: "Packet updated",
    defaultDetail: "Packet content revised.",
    tone: "navy",
  },
  research_reference_added: {
    label: "Research added",
    defaultDetail: "Possible similar reference saved to the research workspace.",
    tone: "aqua",
  },
  timeline_updated: {
    label: "Development dates updated",
    defaultDetail: "Development dates added to the invention timeline.",
    tone: "navy",
  },
  document_generated: {
    label: "Document generated",
    defaultDetail: "Export generated and saved to your device.",
    tone: "navy",
  },
  professional_handoff_prepared: {
    label: "Professional review prep",
    defaultDetail: "Handoff packet prepared for a patent professional.",
    tone: "navy",
  },
  clarity_recorded: {
    label: "Clarity rating recorded",
    defaultDetail: "Clarity rating recorded after reviewing the packet.",
    tone: "gray",
  },
  status_changed: {
    label: "Status changed",
    defaultDetail: "Invention status updated.",
    tone: "gray",
  },
  title_updated: {
    label: "Title updated",
    defaultDetail: "Invention title updated.",
    tone: "gray",
  },
  recovered: {
    label: "Access recovered",
    defaultDetail: "Invention restored to this device with a recovery link.",
    tone: "gray",
  },
};

export const TIMELINE_EVENT_TYPES = Object.keys(
  EVENT_META,
) as TimelineEventType[];

export function isTimelineEventType(value: unknown): value is TimelineEventType {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(EVENT_META, value)
  );
}

export function timelineEventLabel(type: TimelineEventType): string {
  return EVENT_META[type].label;
}

export function timelineEventDetail(type: TimelineEventType): string {
  return EVENT_META[type].defaultDetail;
}

export function timelineEventTone(
  type: TimelineEventType,
): TimelineEventMeta["tone"] {
  return EVENT_META[type].tone;
}