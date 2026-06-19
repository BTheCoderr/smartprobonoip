import { computeMetrics } from "@/lib/metrics";
import type { ProjectRecord } from "@/lib/types";

export const DEFAULT_FOLLOW_UP = {
  day30: "pending" as const,
  day60: "pending" as const,
  day90: "pending" as const,
};

export function withDefaultFollowUp(
  record: ProjectRecord,
): ProjectRecord {
  return {
    ...record,
    followUpStatus: record.followUpStatus ?? DEFAULT_FOLLOW_UP,
  };
}

export function filterLiveRecords(records: ProjectRecord[]): ProjectRecord[] {
  return records.filter((r) => !r.isDemo);
}

export function summarizeRecords(records: ProjectRecord[]) {
  return computeMetrics(records.map(withDefaultFollowUp));
}
