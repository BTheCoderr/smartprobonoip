import { toInventionSummary } from "@/lib/ideas/summary";
import { buildPacketReviewSummary } from "@/lib/packetReview";
import { buildPortfolioSummary } from "@/lib/portfolio/aggregate";
import type { ProjectRecord } from "@/lib/types";
import { buildReadinessEvaluation, computeOverallReadinessScore } from "./score";

/**
 * Score projections used by inventor-facing surfaces. All must equal Formula A.
 */
export function readinessScoresAcrossSurfaces(
  record: ProjectRecord,
  savedReferenceCount = 0,
): {
  canonical: number;
  workspaceSummary: number;
  inventionCard: number;
  readinessDashboard: number;
  packetPage: number;
  pdfHelper: number;
} {
  const canonical = computeOverallReadinessScore(record, savedReferenceCount);
  const summary = toInventionSummary({ record, savedReferenceCount });
  const evaluation = buildReadinessEvaluation(record, savedReferenceCount);
  const packetReview = buildPacketReviewSummary(record, savedReferenceCount);

  // Portfolio rollup uses the same summary score the invention card displays.
  buildPortfolioSummary([summary]);

  return {
    canonical,
    workspaceSummary: summary.readinessScore,
    inventionCard: summary.readinessScore,
    readinessDashboard: evaluation.overallScore,
    packetPage: packetReview.readinessScore,
    pdfHelper: packetReview.readinessScore,
  };
}
