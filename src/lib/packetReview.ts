import { PACKET_COPY } from "@/lib/copy";
import {
  buildMaterialsChecklist,
  buildMissingInfoStatus,
  countFilledTimelineFields,
} from "@/lib/packet";
import {
  buildReadinessEvaluation,
  computeOverallReadinessScore,
  computeReadinessCategoryBreakdown,
  type ReadinessCategoryScore,
} from "@/lib/readiness";
import type { ProjectRecord } from "@/lib/types";

/** @deprecated Prefer ReadinessCategoryScore from @/lib/readiness */
export type ReadinessBreakdownItem = Pick<
  ReadinessCategoryScore,
  "label" | "score" | "max"
>;

export interface PacketReviewSummary {
  readinessScore: number;
  scoreBreakdown: ReadinessBreakdownItem[];
  improveScoreNote: string;
  completeSections: string[];
  weakSections: string[];
  topGaps: string[];
  suggestedImprovements: string[];
  unansweredQuestions: string[];
  strengthenMessage: string;
}

/** Compatibility adapter — delegates to canonical Formula A. */
export function computeReadinessBreakdown(
  record: ProjectRecord,
  savedReferenceCount = 0,
): ReadinessBreakdownItem[] {
  return computeReadinessCategoryBreakdown(record, savedReferenceCount).map(
    ({ label, score, max }) => ({ label, score, max }),
  );
}

export function buildImproveScoreNote(
  record: ProjectRecord,
  savedReferenceCount = 0,
): string {
  const { answers, profile } = record;
  const hints: string[] = [];

  if (countFilledTimelineFields(record.developmentTimeline) < 3) {
    hints.push("development dates");
  }
  if (profile.publicDisclosure) {
    hints.push("clarify public sharing history");
  }
  if (answers.assets.length === 0) {
    hints.push("attach supporting materials");
  }
  if (savedReferenceCount === 0) {
    hints.push("save at least one similar reference");
  }

  if (hints.length === 0) {
    return "Review expert questions and similar-reference notes before your meeting.";
  }

  const joined =
    hints.length === 1
      ? hints[0]
      : `${hints.slice(0, -1).join(", ")}, and ${hints[hints.length - 1]}`;

  return `Add ${joined}.`;
}

/** Compatibility adapter — same integer as computeOverallReadinessScore. */
export function computeReadinessScore(
  record: ProjectRecord,
  savedReferenceCount = 0,
): number {
  return computeOverallReadinessScore(record, savedReferenceCount);
}

export function buildPacketReviewSummary(
  record: ProjectRecord,
  savedReferenceCount = 0,
): PacketReviewSummary {
  const { profile } = record;
  const missing = buildMissingInfoStatus(record, savedReferenceCount);
  const evaluation = buildReadinessEvaluation(record, savedReferenceCount);
  const readinessScore = evaluation.overallScore;
  const scoreBreakdown = evaluation.categories.map(({ label, score, max }) => ({
    label,
    score,
    max,
  }));
  const improveScoreNote = buildImproveScoreNote(record, savedReferenceCount);

  const completeSections = profile.completeInfo.slice(0, 8);
  const weakSections: string[] = [];

  if (missing.coreMissing.length > 0) weakSections.push("Core idea summary");
  if (missing.optionalGaps.includes("Development timeline")) {
    weakSections.push("Development timeline");
  }
  if (missing.optionalGaps.some((g) => g.includes("material") || g.includes("prototype"))) {
    weakSections.push("Materials & prototype notes");
  }
  if (savedReferenceCount === 0) weakSections.push("Similar reference prep");
  if (
    record.answers.contributorsInvolved &&
    record.answers.contributorsInvolved !== "solo" &&
    !record.answers.ownershipNotes?.trim()
  ) {
    weakSections.push("Ownership & contributor notes");
  }

  const topGaps = [...missing.coreMissing, ...missing.optionalGaps].slice(0, 6);

  const suggestedImprovements: string[] = [];
  if (missing.coreMissing.length > 0) {
    suggestedImprovements.push(
      "Fill in core intake gaps so your packet tells a clearer story.",
    );
  }
  if (savedReferenceCount === 0) {
    suggestedImprovements.push(
      "Save at least one possible similar reference and note what looks different.",
    );
  }
  if (missing.optionalGaps.includes("Development timeline")) {
    suggestedImprovements.push(
      "Add key dates to your development timeline before expert review.",
    );
  }
  const materials = buildMaterialsChecklist(record);
  if (materials.filter((m) => !m.available).length > 2) {
    suggestedImprovements.push(
      "Gather sketches, photos, or prototype notes listed in your materials checklist.",
    );
  }
  if (profile.publicDisclosure) {
    suggestedImprovements.push(
      "Review your public sharing notes and be ready to discuss timing with an expert.",
    );
  }
  if (suggestedImprovements.length === 0) {
    suggestedImprovements.push(
      "Review expert questions below and update any sections before your next conversation.",
    );
  }

  const unansweredQuestions = profile.expertQuestions.slice(0, 5);

  const strengthenMessage =
    readinessScore >= 80
      ? "Your packet is well organized. Focus on similar-reference notes and expert questions before your meeting."
      : readinessScore >= 55
        ? "Your packet has a solid base. Strengthen the sections flagged below before expert review."
        : PACKET_COPY.coreNeedsAttention(missing.coreMissing.length || 1);

  return {
    readinessScore,
    scoreBreakdown,
    improveScoreNote,
    completeSections,
    weakSections,
    topGaps,
    suggestedImprovements,
    unansweredQuestions,
    strengthenMessage,
  };
}
