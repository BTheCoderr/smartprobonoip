export const READINESS_CATEGORY_IDS = [
  "core_idea",
  "problem_audience",
  "prototype_materials",
  "timeline",
  "public_disclosure",
  "expert_handoff",
] as const;

export type ReadinessCategoryId = (typeof READINESS_CATEGORY_IDS)[number];

/** Discriminator for the inventor-facing overall score (Formula A). */
export const READINESS_SCORE_SOURCE = "packet_review_v1" as const;
export type ReadinessScoreSource = typeof READINESS_SCORE_SOURCE;

/** Matches `WIZARD_STEPS` ids in intake wizardConfig. */
export type WizardStepId =
  | "idea"
  | "timeline"
  | "materials"
  | "search"
  | "review";

export type ReadinessTargetKind =
  | "profile_anchor"
  | "research"
  | "intake_step";

export interface ReadinessIntakeTarget {
  kind: ReadinessTargetKind;
  /** Absolute app path including query/hash when applicable. */
  href: string;
  label: string;
  stepId?: WizardStepId;
  anchor?: string;
}

export interface ReadinessCategoryScore {
  id: ReadinessCategoryId;
  label: string;
  score: number;
  max: number;
  /** Educational rationale — never a legal conclusion. */
  whyItMatters: string;
}

export interface ReadinessAction {
  id: string;
  label: string;
  categoryId: ReadinessCategoryId;
  /** Intake field or checklist item this action addresses. */
  fieldKey: string;
  target: ReadinessIntakeTarget;
}

export interface ReadinessEvaluation {
  overallScore: number;
  categories: ReadinessCategoryScore[];
  actions: ReadinessAction[];
  source: ReadinessScoreSource;
}
