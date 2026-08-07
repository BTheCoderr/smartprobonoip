import { INVENTION_STATUSES, isActiveStatus } from "@/lib/ideas/status";
import type { InventionStatus, InventionSummary } from "@/lib/ideas/types";
import type { PortfolioSummary } from "./types";

/** Below this an invention is surfaced as needing attention before expert review. */
export const NEEDS_ATTENTION_THRESHOLD = 55;

const MAX_NEEDS_ATTENTION = 3;

function emptyStatusCounts(): Record<InventionStatus, number> {
  return INVENTION_STATUSES.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<InventionStatus, number>,
  );
}

export function buildPortfolioSummary(
  inventions: InventionSummary[],
): PortfolioSummary {
  const byStatus = emptyStatusCounts();
  for (const invention of inventions) {
    byStatus[invention.status] += 1;
  }

  const active = inventions.filter((i) => isActiveStatus(i.status));
  const averageReadiness =
    active.length > 0
      ? Math.round(
          active.reduce((sum, i) => sum + i.readinessScore, 0) / active.length,
        )
      : null;

  const strongest =
    active.length > 0
      ? active.reduce((best, i) =>
          i.readinessScore > best.readinessScore ? i : best,
        )
      : null;

  const needsAttention = [...active]
    .filter((i) => i.readinessScore < NEEDS_ATTENTION_THRESHOLD)
    .sort((a, b) => a.readinessScore - b.readinessScore)
    .slice(0, MAX_NEEDS_ATTENTION);

  const lastActivityAt = inventions.reduce<string | null>((latest, i) => {
    if (!latest) return i.lastActivityAt;
    return Date.parse(i.lastActivityAt) > Date.parse(latest)
      ? i.lastActivityAt
      : latest;
  }, null);

  return {
    total: inventions.length,
    active: active.length,
    archived: inventions.length - active.length,
    byStatus,
    averageReadiness,
    strongest,
    needsAttention,
    publicDisclosureCount: inventions.filter((i) => i.publicDisclosure).length,
    lastActivityAt,
  };
}

export interface ReadinessBand {
  label: string;
  description: string;
  tone: "teal" | "aqua" | "navy";
  min: number;
}

const READINESS_BANDS: ReadinessBand[] = [
  {
    label: "Well organized",
    description:
      "Packet preparation looks complete enough to walk a professional through it.",
    tone: "teal",
    min: 80,
  },
  {
    label: "Solid base",
    description: "Strengthen the flagged preparation sections before expert review.",
    tone: "aqua",
    min: NEEDS_ATTENTION_THRESHOLD,
  },
  {
    label: "Needs attention",
    description: "Core preparation details are still missing from the packet.",
    tone: "navy",
    min: 0,
  },
];

export function readinessBand(score: number): ReadinessBand {
  return (
    READINESS_BANDS.find((band) => score >= band.min) ??
    READINESS_BANDS[READINESS_BANDS.length - 1]
  );
}
