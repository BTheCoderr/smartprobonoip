import { WIZARD_STEPS } from "@/lib/intake/wizardConfig";
import { ROUTES } from "@/lib/routes";
import type { ReadinessIntakeTarget, WizardStepId } from "./types";

export const PROFILE_ANCHORS = {
  readinessDashboard: "readiness-dashboard",
  developmentTimeline: "development-timeline",
  materialsChecklist: "materials-checklist",
  similarReferences: "similar-reference-search-prep",
} as const;

export function isWizardStepId(value: string): value is WizardStepId {
  return WIZARD_STEPS.some((step) => step.id === value);
}

export function wizardStepIndex(stepId: WizardStepId): number {
  const index = WIZARD_STEPS.findIndex((step) => step.id === stepId);
  return index >= 0 ? index : 0;
}

export function intakeResumeHref(
  projectId: string,
  stepId: WizardStepId,
): string {
  const params = new URLSearchParams({
    record: projectId,
    step: stepId,
  });
  return `${ROUTES.start}?${params.toString()}`;
}

export function profileAnchorHref(projectId: string, anchor: string): string {
  return `${ROUTES.profile(projectId)}#${anchor}`;
}

export function researchHref(projectId: string): string {
  return ROUTES.profileResearch(projectId);
}

export function intakeStepTarget(
  projectId: string,
  stepId: WizardStepId,
  label: string,
): ReadinessIntakeTarget {
  return {
    kind: "intake_step",
    href: intakeResumeHref(projectId, stepId),
    label,
    stepId,
  };
}

export function profileAnchorTarget(
  projectId: string,
  anchor: string,
  label: string,
): ReadinessIntakeTarget {
  return {
    kind: "profile_anchor",
    href: profileAnchorHref(projectId, anchor),
    label,
    anchor,
  };
}

export function researchTarget(
  projectId: string,
  label: string,
): ReadinessIntakeTarget {
  return {
    kind: "research",
    href: researchHref(projectId),
    label,
  };
}
