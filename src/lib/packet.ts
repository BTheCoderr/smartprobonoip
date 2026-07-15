import { ASSET_LABELS, SHARING_LABELS } from "./labels";
import { PACKET_COPY } from "./copy";
import { assertPatentSearchPrepSafe } from "./patentSearchPrep";
import { containsForbiddenLanguage } from "./safety";
import {
  extractProductNameFromAnswers,
  getIdeaLabel as resolveIdeaLabel,
  normalizeAnswersForPacket,
} from "./intakeValidation";
import { resolveBrandName } from "./brandName";
import { cleanText, preserveBrandInText } from "./textCleanup";
import type {
  AssetType,
  DevelopmentTimeline,
  DevelopmentTimelineField,
  IntakeAnswers,
  ProjectRecord,
} from "./types";

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
  idea: string;
  problem: string;
  howItWorks: string;
  mainComponents: string;
  differences: string;
  prototypeStatus: string;
  publicSharingTimeline: string;
  materialsAvailable: string;
  expertQuestions: string[];
}

export interface MissingInfoStatus {
  coreMissing: string[];
  optionalGaps: string[];
  statusMessage: string;
}

export interface ReadinessMetric {
  label: string;
  value: string;
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
  "Date first shown privately",
] as const satisfies readonly DevelopmentTimelineField[];

export function sanitizeTimelineValue(value: string): string {
  return value.trim().slice(0, 200);
}

export function countFilledTimelineFields(
  timeline?: DevelopmentTimeline,
): number {
  if (!timeline) return 0;
  return DEVELOPMENT_TIMELINE_FIELDS.filter((field) =>
    Boolean(timeline[field]?.trim()),
  ).length;
}

export function buildTimelineReadiness(timeline?: DevelopmentTimeline): string {
  const filled = countFilledTimelineFields(timeline);
  if (filled >= DEVELOPMENT_TIMELINE_FIELDS.length) return "Strong";
  if (filled >= 3) return "Medium";
  if (filled >= 1) return "Started";
  return "Needs dates";
}

export function getTimelineFieldValue(
  timeline: DevelopmentTimeline | undefined,
  field: DevelopmentTimelineField,
): string {
  return timeline?.[field]?.trim() ?? "";
}

export function getIdeaLabel(answers: IntakeAnswers): string {
  return resolveIdeaLabel(normalizeAnswersForPacket(answers));
}

export function buildIdeaSummaryFields(answers: IntakeAnswers): SummaryField[] {
  const normalized = normalizeAnswersForPacket(answers);
  const brand = resolveBrandName(normalized);
  const fields: SummaryField[] = [
    { label: "What you created", value: normalized.whatCreated },
    { label: "What problem it solves", value: normalized.problemSolved },
    { label: "Who it is for", value: normalized.whoFor },
    { label: "How it works", value: normalized.howItWorks },
  ];
  return fields
    .map((f) => ({
      label: f.label,
      value: preserveBrandInText(cleanText(f.value?.trim() ?? ""), brand),
    }))
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
  { label: "Drawings", assets: ["drawings"] },
  { label: "Diagrams", assets: ["diagrams"] },
  { label: "Wireframes", assets: ["wireframes"] },
  { label: "Screenshots", assets: ["screenshots"] },
  { label: "Photos", assets: ["photos"] },
  { label: "Recordings", assets: ["recordings"] },
  { label: "Written notes", assets: ["notes"] },
  { label: "Code", assets: ["code"] },
  { label: "Flowcharts", assets: [] },
  { label: "Testing notes", assets: [] },
  { label: "Customer / pitch notes", assets: [] },
];

export function buildMaterialsChecklist(record: ProjectRecord): MaterialItem[] {
  const owned = new Set(record.answers.assets);
  return MATERIAL_DEFS.map((def) => ({
    label: def.label,
    available:
      def.assets.length > 0 &&
      def.assets.every((asset) => owned.has(asset)),
  }));
}

export function buildExpertHandoff(record: ProjectRecord): ExpertHandoff {
  const { profile } = record;
  const answers = normalizeAnswersForPacket(record.answers);
  const brand =
    resolveBrandName(answers) ?? extractProductNameFromAnswers(answers);
  const clip = (value: string, max = 240) => {
    const text = preserveBrandInText(cleanText(value), brand);
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  };
  const fallback = (value: string, alt: string) =>
    value?.trim().length > 0 ? clip(value) : alt;

  return {
    idea: fallback(answers.whatCreated, "Not yet described."),
    problem: fallback(answers.problemSolved, "Not yet described."),
    howItWorks: fallback(answers.howItWorks, "Not yet described."),
    mainComponents: fallback(answers.mainParts, "Not yet described."),
    differences: fallback(answers.whatDifferent, "Not yet described."),
    prototypeStatus: answers.hasPrototype
      ? "Prototype exists"
      : "No prototype yet",
    publicSharingTimeline: sharingTimeline(answers),
    materialsAvailable: materialsSummary(answers),
    expertQuestions: profile.expertQuestions.slice(0, 6).map((q) => cleanText(q)),
  };
}

