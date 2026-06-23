import { ASSET_LABELS } from "./labels";
import { containsForbiddenLanguage } from "./safety";
import type { IntakeAnswers, ProjectRecord } from "./types";

export interface SummaryField {
  label: string;
  value: string;
}

export interface SnapshotItem {
  label: string;
  value: string;
  flagged?: boolean;
}

export interface FollowUpStep {
  window: string;
  title: string;
  actions: string[];
}

export function getIdeaLabel(answers: IntakeAnswers): string {
  const raw = answers.whatCreated?.trim();
  if (!raw) return "Untitled idea";
  const firstSentence = raw.split(/[.!?\n]/)[0].trim();
  const base = firstSentence.length > 0 ? firstSentence : raw;
  return base.length > 70 ? `${base.slice(0, 67)}…` : base;
}

export function buildIdeaSummaryFields(answers: IntakeAnswers): SummaryField[] {
  const fields: SummaryField[] = [
    { label: "What you created", value: answers.whatCreated },
    { label: "What problem it solves", value: answers.problemSolved },
    { label: "Who it is for", value: answers.whoFor },
    { label: "How it works", value: answers.howItWorks },
  ];
  return fields
    .map((f) => ({ label: f.label, value: f.value?.trim() ?? "" }))
    .filter((f) => f.value.length > 0);
}

export function buildReadinessSnapshot(record: ProjectRecord): SnapshotItem[] {
  const { answers, profile } = record;

  const materials =
    answers.assets.length > 0
      ? answers.assets.map((a) => ASSET_LABELS[a]).join(", ")
      : "None recorded yet";

  return [
    {
      label: "Prototype status",
      value: answers.hasPrototype
        ? "A prototype or working demonstration exists"
        : "No prototype recorded yet",
    },
    {
      label: "Public sharing / disclosure",
      value: profile.publicDisclosure
        ? "Possible public disclosure indicated"
        : "No public disclosure indicated",
      flagged: profile.publicDisclosure,
    },
    {
      label: "Brand / name / logo",
      value: answers.hasBrandIdentity
        ? "Has a name, logo, slogan, or brand identity"
        : "No brand identity recorded yet",
    },
    {
      label: "Supporting materials available",
      value: materials,
    },
  ];
}

export function buildFollowUpPlan(): FollowUpStep[] {
  return [
    {
      window: "30 days",
      title: "Organize and gather",
      actions: [
        "Fill in any missing information listed in this packet.",
        "Collect your supporting materials such as drawings, diagrams, notes, photos, or code.",
        "Write down anything you are unsure about so you can ask later.",
      ],
    },
    {
      window: "60 days",
      title: "Prepare to talk with an expert",
      actions: [
        "Review the suggested resource categories in this packet.",
        "Consider discussing your idea with a relevant expert, resource, or partner.",
        "Bring the questions from the Expert Conversation Prep section with you.",
      ],
    },
    {
      window: "90 days",
      title: "Reassess and decide a next step",
      actions: [
        "Update your readiness status based on what you have learned.",
        "Note which gaps are now filled and which remain.",
        "Decide on your next preparation step based on your conversations.",
      ],
    },
  ];
}

export function assertPacketContentSafe(): void {
  const plan = buildFollowUpPlan();
  const text = plan
    .flatMap((step) => [step.title, ...step.actions])
    .join(" \n ");
  if (containsForbiddenLanguage(text)) {
    throw new Error("Follow-up plan contains forbidden language");
  }
}
