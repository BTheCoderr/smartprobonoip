import type { ReadinessEvaluation } from "@/lib/readiness/types";
import type { SupportNeed } from "@/lib/feedback";
import type { ProjectRecord } from "@/lib/types";

/** Nine routing categories — no others may surface in primary UI. */
export const RECOMMENDATION_CATEGORIES = [
  "continue_preparing",
  "review_public_disclosure",
  "similar_reference_prep",
  "visit_ptrc",
  "speak_patent_professional",
  "explore_university_nonprofit",
  "review_education",
  "save_export_packet",
  "urgent_timing_deadline",
] as const;

export type RecommendationCategory = (typeof RECOMMENDATION_CATEGORIES)[number];

/** Lower number = higher routing priority band (1 = urgent timing / disclosure). */
export type RecommendationPriority = 1 | 2 | 3 | 4 | 5 | 6;

export type RecommendationReason =
  | "core_fields_missing"
  | "timeline_incomplete"
  | "materials_missing"
  | "public_disclosure_unclear"
  | "public_disclosure_past_no_date"
  | "similar_references_missing"
  | "professional_review_ready"
  | "local_ptrc_match"
  | "university_affiliation"
  | "pro_bono_interest"
  | "education_helpful"
  | "export_helpful"
  | "urgent_deadline"
  | "planned_public_disclosure"
  | "office_action_response"
  | "generic_fallback";

export type PartnerOrgType =
  | "university_tech_transfer"
  | "library_ptrc"
  | "federal_directory"
  | "internal_platform";

export type PartnerAcceptingStatus =
  | "accepting"
  | "check_current_availability"
  | "eligibility_required"
  | "not_accepting"
  | "paused";

export type PartnerVerificationStatus = "verified" | "unverified" | "stale";

export type PartnerHandoffMode = "external_link" | "internal_page";

export interface PartnerRegistryEntry {
  id: string;
  name: string;
  orgType: PartnerOrgType;
  serviceCategories: string[];
  geography: string[];
  /** Jurisdiction labels shown on handoff — defaults to geography when omitted. */
  jurisdictions: string[];
  audiences: string[];
  eligibilityNotes?: string;
  websiteUrl: string;
  acceptingStatus: PartnerAcceptingStatus;
  verificationStatus: PartnerVerificationStatus;
  /** ISO date when partner metadata was last verified. */
  lastVerifiedAt: string;
  verifiedBy?: string;
  statusReason?: string;
  handoffMode: PartnerHandoffMode;
  description: string;
  disclaimer: string;
  /** UTM-ready destination builder — never embeds invention text. */
  buildDestination: (ctx: {
    projectId?: string;
    utmCampaign?: string;
    utmSource?: string;
  }) => string;
}

export interface RecommendationAction {
  kind:
    | "internal_link"
    | "external_link"
    | "profile_anchor"
    | "intake_step"
    | "research"
    | "in_page";
  href?: string;
  label: string;
}

export interface RoutingRecommendation {
  id: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  body: string;
  /** Short user-facing explanation derived from approved routing signals only. */
  whyRecommended: string;
  reasons: RecommendationReason[];
  action: RecommendationAction;
  partnerId?: string;
  isUrgent: boolean;
}

/** Partial recommendation before whyRecommended/isUrgent finalization in plan.ts. */
export type BuiltRoutingRecommendation = Omit<
  RoutingRecommendation,
  "isUrgent" | "whyRecommended"
> & {
  isUrgent?: boolean;
  whyRecommended?: string;
};

export interface RoutingContext {
  projectId: string;
  record: ProjectRecord;
  savedReferenceCount: number;
  readiness: ReadinessEvaluation;
  supportNeeded: SupportNeed[];
  coreMissingCount: number;
  hasMajorCoreGaps: boolean;
  hasUriAffiliation: boolean;
  isRhodeIsland: boolean;
  hasConcreteUrgentDeadline: boolean;
  hasPlannedPublicDisclosure: boolean;
  hasOfficeActionResponseNeed: boolean;
  hasPastDisclosureWithoutReliableDate: boolean;
  isReadyForProfessionalConversation: boolean;
  timelineFilledCount: number;
  materialsCount: number;
}

export interface RoutingRule {
  id: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  /** Maintenance metadata for config review — not shown in primary UI. */
  lastVerifiedAt?: string;
  verifiedBy?: string;
  statusReason?: string;
  jurisdictions?: string[];
  eligibilityNotes?: string;
  handoffMode?: PartnerHandoffMode;
  when: (ctx: RoutingContext) => boolean;
  build: (ctx: RoutingContext) => BuiltRoutingRecommendation | null | undefined;
}

export interface NextBestStepPlan {
  primary: RoutingRecommendation[];
  secondary: RoutingRecommendation[];
  /** Stable plan fingerprint for surface-consistency tests. */
  fingerprint: string;
}