export function deriveOptionalGaps(
  record: ProjectRecord,
  savedReferenceCount = 0,
): string[] {
  const materials = buildMaterialsChecklist(record);
  const gaps: string[] = [];

  if (countFilledTimelineFields(record.developmentTimeline) < 3) {
    gaps.push("Development timeline");
  }

  const testing = materials.find((m) => m.label === "Testing notes");
  if (testing && !testing.available) gaps.push("Testing notes");

  const pitch = materials.find((m) => m.label === "Customer / pitch notes");
  if (pitch && !pitch.available) gaps.push("Customer feedback / pitch notes");

  const flowcharts = materials.find((m) => m.label === "Flowcharts");
  if (flowcharts && !flowcharts.available) gaps.push("Flowcharts");

  if (record.profile.publicDisclosure) {
    gaps.push("Public sharing details");
  }

  if (savedReferenceCount === 0) {
    gaps.push("Similar references saved");
  }

  return gaps;
}

export function buildMissingInfoStatus(
  record: ProjectRecord,
  savedReferenceCount = 0,
): MissingInfoStatus {
  const coreMissing = record.profile.missingInfo;
  const optionalGaps = deriveOptionalGaps(record, savedReferenceCount);

  let statusMessage: string;
  if (coreMissing.length > 0) {
    statusMessage = PACKET_COPY.coreNeedsAttention(coreMissing.length);
  } else if (optionalGaps.length > 0) {
    statusMessage = PACKET_COPY.coreCompleteOptionalGaps;
  } else {
    statusMessage = PACKET_COPY.coreComplete;
  }

  return { coreMissing, optionalGaps, statusMessage };
}

export function buildReadinessMetrics(
  record: ProjectRecord,
  savedReferenceCount = 0,
): ReadinessMetric[] {
  const { answers, profile, preClarity, postClarity } = record;
  const optionalGaps = deriveOptionalGaps(record, savedReferenceCount);
  const coreMissing = profile.missingInfo;
  const prep = buildPatentPrepChecklist(record);
  const materials = buildMaterialsChecklist(record);

  const clarityBefore = `${preClarity}/5 before`;
  const clarityAfter =
    postClarity && postClarity > 0 ? `${postClarity}/5 after` : "pending after";

  const prepComplete = prep.filter((row) => row.complete).length;
  const materialsAvailable = materials.filter((item) => item.available).length;
  const packetCompletion = Math.round(
    ((prepComplete / prep.length) * 0.65 +
      (materialsAvailable / materials.length) * 0.35) *
      100,
  );

  const missingInfoCount =
    coreMissing.length > 0
      ? `${coreMissing.length} core item${coreMissing.length === 1 ? "" : "s"}`
      : `${optionalGaps.length} optional gap${optionalGaps.length === 1 ? "" : "s"}`;

  let materialsReadiness = "Needs materials";
  if (materialsAvailable >= 5) materialsReadiness = "Strong";
  else if (materialsAvailable >= 2) materialsReadiness = "Medium";

  const handoffFields = [
    answers.whatCreated,
    answers.problemSolved,
    answers.howItWorks,
    answers.mainParts,
    answers.whatDifferent,
  ].filter((value) => value?.trim()).length;

  let expertHandoffReadiness = "Low";
  if (handoffFields >= 5) expertHandoffReadiness = "Strong";
  else if (handoffFields >= 3) expertHandoffReadiness = "Medium";

  let referralReadiness = "Low";
  if (answers.location?.trim() && answers.goals.length > 0) {
    referralReadiness = answers.wantsProBono
      ? "Strong (pro bono interest noted)"
      : "Medium";
  }

  return [
    { label: "Clarity Score", value: `${clarityBefore}, ${clarityAfter}` },
    { label: "Packet Completion Score", value: `${packetCompletion}%` },
    { label: "Missing Info Count", value: missingInfoCount },
    { label: "Timeline Readiness", value: buildTimelineReadiness(record.developmentTimeline) },
    { label: "Materials Readiness", value: materialsReadiness },
    {
      label: "Similar Reference Prep",
      value: savedReferenceCount > 0 ? "Started" : "Not started",
    },
    { label: "Expert Handoff Readiness", value: expertHandoffReadiness },
    { label: "Referral Readiness", value: referralReadiness },
  ];
}

