import { clarityDelta, computeMetrics } from "./metrics";
import type { DashboardMetrics, ProjectRecord } from "./types";
import { getPilotSourceLabel, resolvePartnerName } from "./partnerTracking";

export interface PartnerSummary {
  partnerSlug: string;
  partnerName: string;
  packetCount: number;
  metrics: DashboardMetrics;
  recentRecords: ProjectRecord[];
}

export function partnerLabel(record: ProjectRecord): string {
  return (
    getPilotSourceLabel(record) ??
    (record.partnerSlug
      ? (resolvePartnerName(record.partnerSlug) ?? record.partnerSlug)
      : "Unattributed")
  );
}

export function computePartnerSummaries(
  records: ProjectRecord[],
): PartnerSummary[] {
  const groups = new Map<string, ProjectRecord[]>();

  for (const record of records) {
    const slug = record.partnerSlug ?? "__none__";
    const list = groups.get(slug) ?? [];
    list.push(record);
    groups.set(slug, list);
  }

  return [...groups.entries()]
    .map(([slug, group]) => {
      const partnerSlug = slug === "__none__" ? "unattributed" : slug;
      const partnerName =
        slug === "__none__"
          ? "Unattributed"
          : (group.find((r) => r.partnerName)?.partnerName ??
            resolvePartnerName(slug) ??
            slug);
      const sorted = [...group].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return {
        partnerSlug,
        partnerName,
        packetCount: group.length,
        metrics: computeMetrics(group),
        recentRecords: sorted.slice(0, 5),
      };
    })
    .sort((a, b) => b.packetCount - a.packetCount);
}

export function uniqueFilterValues(
  records: ProjectRecord[],
  key: "partnerSlug" | "source" | "campaign",
): string[] {
  const values = new Set<string>();
  for (const record of records) {
    const value = record[key];
    if (value) values.add(value);
  }
  return [...values].sort();
}

export function selectedPartnerSummary(
  records: ProjectRecord[],
  partnerSlug: string,
): PartnerSummary | null {
  if (!partnerSlug || partnerSlug === "all") return null;
  const match =
    partnerSlug === "unattributed"
      ? records.filter((r) => !r.partnerSlug)
      : records.filter((r) => r.partnerSlug === partnerSlug);
  if (match.length === 0) return null;
  return computePartnerSummaries(match)[0] ?? null;
}

export { clarityDelta };
