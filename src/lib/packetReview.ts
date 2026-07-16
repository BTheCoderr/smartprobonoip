import { PACKET_COPY } from "@/lib/copy";
import {
  buildMaterialsChecklist,
  buildMissingInfoStatus,
  countFilledTimelineFields,
  getTimelineFieldValue,
} from "@/lib/packet";
import type { ProjectRecord } from "@/lib/types";

export interface ReadinessBreakdownItem {
  label: string;
  score: number;
  max: number;
}

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

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function computeReadinessBreakdown(
  record: ProjectRecord,
  savedReferenceCount = 0,
): ReadinessBreakdownItem[] {
  const { answers, profile } = record;

  const coreScore = [
    answers.whatCreated,
    answers.mainParts,
    answers.howItWorks,
    answers.whatDifferent,
  ].reduce((sum, field) => sum + (hasText(field) ? 5 : 0), 0);

  const problemScore =
    (hasText(answers.problemSolved) ? 8 : 0) + (hasText(answers.whoFor) ? 7 : 0);

  let prototypeMaterialsScore = answers.hasPrototype ? 8 : 0;
  prototypeMaterialsScore += Math.min(12, answers.assets.length * 4);

  const timelineFilled = countFilledTimelineFields(record.developmentTimeline);
  const timelineScore = Math.round((timelineFilled / 6) * 15);

  let disclosureScore = 15;
  if (profile.publicDisclosure) {
    disclosureScore = 5;
    if (
      hasText(
        getTimelineFieldValue(
          record.developmentTimeline,
          "Date first shared publicly",
        ),
      )
    ) {
      disclosureScore += 5;
    }
    if (answers.sharedChannels.some((channel) => channel !== "none")) {
      disclosureScore += 5;
    }
  }

  const handoffFields = [
    answers.whatCreated,
    answers.problemSolved,
    answers.howItWorks,
    answers.mainParts,
    answers.whatDifferent,
  ].filter(hasText).length;
  let expertScore = Math.round((handoffFields / 5) * 10);
  if (savedReferenceCount > 0) expertScore += 5;
  expertScore = Math.min(15, expertScore);

  return [
    { label: "Core idea clarity", score: coreScore, max: 20 },
    { label: "Problem and audience clarity", score: problemScore, max: 15 },
    {
      label: "Prototype/materials readiness",
      score: prototypeMaterialsScore,
      max: 20,
    },
    { label: "Timeline readiness", score: timelineScore, max: 15 },
    {
      label: "Public disclosure clarity",
      score: disclosureScore,
      max: 15,
    },
    { label: "Expert handoff readiness", score: expertScore, max: 15 },
  ];
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

export function computeReadinessScore(
  record: ProjectRecord,
  savedReferenceCount = 0,
): number {
  const breakdown = computeReadinessBreakdown(record, savedReferenceCount);
  return breakdown.reduce((sum, item) => sum + item.score, 0);
}

export function buildPacketReviewSummary(
  record: ProjectRecord,
  savedReferenceCount = 0,
): PacketReviewSummary {
  const { profile } = record;
  const missing = buildMissingInfoStatus(record, savedReferenceCount);
  const scoreBreakdown = computeReadinessBreakdown(record, savedReferenceCount);
  const readinessScore = scoreBreakdown.reduce((sum, item) => sum + item.score, 0);
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
