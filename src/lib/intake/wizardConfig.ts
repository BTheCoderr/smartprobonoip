import type { IntakeAnswers } from "@/lib/types";
import {
  validateForGeneration,
  validateIdeaCoreStep,
  type FieldValidationError,
} from "@/lib/intakeValidation";

export const WIZARD_STEPS = [
  {
    id: "idea",
    label: "Your Idea",
    minutes: 4,
    hint: "Plain language is enough — use examples if helpful. You can refine later.",
    skippable: false,
  },
  {
    id: "timeline",
    label: "Timeline & Disclosures",
    minutes: 2,
    hint: "Rough dates and sharing history help professionals ask better questions — all optional here.",
    skippable: true,
  },
  {
    id: "materials",
    label: "Materials & Prototype",
    minutes: 2,
    hint: "Select what you have today. Missing items can go on your packet checklist later.",
    skippable: true,
  },
  {
    id: "search",
    label: "Search Prep",
    minutes: 4,
    hint: "Optional questions in your own words — they help build better starter search queries in your packet. Skip any you like; the full workspace unlocks after generation.",
    skippable: true,
  },
  {
    id: "review",
    label: "Review & Export",
    minutes: 2,
    hint: "Confirm your answers, then generate your IP Readiness Packet.",
    skippable: false,
  },
] as const;

export const WIZARD_TOTAL_MINUTES = WIZARD_STEPS.reduce(
  (sum, step) => sum + step.minutes,
  0,
);

export function estimatedMinutesRemaining(currentStep: number): number {
  return WIZARD_STEPS.slice(currentStep).reduce(
    (sum, step) => sum + step.minutes,
    0,
  );
}

export function validateWizardStep(
  step: number,
  answers: IntakeAnswers,
): FieldValidationError | null {
  if (step === 0) {
    return validateIdeaCoreStep(answers);
  }
  if (step === WIZARD_STEPS.length - 1) {
    const errors = validateForGeneration(answers);
    return errors[0] ?? null;
  }
  return null;
}

export const READINESS_CHECKLIST = [
  "Plain-language idea summary",
  "Readiness snapshot & organization score",
  "Development timeline editor",
  "Materials checklist",
  "Similar reference search prep workspace",
  "PDF download & Export for Attorney",
] as const;
