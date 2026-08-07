/**
 * USPTO-linked education cards — DRAFT ONLY.
 *
 * INTERNAL: Do not import into Learn, packet, or intake until marked reviewed
 * in docs/LEGAL_COUNSEL_REVIEW_CHECKLIST.md.
 *
 * Rules: describe what a thing IS; never what the user SHOULD do;
 * link to primary sources; no hardcoded fee amounts or deadline math.
 */

export interface PendingEducationCard {
  id: string;
  title: string;
  shortAnswer: string;
  detail: string;
  primarySourceUrl: string;
  primarySourceLabel: string;
  safetyFooter: string;
  /** Flag for counsel review before shipping */
  requiresLegalReview: boolean;
  reviewNotes?: string;
}

export const EDUCATION_CARDS_PENDING_REVIEW: readonly PendingEducationCard[] = [
  {
    id: "uspto_fees",
    title: "USPTO fee schedules",
    shortAnswer:
      "The USPTO publishes an official fee schedule that varies by filing type and applicant entity size, including reduced small-entity and micro-entity rates where applicable.",
    detail:
      "Fee amounts change over time. A licensed professional can explain which fees may apply to your situation. SmartProBonoIP does not quote costs or predict total filing expenses.",
    primarySourceUrl: "https://www.uspto.gov/learning-and-resources/fees-and-payment/uspto-fee-schedule",
    primarySourceLabel: "USPTO fee schedule",
    safetyFooter: "Educational only. Not legal advice.",
    requiresLegalReview: false,
  },
  {
    id: "uspto_pendency",
    title: "Patent examination timelines",
    shortAnswer:
      "Patent examination typically takes place over an extended period. The USPTO publishes current pendency statistics that describe how long applications may wait at different stages.",
    detail:
      "Timelines vary by technology area, office workload, and application history. SmartProBonoIP does not estimate how long your matter may take.",
    primarySourceUrl: "https://www.uspto.gov/dashboards/patents/pendency.html",
    primarySourceLabel: "USPTO pendency dashboards",
    safetyFooter: "Educational only. Not legal advice.",
    requiresLegalReview: false,
  },
  {
    id: "provisional_vs_nonprovisional",
    title: "Provisional vs non-provisional applications",
    shortAnswer:
      "A provisional patent application is one filing type with specific formal requirements and a limited pendency period. A non-provisional application is the type that enters the examination process and can mature into an issued patent if requirements are met.",
    detail:
      "These are different filing pathways with different requirements and consequences. SmartProBonoIP does not recommend which pathway fits your situation and does not calculate filing deadlines.",
    primarySourceUrl: "https://www.uspto.gov/patents/basics/types-patent-applications",
    primarySourceLabel: "USPTO — types of patent applications",
    safetyFooter: "Educational only. Not legal advice.",
    requiresLegalReview: true,
    reviewNotes:
      "Highest care — must not read as filing advice or include deadline math.",
  },
  {
    id: "trademark_basics",
    title: "Trademarks vs patents",
    shortAnswer:
      "Trademarks generally concern names, logos, slogans, and brand identifiers used in commerce. They are handled through a separate USPTO process from patents, which often concern how something works or is made.",
    detail:
      "One product may involve both trademark and patent conversations with professionals. SmartProBonoIP Phase 1 focuses on patent readiness; trademark readiness is a separate future path.",
    primarySourceUrl: "https://www.uspto.gov/trademarks/basics",
    primarySourceLabel: "USPTO trademark basics",
    safetyFooter: "Educational only. Not legal advice.",
    requiresLegalReview: false,
  },
  {
    id: "office_actions_appeals",
    title: "Office actions and appeals",
    shortAnswer:
      "During patent examination, an examiner may issue an office action — a written communication about the application. Formal response processes and appeal routes exist within the USPTO system.",
    detail:
      "How to respond to a specific office action is a matter for a licensed patent practitioner reviewing your application. SmartProBonoIP does not draft responses or predict outcomes.",
    primarySourceUrl: "https://www.uspto.gov/patents/basics/apply/responding-office-actions",
    primarySourceLabel: "USPTO — responding to office actions",
    safetyFooter: "Educational only. Not legal advice.",
    requiresLegalReview: false,
  },
  {
    id: "ai_uspto_guidance",
    title: "AI tools and USPTO guidance",
    shortAnswer:
      "The USPTO has published guidance regarding the use of AI tools in preparing patent-related materials, including topics such as human contribution and disclosure obligations.",
    detail:
      "How that guidance applies to your facts is a question for a registered patent agent or attorney. SmartProBonoIP helps you organize notes about AI use; it does not determine inventorship or USPTO disclosure duties.",
    primarySourceUrl: "https://www.uspto.gov/artificial-intelligence",
    primarySourceLabel: "USPTO artificial intelligence resources",
    safetyFooter: "Educational only. Not legal advice.",
    requiresLegalReview: true,
    reviewNotes: "Flag for legal review before shipping.",
  },
] as const;
