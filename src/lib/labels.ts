import type {
  AgreementStatus,
  AgreementType,
  AssetType,
  ContributorHelpType,
  ContributorInvolvement,
  Goal,
  IdeaInclude,
  InstitutionRelationship,
  ItemType,
  ResourceCategory,
  SharingChannel,
} from "./types";

export {
  SIGNAL_CATALOG,
  SIGNAL_DESCRIPTIONS,
  SIGNAL_KEYS,
  SIGNAL_LABELS,
} from "./signals";

export interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

export const ITEM_TYPE_OPTIONS: Option<ItemType>[] = [
  { value: "software", label: "Software / app" },
  { value: "physical_product", label: "Physical product / device" },
  { value: "brand", label: "Brand / name / logo" },
  { value: "creative_work", label: "Creative work (writing, art, music, video)" },
  { value: "process", label: "Process / method" },
  { value: "recipe", label: "Recipe / formula" },
  { value: "design", label: "Design / look & feel" },
  { value: "other", label: "Something else" },
];

export const ASSET_OPTIONS: Option<AssetType>[] = [
  { value: "drawings", label: "Drawings" },
  { value: "screenshots", label: "Screenshots" },
  { value: "wireframes", label: "Wireframes" },
  { value: "diagrams", label: "Diagrams" },
  { value: "photos", label: "Photos" },
  { value: "recordings", label: "Recordings" },
  { value: "notes", label: "Written notes" },
  { value: "code", label: "Code" },
];

export const SHARING_OPTIONS: Option<SharingChannel>[] = [
  { value: "none", label: "I have not shared it anywhere yet" },
  { value: "online", label: "Published online / website" },
  { value: "pitch", label: "In a pitch or presentation" },
  { value: "customers", label: "With customers" },
  { value: "investors", label: "With investors" },
  { value: "friends", label: "With friends or family" },
  { value: "social_media", label: "On social media" },
  { value: "event", label: "At a public event / trade show" },
];

export const GOAL_OPTIONS: Option<Goal>[] = [
  {
    value: "protection",
    label: "Get organized before talking about protection",
  },
  { value: "funding", label: "Funding" },
  { value: "licensing", label: "Licensing" },
  { value: "business_support", label: "Business support" },
  { value: "expert_review", label: "Expert review" },
];

export const IDEA_INCLUDE_OPTIONS: Option<IdeaInclude>[] = [
  { value: "brand_name", label: "A name, logo, or brand" },
  { value: "software_app", label: "Software or an app" },
  { value: "how_it_works", label: "How something works or is built" },
  {
    value: "creative_files",
    label: "Creative files (writing, art, photos, video, music)",
  },
  { value: "keep_private", label: "Something I want to keep private for now" },
  {
    value: "share_with_partners",
    label: "Something I may share with partners, manufacturers, or investors",
  },
  {
    value: "license_commercialize",
    label: "Something I may license or commercialize",
  },
  {
    value: "look_and_design",
    label: "How it looks (packaging, shape, UI, design)",
  },
  { value: "online_identity", label: "Online name or domain identity" },
];

export const CONTRIBUTOR_INVOLVEMENT_OPTIONS: Option<ContributorInvolvement>[] = [
  { value: "solo", label: "No, just me" },
  { value: "cofounder_team", label: "Yes, co-founder or team member" },
  { value: "freelancer_contractor", label: "Yes, freelancer or contractor" },
  { value: "employee_employer", label: "Yes, employee or employer-related" },
  { value: "school_grant", label: "Yes, school, university, or grant-related" },
  {
    value: "manufacturer_agency",
    label: "Yes, manufacturer, developer, designer, or agency",
  },
  { value: "not_sure", label: "Not sure" },
];

export const CONTRIBUTOR_HELP_OPTIONS: Option<ContributorHelpType>[] = [
  { value: "name_branding", label: "Name or branding" },
  { value: "logo_visual", label: "Logo or visual design" },
  { value: "product_design", label: "Product design" },
  { value: "software_code", label: "Software code" },
  { value: "prototype", label: "Prototype" },
  { value: "drawings_diagrams", label: "Drawings or diagrams" },
  { value: "written_content", label: "Written content" },
  { value: "manufacturing_engineering", label: "Manufacturing or engineering" },
  { value: "funding_planning", label: "Funding or business planning" },
  { value: "testing_feedback", label: "Testing or feedback" },
  { value: "other", label: "Other" },
];

