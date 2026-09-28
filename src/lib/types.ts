import type { InventionStatus } from "@/lib/ideas/types";

export type ItemType =
  | "software"
  | "physical_product"
  | "brand"
  | "creative_work"
  | "process"
  | "recipe"
  | "design"
  | "other";

export type AssetType =
  | "drawings"
  | "screenshots"
  | "wireframes"
  | "diagrams"
  | "photos"
  | "recordings"
  | "notes"
  | "code";

export type SharingChannel =
  | "none"
  | "online"
  | "pitch"
  | "customers"
  | "investors"
  | "friends"
  | "social_media"
  | "event";

export type Goal =
  | "protection"
  | "funding"
  | "licensing"
  | "business_support"
  | "expert_review";

export type IdeaInclude =
  | "brand_name"
  | "software_app"
  | "how_it_works"
  | "creative_files"
  | "keep_private"
  | "share_with_partners"
  | "license_commercialize"
  | "look_and_design"
  | "online_identity";

export type ContributorInvolvement =
  | "solo"
  | "cofounder_team"
  | "freelancer_contractor"
  | "employee_employer"
  | "school_grant"
  | "manufacturer_agency"
  | "not_sure";

export type ContributorHelpType =
  | "name_branding"
  | "logo_visual"
  | "product_design"
  | "software_code"
  | "prototype"
  | "drawings_diagrams"
  | "written_content"
  | "manufacturing_engineering"
  | "funding_planning"
  | "testing_feedback"
  | "other";

export type AgreementStatus =
  | "yes"
  | "no"
  | "not_sure"
  | "not_applicable";

export type AgreementType =
  | "nda"
  | "contractor"
  | "work_for_hire"
  | "founder"
  | "assignment"
  | "employment"
  | "school_university"
  | "grant_funding"
  | "manufacturing_design"
  | "not_sure";

export type InstitutionRelationship = "no" | "yes" | "not_sure";

export type SearchSource =
  | "google"
  | "google_patents"
  | "uspto"
  | "youtube"
  | "marketplaces"
  | "academic"
  | "app_stores"
  | "none";

export interface SearchReadiness {
  keyFeatures?: string;
  whatFeelsNew?: string;
  closestProducts?: string;
  customerSearchTerms?: string;
  technicalSearchTerms?: string;
  possibleIndustries?: string;
  materialsMechanismsSteps?: string;
  sourcesAlreadySearched?: SearchSource[];
  similarReferencesFound?: string;
}

export type NdaStatus = "yes" | "no" | "not_sure";

/** How generative AI tools related to inventorship prep (educational notes only). */
export type AiAssistance =
  | "none"
  | "assisted"
  | "generated_portions"
  | "not_sure";

export interface DisclosureEvent {
  id: string;
  kind?: "private" | "public" | "not_sure";
  approximateDate?: string;
  whereShown?: string;
  whoSawIt?: string;
  whatWasShown?: string;
  ndaOrConfidentiality?: NdaStatus;
  includedKeyFeatures?: "yes" | "no" | "not_sure";
}

export interface EducationCardContent {
  id: string;
  title: string;
  shortAnswer: string;
  detail?: string;
}

export interface IntakeAnswers {
  whatCreated: string;
  problemSolved: string;
  whoFor: string;
  howItWorks: string;
  mainParts: string;
  whatDifferent: string;
  itemType: ItemType;
  hasPrototype: boolean;
  assets: AssetType[];
  sharedChannels: SharingChannel[];
  hasBrandIdentity: boolean;
  ideaIncludes?: IdeaInclude[];
  goals: Goal[];
  location: string;
  wantsProBono: boolean;
  preClarity: number;
  contributorsInvolved?: ContributorInvolvement;
  contributorHelpTypes?: ContributorHelpType[];
  agreementStatus?: AgreementStatus;
  agreementTypes?: AgreementType[];
  institutionRelationship?: InstitutionRelationship;
  ownershipNotes?: string;
  brandName?: string;
  searchReadiness?: SearchReadiness;
  disclosureEvents?: DisclosureEvent[];
  /** Optional short title for professional IDF-style handoff */
  inventionTitle?: string;
  /** Preferred / best-described version of the invention */
  preferredEmbodiment?: string;
  /** Known alternatives, variations, or other ways it could work */
  alternativeVersions?: string;
  /** Similar products, patents, or publications the inventor already knows */
  knownSimilarWork?: string;
  /** Whether generative AI tools assisted development (prep notes only) */
  aiAssistance?: AiAssistance;
  aiAssistanceNotes?: string;
  /** Which protection path created this record (defaults to patent in Phase 1) */
  protectionPath?: "patent" | "trademark" | "copyright" | "trade_secret" | "unsure";
}

export type IpSignal =
  | "patent_invention"
  | "trademark_brand"
  | "copyright_creative"
  | "software_code"
  | "trade_secret"
  | "nda_confidentiality"
  | "public_disclosure"
  | "licensing_commercialization"
  | "business_formation"
  | "domain_digital_identity"
  | "design_appearance"
  | "prior_art_search"
  | "expert_review"
  | "ownership_collaborator";

export type ResourceCategory =
  | "education"
  | "ptrc"
  | "patent_pro_bono"
  | "law_school_clinic"
  | "patent_agent_attorney"
  | "trademark_search"
  | "copyright_registration"
  | "business_accelerator";

export type GeneratorKind = "rule" | "ai";

export type FollowUpState = "pending" | "done" | "skipped";

export interface FollowUpStatus {
  day30: FollowUpState;
  day60: FollowUpState;
  day90: FollowUpState;
}

