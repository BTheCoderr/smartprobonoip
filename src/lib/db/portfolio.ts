import "server-only";
import { toInventionSummary } from "@/lib/ideas/summary";
import type { InventionSummary } from "@/lib/ideas/types";
import { buildPortfolioSummary } from "@/lib/portfolio/aggregate";
import type { PortfolioSnapshot } from "@/lib/portfolio/types";
import type { ActivityEvent } from "@/lib/timeline/types";
import { getSupabaseService } from "@/lib/supabaseServer";
import {
  countDocumentsByProject,
  listDocumentsForProjects,
} from "./documents";
import { getLastEventAtByProject, listEventsForProjects } from "./events";
import { listRecordsForOwnerUser, listRecordsForSession } from "./records";

const RECENT_ACTIVITY_LIMIT = 12;
const RECENT_DOCUMENTS_LIMIT = 6;

async function countReferencesByProject(
  projectIds: string[],
): Promise<Record<string, number>> {
  if (projectIds.length === 0) return {};

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_saved_references")
    .select("project_id")
    .in("project_id", projectIds);

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data as { project_id: string }[]) {
    counts[row.project_id] = (counts[row.project_id] ?? 0) + 1;
  }
  return counts;
}

/**
 * Assembles the whole workspace in one round trip.
 *
 * Full records are loaded server-side because readiness scoring needs the
 * answers and profile, but only `InventionSummary` values leave this function —
 * a portfolio response never carries every invention's private text.
 */
export async function getPortfolioSnapshot(
  pilotSessionId: string | null,
  ownerUserId?: string | null,
): Promise<PortfolioSnapshot> {
  const [sessionRecords, ownerRecords] = await Promise.all([
    pilotSessionId ? listRecordsForSession(pilotSessionId) : Promise.resolve([]),
    ownerUserId ? listRecordsForOwnerUser(ownerUserId) : Promise.resolve([]),
  ]);
  const deduped = new Map(
    [...sessionRecords, ...ownerRecords].map((record) => [record.id, record]),
  );
  const liveRecords = [...deduped.values()]
    .filter((record) => !record.isDemo)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (liveRecords.length === 0) {
    return {
      inventions: [],
      summary: buildPortfolioSummary([]),
      recentActivity: [],
      recentDocuments: [],
    };
  }

  const projectIds = liveRecords.map((record) => record.id);
  const [referenceCounts, documentCounts, lastEventAt, events, documents] =
    await Promise.all([
      countReferencesByProject(projectIds),
      countDocumentsByProject(projectIds),
      getLastEventAtByProject(projectIds),
      listEventsForProjects(projectIds, RECENT_ACTIVITY_LIMIT),
      listDocumentsForProjects(projectIds, RECENT_DOCUMENTS_LIMIT),
    ]);

  const inventions: InventionSummary[] = liveRecords.map((record) =>
    toInventionSummary({
      record,
      savedReferenceCount: referenceCounts[record.id] ?? 0,
      documentCount: documentCounts[record.id] ?? 0,
      lastEventAt: lastEventAt[record.id] ?? null,
    }),
  );

  const titleById = new Map(
    inventions.map((invention) => [invention.id, invention.title]),
  );

  const recentActivity: ActivityEvent[] = events.map((event) => ({
    ...event,
    inventionTitle: titleById.get(event.inventionId) ?? "Invention",
  }));

  const recentDocuments = documents.map((document) => ({
    ...document,
    inventionTitle: titleById.get(document.inventionId) ?? "Invention",
  }));

  return {
    inventions,
    summary: buildPortfolioSummary(inventions),
    recentActivity,
    recentDocuments,
  };
}
