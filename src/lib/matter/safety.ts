export type MatterOutputClass =
  | "factual_organization"
  | "general_education"
  | "readiness_finding"
  | "professional_review_flag";

export const MATTER_SAFETY_BOUNDARY = {
  purpose:
    "SmartProBono helps people understand a process, organize their information, identify missing or inconsistent facts, and prepare for professional review.",
  allowed: [
    "Organize user-supplied facts, people, dates, documents, and evidence.",
    "Explain general legal-process concepts without applying them as a definitive conclusion to the user's matter.",
    "Identify missing information and factual inconsistencies.",
    "Flag facts or questions that should be reviewed by a qualified professional.",
    "Generate summaries, checklists, and draft language clearly labeled for review.",
  ],
  prohibited: [
    "Determine patentability, registrability, inventorship, ownership, liability, eligibility, or the likely legal outcome of a user's matter.",
    "State a definitive filing strategy or personalized legal recommendation.",
    "Calculate or promise a legal deadline as definitive advice without a verified authoritative rule and professional review where appropriate.",
    "Present AI output as attorney work product, legal representation, or a substitute for professional judgment.",
  ],
} as const;

export const MATTER_OUTPUT_LABELS: Record<MatterOutputClass, string> = {
  factual_organization: "Organized facts",
  general_education: "General information",
  readiness_finding: "Readiness finding",
  professional_review_flag: "Professional review required",
};

export function professionalReviewMessage(subject: string) {
  return `${subject} may affect legal rights or strategy. SmartProBono records the information but does not decide its legal effect. Include it in your professional review packet.`;
}