export const AGREEMENT_STATUS_OPTIONS: Option<AgreementStatus>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
  { value: "not_applicable", label: "Not applicable" },
];

export const AGREEMENT_TYPE_OPTIONS: Option<AgreementType>[] = [
  { value: "nda", label: "NDA / confidentiality agreement" },
  { value: "contractor", label: "Contractor agreement" },
  { value: "work_for_hire", label: "Work-for-hire agreement" },
  { value: "founder", label: "Founder agreement" },
  { value: "assignment", label: "Assignment agreement" },
  { value: "employment", label: "Employment agreement" },
  { value: "school_university", label: "School / university agreement" },
  { value: "grant_funding", label: "Grant or funding agreement" },
  { value: "manufacturing_design", label: "Manufacturing or design agreement" },
  { value: "not_sure", label: "I am not sure" },
];

export const INSTITUTION_RELATIONSHIP_OPTIONS: Option<InstitutionRelationship>[] =
  [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
    { value: "not_sure", label: "Not sure" },
  ];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = Object.fromEntries(
  ITEM_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ItemType, string>;

export const ASSET_LABELS: Record<AssetType, string> = Object.fromEntries(
  ASSET_OPTIONS.map((o) => [o.value, o.label]),
) as Record<AssetType, string>;

export const SHARING_LABELS: Record<SharingChannel, string> = Object.fromEntries(
  SHARING_OPTIONS.map((o) => [o.value, o.label]),
) as Record<SharingChannel, string>;

export const GOAL_LABELS: Record<Goal, string> = Object.fromEntries(
  GOAL_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Goal, string>;

export const CONTRIBUTOR_INVOLVEMENT_LABELS: Record<
  ContributorInvolvement,
  string
> = Object.fromEntries(
  CONTRIBUTOR_INVOLVEMENT_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ContributorInvolvement, string>;

export const CONTRIBUTOR_HELP_LABELS: Record<ContributorHelpType, string> =
  Object.fromEntries(
    CONTRIBUTOR_HELP_OPTIONS.map((o) => [o.value, o.label]),
  ) as Record<ContributorHelpType, string>;

export const AGREEMENT_STATUS_LABELS: Record<AgreementStatus, string> =
  Object.fromEntries(
    AGREEMENT_STATUS_OPTIONS.map((o) => [o.value, o.label]),
  ) as Record<AgreementStatus, string>;

export const AGREEMENT_TYPE_LABELS: Record<AgreementType, string> =
  Object.fromEntries(
    AGREEMENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
  ) as Record<AgreementType, string>;

export const INSTITUTION_RELATIONSHIP_LABELS: Record<
  InstitutionRelationship,
  string
> = Object.fromEntries(
  INSTITUTION_RELATIONSHIP_OPTIONS.map((o) => [o.value, o.label]),
) as Record<InstitutionRelationship, string>;

export const RESOURCE_LABELS: Record<ResourceCategory, string> = {
  education: "Education & self-guided learning",
  ptrc: "Patent and Trademark Resource Center (PTRC)",
  patent_pro_bono: "Patent Pro Bono Program",
  law_school_clinic: "Law school IP clinic",
  patent_agent_attorney: "Patent agent / attorney",
  trademark_search: "Trademark search",
  copyright_registration: "Copyright registration",
  business_accelerator: "Business / accelerator support",
};

export const RESOURCE_DESCRIPTIONS: Record<ResourceCategory, string> = {
  education:
    "Free learning resources to understand IP basics before talking to an expert.",
  ptrc: "Local libraries that offer free guidance on patent and trademark research.",
  patent_pro_bono:
    "Programs that connect qualifying inventors with volunteer patent professionals.",
  law_school_clinic:
    "University clinics where supervised students may assist with IP matters.",
  patent_agent_attorney:
    "Licensed professionals who can advise on invention protection.",
  trademark_search:
    "Tools and services to check whether a brand name may already be in use.",
  copyright_registration:
    "Official registration process for creative works and code.",
  business_accelerator:
    "Programs offering mentorship, funding readiness, and business support.",
};
