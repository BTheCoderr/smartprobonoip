import { ASSET_LABELS, SHARING_LABELS } from "./labels";
import { assertPatentSearchPrepSafe } from "./patentSearchPrep";
import { containsForbiddenLanguage } from "./safety";
import type { AssetType, IntakeAnswers, ProjectRecord } from "./types";

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

export interface ChecklistRow {
  label: string;
  value: string;
  complete: boolean;
}

export interface MaterialItem {
  label: string;
  available: boolean;
}

export interface DifferenceRow {
  existing: string;
  difference: string;
  whyItMatters: string;
}

export interface ExpertHandoff {
  ideaSummary: string;
  mainComponents: string;
  howItWorks: string;
  differences: string;
  prototypeStatus: string;
  publicSharingTimeline: string;
  materialsAvailable: string;
  expertQuestions: string[];
}

export const PATENT_PREP_INTRO =
  "If patent protection may be relevant to your idea, consider organizing the information below so a professional may want to review it. This section is preparation only — it is not legal advice and not a legal conclusion.";

export const DIFFERENCE_MAP_NOTE =
  "These are user-described differences only. A professional would need to review whether they matter legally.";

export const TIMELINE_NOTE =
  "Fill in any dates you remember. Approximate dates are fine. This helps a professional understand your development history.";

export const DEVELOPMENT_TIMELINE_FIELDS = [
  "Date idea started",
  "Date first written down or sketched",
  "Date first prototype built",
  "Date first shared publicly",
  "Date first pitched, sold, or demoed",
  "Date of major improvements",
];

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

function sharingTimeline(answers: IntakeAnswers): string {
  const channels = answers.sharedChannels.filter((c) => c !== "none");
  if (channels.length === 0) {
    return "Not shared publicly yet (per your answers).";
  }
  return `Reported sharing: ${channels
    .map((c) => SHARING_LABELS[c])
    .join(", ")}.`;
}

function materialsSummary(answers: IntakeAnswers): string {
  return answers.assets.length > 0
    ? answers.assets.map((a) => ASSET_LABELS[a]).join(", ")
    : "None recorded yet";
}

export function buildPatentPrepChecklist(record: ProjectRecord): ChecklistRow[] {
  const { answers, profile } = record;
  const text = (v: string) => (v?.trim().length > 0 ? v.trim() : "");
  const has = (v: string) => text(v).length > 0;

  return [
    {
      label: "What was created",
      value: text(answers.whatCreated),
      complete: has(answers.whatCreated),
    },
    {
      label: "Problem solved",
      value: text(answers.problemSolved),
      complete: has(answers.problemSolved),
    },
    {
      label: "Main parts / components",
      value: text(answers.mainParts),
      complete: has(answers.mainParts),
    },
    {
      label: "How the parts work together",
      value: text(answers.howItWorks),
      complete: has(answers.howItWorks),
    },
    {
      label: "Process / workflow (step-by-step)",
      value: has(answers.howItWorks)
        ? "Described within 'how it works' — consider adding a numbered step-by-step if not already."
        : "Consider describing the step-by-step process or workflow.",
      complete: has(answers.howItWorks),
    },
    {
      label: "Prototype status",
      value: answers.hasPrototype
        ? "A prototype or working demonstration exists"
        : "No prototype recorded yet",
      complete: true,
    },
    {
      label: "Supporting materials",
      value: materialsSummary(answers),
      complete: answers.assets.length > 0,
    },
    {
      label: "Public sharing status",
      value: profile.publicDisclosure
        ? "Possible public disclosure indicated"
        : "No public disclosure indicated",
      complete: true,
    },
    {
      label: "User-described differences from existing solutions",
      value: text(answers.whatDifferent),
      complete: has(answers.whatDifferent),
    },
  ];
}

export function buildDifferenceMap(record: ProjectRecord): DifferenceRow[] {
  const described = record.answers.whatDifferent?.trim() ?? "";
  const rows: DifferenceRow[] = [];
  if (described.length > 0) {
    rows.push({
      existing: "(Describe the current way people solve this)",
      difference: described,
      whyItMatters: "(Describe why this difference matters to you or your customer)",
    });
  }
  while (rows.length < 3) {
    rows.push({
      existing: "(Existing option or current approach)",
      difference: "(What your idea does differently)",
      whyItMatters: "(Why that difference matters)",
    });
  }
  return rows;
}

const MATERIAL_DEFS: { label: string; assets: AssetType[] }[] = [
  { label: "Sketches", assets: ["drawings"] },
  { label: "Diagrams", assets: ["diagrams"] },
  { label: "Flowcharts", assets: [] },
  { label: "Wireframes", assets: ["wireframes"] },
  { label: "Screenshots", assets: ["screenshots"] },
  { label: "Prototype photos", assets: ["photos"] },
  { label: "Code or technical notes", assets: ["code", "notes"] },
  { label: "Testing notes", assets: [] },
  { label: "Customer / pitch notes", assets: [] },
];

export function buildMaterialsChecklist(record: ProjectRecord): MaterialItem[] {
  const owned = new Set(record.answers.assets);
  return MATERIAL_DEFS.map((def) => ({
    label: def.label,
    available: def.assets.some((a) => owned.has(a)),
  }));
}

export function buildExpertHandoff(record: ProjectRecord): ExpertHandoff {
  const { answers, profile } = record;
  const fallback = (v: string, alt: string) =>
    v?.trim().length > 0 ? v.trim() : alt;

  return {
    ideaSummary: profile.ideaSummary,
    mainComponents: fallback(answers.mainParts, "Not yet described."),
    howItWorks: fallback(answers.howItWorks, "Not yet described."),
    differences: fallback(answers.whatDifferent, "Not yet described."),
    prototypeStatus: answers.hasPrototype
      ? "Prototype or working demonstration exists"
      : "No prototype yet",
    publicSharingTimeline: sharingTimeline(answers),
    materialsAvailable: materialsSummary(answers),
    expertQuestions: profile.expertQuestions,
  };
}

export function assertPacketContentSafe(): void {
  const plan = buildFollowUpPlan();
  const text = [
    ...plan.flatMap((step) => [step.title, ...step.actions]),
    PATENT_PREP_INTRO,
    DIFFERENCE_MAP_NOTE,
    TIMELINE_NOTE,
    ...DEVELOPMENT_TIMELINE_FIELDS,
    ...MATERIAL_DEFS.map((m) => m.label),
  ].join(" \n ");
  if (containsForbiddenLanguage(text)) {
    throw new Error("Patent prep content contains forbidden language");
  }
  assertPatentSearchPrepSafe();
}