export function buildNextBestAction(
  record: ProjectRecord,
  savedReferenceCount = 0,
): string {
  const { profile } = record;
  const optionalGaps = deriveOptionalGaps(record, savedReferenceCount);
  const coreMissing = profile.missingInfo;

  if (coreMissing.length >= 2) {
    return cleanText(
      "Consider filling in the core gaps listed above — especially how your idea works and what makes it different — so a professional may want to review a clearer description.",
    );
  }

  if (coreMissing.length === 1) {
    return cleanText(
      `Consider completing the remaining core item (${coreMissing[0].toLowerCase()}) before speaking with a patent professional or PTRC resource.`,
    );
  }

  const steps: string[] = [];
  if (optionalGaps.includes("Development timeline")) {
    steps.push("organize your development timeline");
  }
  if (
    optionalGaps.includes("Testing notes") ||
    optionalGaps.includes("Customer feedback / pitch notes")
  ) {
    steps.push("gather prototype and testing notes");
  }
  if (optionalGaps.includes("Similar references saved")) {
    steps.push(
      "review possible similar references using the suggested search queries",
    );
  }
  if (optionalGaps.includes("Flowcharts")) {
    steps.push("add flowcharts or diagrams if you have them");
  }
  if (optionalGaps.includes("Public sharing details")) {
    steps.push("note when and how you shared this publicly");
  }

  if (steps.length === 0) {
    return cleanText(
      "Consider bringing this packet and your materials to a patent resource, clinic, mentor, or innovation partner for review.",
    );
  }

  return cleanText(
    `Consider your next preparation step: ${steps.join(", ")}, before speaking with a patent professional or PTRC resource.`,
  );
}

/**
 * Discrete next preparation steps derived from the same signals as
 * buildNextBestAction, for rendering as a numbered list.
 * buildNextBestAction remains unchanged for ReadinessProfile.suggestedNextStep.
 */
export function buildNextBestSteps(
  record: ProjectRecord,
  savedReferenceCount = 0,
): string[] {
  const { profile } = record;
  const optionalGaps = deriveOptionalGaps(record, savedReferenceCount);
  const coreMissing = profile.missingInfo;

  if (coreMissing.length >= 2) {
    return [
      "Consider filling in the core gaps listed above — especially how your idea works and what makes it different.",
      "Once your description feels clear, a professional may want to review it with you.",
    ].map(cleanText);
  }

  if (coreMissing.length === 1) {
    return [
      `Consider completing the remaining core item (${coreMissing[0].toLowerCase()}).`,
      "Then consider speaking with a patent professional or PTRC resource.",
    ].map(cleanText);
  }

  const steps: string[] = [];
  if (optionalGaps.includes("Development timeline")) {
    steps.push("Organize your development timeline.");
  }
  if (
    optionalGaps.includes("Testing notes") ||
    optionalGaps.includes("Customer feedback / pitch notes")
  ) {
    steps.push("Gather prototype and testing notes.");
  }
  if (optionalGaps.includes("Similar references saved")) {
    steps.push(
      "Review possible similar references using the suggested search queries.",
    );
  }
  if (optionalGaps.includes("Flowcharts")) {
    steps.push("Add flowcharts or diagrams if you have them.");
  }
  if (optionalGaps.includes("Public sharing details")) {
    steps.push("Note when and how you shared this publicly.");
  }

  if (steps.length === 0) {
    return [
      "Consider bringing this packet and your materials to a patent resource, clinic, mentor, or innovation partner for review.",
    ].map(cleanText);
  }

  steps.push(
    "Then consider speaking with a patent professional or PTRC resource.",
  );
  return steps.map(cleanText);
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
    buildNextBestAction(
      {
        id: "safety-check",
        createdAt: new Date().toISOString(),
        answers: {
          whatCreated: "Sample product",
          problemSolved: "Sample problem",
          whoFor: "Sample users",
          howItWorks: "Sample process",
          mainParts: "Sample parts",
          whatDifferent: "Sample difference",
          itemType: "physical_product",
          hasPrototype: true,
          assets: ["drawings"],
          sharedChannels: ["none"],
          hasBrandIdentity: false,
          goals: ["expert_review"],
          location: "Sample City",
          wantsProBono: false,
          preClarity: 2,
        },
        profile: {
          ideaSummary: "Sample summary.",
          signals: ["expert_review"],
          completeInfo: [],
          missingInfo: [],
          publicDisclosure: false,
          publicDisclosureNote: "Sample note.",
          suggestedNextStep: "Sample step.",
          expertQuestions: ["Sample question?"],
          recommendedResources: ["education"],
          disclaimer: "Sample disclaimer.",
          generator: "rule",
        },
        preClarity: 2,
        postClarity: null,
        followUpStatus: { day30: "pending", day60: "pending", day90: "pending" },
      },
      0,
    ),
    "Core intake is complete. Optional prep areas remain.",
  ].join(" \n ");
  if (containsForbiddenLanguage(text)) {
    throw new Error("Patent prep content contains forbidden language");
  }
  assertPatentSearchPrepSafe();
}
