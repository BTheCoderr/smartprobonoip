export {
  buildReadinessEvaluation,
  computeOverallReadinessScore,
  computeReadinessCategoryBreakdown,
} from "./score";
export { buildReadinessActions } from "./actions";
export {
  PROFILE_ANCHORS,
  intakeResumeHref,
  isWizardStepId,
  profileAnchorHref,
  researchHref,
  wizardStepIndex,
} from "./links";
export { readinessScoresAcrossSurfaces } from "./surfaces";
export {
  READINESS_CATEGORY_IDS,
  READINESS_SCORE_SOURCE,
  type ReadinessAction,
  type ReadinessCategoryId,
  type ReadinessCategoryScore,
  type ReadinessEvaluation,
  type ReadinessIntakeTarget,
  type ReadinessScoreSource,
  type WizardStepId,
} from "./types";

/**
 * Compatibility alias used by packet UI / PDF / workspace callers that still
 * import the historical name. Same integer as computeOverallReadinessScore.
 */
export { computeOverallReadinessScore as computeReadinessScore } from "./score";
