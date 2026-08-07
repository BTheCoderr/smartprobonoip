import { computeOverallReadinessScore } from "@/lib/readiness";
import type { ProjectRecord } from "@/lib/types";
import { resolveInventionTitle } from "./title";
import type { InventionStatus, InventionSummary } from "./types";

export interface InventionSummaryInput {
  record: ProjectRecord;
  savedReferenceCount?: number;
  documentCount?: number;
  /** Timestamp of the newest timeline event, when known. */
  lastEventAt?: string | null;
}

function latestTimestamp(...values: (string | null | undefined)[]): string {
  const times = values
    .filter((value): value is string => Boolean(value))
    .map((value) => ({ value, ms: Date.parse(value) }))
    .filter((entry) => Number.isFinite(entry.ms));

  if (times.length === 0) return new Date(0).toISOString();
  return times.reduce((newest, entry) => (entry.ms > newest.ms ? entry : newest))
    .value;
}

/**
 * Records created before the workspace have no stored status. They always have a
 * generated packet, so that is the honest default rather than "draft".
 */
export function resolveInventionStatus(record: ProjectRecord): InventionStatus {
  return record.status ?? "packet_generated";
}

/**
 * Builds the portfolio list projection. Free-text intake answers and the full
 * profile are intentionally left out so a portfolio response stays small and
 * does not ship every invention's private text to render a list.
 */
export function toInventionSummary({
  record,
  savedReferenceCount = 0,
  documentCount = 0,
  lastEventAt = null,
}: InventionSummaryInput): InventionSummary {
  const updatedAt = record.updatedAt ?? record.createdAt;

  return {
    id: record.id,
    title: resolveInventionTitle(record.answers, record.title),
    status: resolveInventionStatus(record),
    readinessScore: computeOverallReadinessScore(record, savedReferenceCount),
    createdAt: record.createdAt,
    updatedAt,
    lastActivityAt: latestTimestamp(lastEventAt, updatedAt, record.createdAt),
    isDemo: record.isDemo ?? false,
    hasPacket: Boolean(record.profile?.ideaSummary?.trim()),
    publicDisclosure: Boolean(record.profile?.publicDisclosure),
    signalCount: record.profile?.signals?.length ?? 0,
    savedReferenceCount,
    documentCount,
    preClarity: record.preClarity,
    postClarity: record.postClarity,
  };
}
