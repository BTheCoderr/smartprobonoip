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
