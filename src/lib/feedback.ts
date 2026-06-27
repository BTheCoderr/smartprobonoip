export type FeedbackLikert = "yes" | "no" | "not_sure";

export type SupportNeed =
  | "patent_invention_review"
  | "trademark_brand_review"
  | "copyright_creative_guidance"
  | "business_formation_contracts"
  | "nda_confidentiality"
  | "funding_accelerator"
  | "prototype_product_dev"
  | "similar_reference_research"
  | "ownership_agreement_review"
  | "not_sure";

export interface PilotFeedbackInput {
  clarityHelped: FeedbackLikert;
  wouldBringToExpert: FeedbackLikert;
  supportNeeded: SupportNeed[];
  confusionNote?: string;
  followUpRequested: boolean;
}

export interface PilotFeedbackRecord extends PilotFeedbackInput {
  id: string;
  projectId: string;
  pilotSessionId: string;
  partnerSlug: string | null;
  partnerName: string | null;
  source: string | null;
  campaign: string | null;
  createdAt: string;
}

export const SUPPORT_NEED_OPTIONS: { value: SupportNeed; label: string }[] = [
  { value: "patent_invention_review", label: "Patent or invention review" },
  { value: "trademark_brand_review", label: "Trademark or brand review" },
  {
    value: "copyright_creative_guidance",
    label: "Copyright or creative work guidance",
  },
  {
    value: "business_formation_contracts",
    label: "Business formation or contracts",
  },
  { value: "nda_confidentiality", label: "NDA or confidentiality help" },
  { value: "funding_accelerator", label: "Funding or accelerator support" },
  {
    value: "prototype_product_dev",
    label: "Prototype or product development support",
  },
  { value: "similar_reference_research", label: "Similar reference research" },
  {
    value: "ownership_agreement_review",
    label: "Ownership or agreement review",
  },
  { value: "not_sure", label: "Not sure yet" },
];

export const FEEDBACK_LIKERT_OPTIONS: { value: FeedbackLikert; label: string }[] =
  [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "not_sure", label: "Not sure" },
  ];

const SUPPORT_NEED_SET = new Set<string>(
  SUPPORT_NEED_OPTIONS.map((option) => option.value),
);

const LIKERT_SET = new Set<string>(["yes", "no", "not_sure"]);

export function isFeedbackLikert(value: string): value is FeedbackLikert {
  return LIKERT_SET.has(value);
}

export function parseSupportNeeds(values: unknown): SupportNeed[] {
  if (!Array.isArray(values)) return [];
  return values.filter(
    (value): value is SupportNeed =>
      typeof value === "string" && SUPPORT_NEED_SET.has(value),
  );
}

export function sanitizeConfusionNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 500);
}
