import type { InventionStatus } from "./types";

export const INVENTION_STATUSES: readonly InventionStatus[] = [
  "created",
  "packet_generated",
  "researching",
  "professional_review",
  "archived",
] as const;

interface StatusMeta {
  label: string;
  description: string;
  tone: "navy" | "teal" | "aqua" | "gray";
  /** Display order in the workspace, lowest first. */
  order: number;
}

const STATUS_META: Record<InventionStatus, StatusMeta> = {
  created: {
    label: "Draft",
    description: "Intake started. No packet generated yet.",
    tone: "gray",
    order: 0,
  },
  packet_generated: {
    label: "Packet ready",
    description: "An IP Readiness Packet has been generated.",
    tone: "teal",
    order: 1,
  },
  researching: {
    label: "Researching",
    description: "Gathering possible similar references and prep notes.",
    tone: "aqua",
    order: 2,
  },
  professional_review: {
    label: "With a professional",
    description: "Shared with a patent professional for review.",
    tone: "navy",
    order: 3,
  },
  archived: {
    label: "Archived",
    description: "Set aside. Still readable and exportable.",
    tone: "gray",
    order: 4,
  },
};

export function isInventionStatus(value: unknown): value is InventionStatus {
  return (
    typeof value === "string" &&
    (INVENTION_STATUSES as readonly string[]).includes(value)
  );
}

export function inventionStatusLabel(status: InventionStatus): string {
  return STATUS_META[status].label;
}

export function inventionStatusDescription(status: InventionStatus): string {
  return STATUS_META[status].description;
}

export function inventionStatusTone(status: InventionStatus): StatusMeta["tone"] {
  return STATUS_META[status].tone;
}

export function inventionStatusOrder(status: InventionStatus): number {
  return STATUS_META[status].order;
}

/** Statuses an inventor can pick in the workspace, in display order. */
export function selectableInventionStatuses(): InventionStatus[] {
  return [...INVENTION_STATUSES].sort(
    (a, b) => inventionStatusOrder(a) - inventionStatusOrder(b),
  );
}

export function isActiveStatus(status: InventionStatus): boolean {
  return status !== "archived";
}