export type DevelopmentTimelineField =
  | "Date idea started"
  | "Date first written down or sketched"
  | "Date first prototype built"
  | "Date first shared publicly"
  | "Date first pitched, sold, or demoed"
  | "Date of major improvements"
  | "Date first shown privately";

export type DevelopmentTimeline = Partial<
  Record<DevelopmentTimelineField, string>
>;

export type CanonicalReviewFlagType =
  | "missing_information"
  | "needs_user_clarification"
  | "professional_review_recommended"
  | "date_sensitive_professional_review"
  | "firm_question";

export interface CanonicalReviewFlag {
  id: string;
  triggerCode: string;
  flagType: CanonicalReviewFlagType;
  canonicalKey?: string | null;
  userMessage?: string | null;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
}

export interface CanonicalContributor {
  id: string;
  legalFirstName: string;
  legalMiddleName?: string | null;
  legalLastName: string;
  email?: string | null;
  phone?: string | null;
  employerAffiliation?: string | null;
  positionDepartment?: string | null;
  otherAffiliations?: string | null;
  contributionDescription?: string | null;
  contributionStartedOn?: string | null;
  contributionEndedOn?: string | null;
  userIdentifiedRole: "contributor" | "possible_inventor" | "unknown";
  residenceCity?: string | null;
  residenceRegion?: string | null;
  residenceCountry?: string | null;
  isPrimaryContact: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalDisclosureRecord {
  id: string;
  eventType:
    | "publication"
    | "website_post"
    | "oral_presentation"
    | "poster"
    | "demo"
    | "external_discussion"
    | "sale_offer"
    | "sale"
    | "external_use"
    | "investor_pitch"
    | "customer_pitch"
    | "other";
  eventDate?: string | null;
  datePrecision?: "exact" | "month" | "year" | "approximate" | "unknown" | null;
  anticipated: boolean;
  whatWasShared?: string | null;
  audienceDescription?: string | null;
  accessScope?: "named_people" | "limited_group" | "general_public" | "unknown" | null;
  confidentialityBasis?:
    | "written_nda"
    | "other_written_restriction"
    | "oral_confidentiality"
    | "none_known"
    | "unknown"
    | null;
  locationOrChannel?: string | null;
  referenceTitle?: string | null;
  submissionDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalEvidenceFile {
  id: string;
  originalFilename: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  evidenceType:
    | "drawing"
    | "photo"
    | "video"
    | "email"
    | "presentation"
    | "paper"
    | "notebook"
    | "agreement"
    | "prototype_record"
    | "search_result"
    | "other";
  documentDate?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalHandoffAnswer {
  id: string;
  questionId: string;
  sectionName?: string | null;
  questionText: string;
  requiredByProfessional: boolean;
  sourceCanonicalKeys: string[];
  answerValue: unknown;
  resolutionMethod:
    | "direct_map"
    | "composite_map"
    | "user_answered"
    | "professional_answered"
    | "unresolved";
  confidence: "exact" | "review_required" | "unresolved";
  userApprovedAt?: string | null;
}

export interface ProfessionalHandoffTemplateOption {
  id: string;
  templateName: string;
  organizationName?: string | null;
  isGeneric: boolean;
  questionCount: number;
}

export interface ProfessionalHandoffSession {
  id: string;
  templateId: string;
  templateName: string;
  organizationName?: string | null;
  status:
    | "draft"
    | "needs_user_input"
    | "ready_for_review"
    | "approved"
    | "exported"
    | "cancelled";
  unresolvedQuestionCount: number;
  mappedQuestionCount: number;
  sharedAt?: string | null;
  sharedReferralId?: string | null;
  answers: ProfessionalHandoffAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface ReadinessProfile {
  ideaSummary: string;
  signals: IpSignal[];
  completeInfo: string[];
  missingInfo: string[];
  publicDisclosure: boolean;
  publicDisclosureNote: string;
  suggestedNextStep: string;
  expertQuestions: string[];
  recommendedResources: ResourceCategory[];
  disclaimer: string;
  generator: GeneratorKind;
}

export interface ProjectRecord {
  id: string;
  createdAt: string;
  /** Last write to the invention. Absent on records created before the workspace. */
  updatedAt?: string;
  /** Stored invention title. Falls back to a label derived from answers when absent. */
  title?: string | null;
  /** Workspace lifecycle status. Absent records are treated as packet_generated. */
  status?: InventionStatus;
  archivedAt?: string | null;
  answers: IntakeAnswers;
  profile: ReadinessProfile;
  preClarity: number;
  postClarity: number | null;
  isDemo?: boolean;
  followUpStatus?: FollowUpStatus;
  partnerSlug?: string | null;
  partnerName?: string | null;
  source?: string | null;
  campaign?: string | null;
  developmentTimeline?: DevelopmentTimeline;
  /** Canonical factual-record flags. These are prep/review states, never legal conclusions. */
  canonicalReviewFlags?: CanonicalReviewFlag[];
}

export interface DashboardMetrics {
  totalIntakes: number;
  totalProfiles: number;
  signalCounts: Record<IpSignal, number>;
  publicDisclosureCount: number;
  referralCounts: Record<ResourceCategory, number>;
  avgPreClarity: number | null;
  avgPostClarity: number | null;
  clarityResponses: number;
  clarityImprovedCount: number;
  avgClarityDelta: number | null;
  followUp: {
    day30: number;
    day60: number;
    day90: number;
  };
}

export type ClarityFilter =
  | "all"
  | "improved"
  | "same"
  | "declined"
  | "no_response";
