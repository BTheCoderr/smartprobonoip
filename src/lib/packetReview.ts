import { PACKET_COPY } from "@/lib/copy";
import {
  buildMaterialsChecklist,
  buildMissingInfoStatus,
  buildPatentPrepChecklist,
} from "@/lib/packet";
import type { ProjectRecord } from "@/lib/types";

export interface PacketReviewSummary {
  readinessScore: number;
  completeSections: string[];
  weakSections: string[];
  topGaps: string[];
  suggestedImprovements: string[];
  unansweredQuestions: string[];
  strengthenMessage: string;
}

export function computeReadinessScore(
  record: ProjectRecord,
  savedReferenceCount = 0,
): number {
  const prep = buildPatentPrepChecklist(record);
  const materials = buildMaterialsChecklist(record);
  const prepComplete = prep.filter((row) => row.complete).length;
  const materialsAvailable = materials.filter((item) => item.available).length;
  const base = Math.round(
    ((prepComplete / Math.max(prep.length, 1)) * 0.65 +
      (materialsAvailable / Math.max(materials.length, 1)) * 0.35) *
      100,
  );
  const researchBonus = savedReferenceCount > 0 ? 5 : 0;
  return Math.min(100, base + researchBonus);
}

export function buildPacketReviewSummary(
  record: ProjectRecord,
  savedReferenceCount = 0,
): PacketReviewSummary {
  const { profile } = record;
  const missing = buildMissingInfoStatus(record, savedReferenceCount);
  const readinessScore = computeReadinessScore(record, savedReferenceCount);

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
    completeSections,
    weakSections,
    topGaps,
    suggestedImprovements,
    unansweredQuestions,
    strengthenMessage,
  };
}
