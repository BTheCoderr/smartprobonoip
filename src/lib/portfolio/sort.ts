import { inventionStatusOrder } from "@/lib/ideas/status";
import type { InventionSummary } from "@/lib/ideas/types";
import type { InventionSortMode } from "./types";

export const INVENTION_SORT_MODES: {
  id: InventionSortMode;
  label: string;
}[] = [
  { id: "recent", label: "Last updated" },
  { id: "created", label: "Newest" },
  { id: "readiness", label: "Readiness" },
  { id: "title", label: "Title" },
  { id: "status", label: "Status" },
];

function byTime(a: string, b: string): number {
  return Date.parse(b) - Date.parse(a);
}

export function sortInventions(
  inventions: InventionSummary[],
  mode: InventionSortMode,
): InventionSummary[] {
  const sorted = [...inventions];

  switch (mode) {
    case "created":
      return sorted.sort((a, b) => byTime(a.createdAt, b.createdAt));
    case "readiness":
      return sorted.sort((a, b) => b.readinessScore - a.readinessScore);
    case "title":
      return sorted.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      );
    case "status":
      return sorted.sort(
        (a, b) =>
          inventionStatusOrder(a.status) - inventionStatusOrder(b.status) ||
          byTime(a.lastActivityAt, b.lastActivityAt),
      );
    case "recent":
    default:
      return sorted.sort((a, b) => byTime(a.lastActivityAt, b.lastActivityAt));
  }
}

export function isInventionSortMode(value: unknown): value is InventionSortMode {
  return (
    typeof value === "string" &&
    INVENTION_SORT_MODES.some((mode) => mode.id === value)
  );
}
