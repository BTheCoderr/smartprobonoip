import type { ReferenceType, SavedReference } from "@/lib/research/types";
import { REFERENCE_TYPE_OPTIONS } from "@/lib/research/types";

export interface ResearchPrepMetrics {
  packetsWithSavedReferences: number;
  averageSavedReferencesPerPacket: number;
  topReferenceTypes: { label: string; value: number }[];
  researchPrepStartedCount: number;
}

export interface ProjectResearchSummary {
  projectId: string;
  savedReferenceCount: number;
  referenceTypes: string[];
  researchPrepStarted: boolean;
}

function referenceTypeLabel(type: string): string {
  return (
    REFERENCE_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
  );
}

export function computeResearchMetrics(input: {
  summaries: ProjectResearchSummary[];
  researchPrepStartedCount?: number;
}): ResearchPrepMetrics {
  const withRefs = input.summaries.filter((s) => s.savedReferenceCount > 0);
  const totalRefs = withRefs.reduce((sum, s) => sum + s.savedReferenceCount, 0);
  const typeCounts = new Map<string, number>();

  for (const summary of input.summaries) {
    for (const type of summary.referenceTypes) {
      if (!type) continue;
      const label = referenceTypeLabel(type);
      typeCounts.set(label, (typeCounts.get(label) ?? 0) + 1);
    }
  }

  const topReferenceTypes = [...typeCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const startedFromSummaries = input.summaries.filter(
    (s) => s.researchPrepStarted || s.savedReferenceCount > 0,
  ).length;

  return {
    packetsWithSavedReferences: withRefs.length,
    averageSavedReferencesPerPacket:
      withRefs.length > 0
        ? Math.round((totalRefs / withRefs.length) * 10) / 10
        : 0,
    topReferenceTypes,
    researchPrepStartedCount:
      input.researchPrepStartedCount ?? startedFromSummaries,
  };
}

export function summarizeSavedReferences(
  projectId: string,
  refs: SavedReference[],
  researchPrepStarted = false,
): ProjectResearchSummary {
  return {
    projectId,
    savedReferenceCount: refs.length,
    referenceTypes: refs
      .map((ref) => ref.referenceType)
      .filter(Boolean) as ReferenceType[],
    researchPrepStarted: researchPrepStarted || refs.length > 0,
  };
}

export function researchCsvFields(summary: ProjectResearchSummary | undefined) {
  return {
    saved_reference_count: summary?.savedReferenceCount ?? 0,
    research_prep_started: summary?.researchPrepStarted ?? false,
    reference_types: (summary?.referenceTypes ?? []).join(";"),
  };
}
