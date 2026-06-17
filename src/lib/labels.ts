import type {
  AssetType,
  Goal,
  IpSignal,
  ItemType,
  ResourceCategory,
  SharingChannel,
} from "./types";

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
  { value: "protection", label: "Protection (patent, trademark, copyright)" },
  { value: "funding", label: "Funding" },
  { value: "licensing", label: "Licensing" },
  { value: "business_support", label: "Business support" },
  { value: "expert_review", label: "Expert review" },
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

export const SIGNAL_LABELS: Record<IpSignal, string> = {
  patent_invention: "Patent / invention",
  trademark_brand: "Trademark / brand",
  copyright_creative_software: "Copyright (creative work / software code)",
  trade_secret: "Trade secret / confidential know-how",
  nda_business_support: "NDA / business support",
  expert_review: "Expert review needed",
};

export const SIGNAL_DESCRIPTIONS: Record<IpSignal, string> = {
  patent_invention:
    "How your idea works, its parts, and what makes it different may be relevant to invention/patent topics.",
  trademark_brand:
    "Your name, logo, or slogan may be relevant to brand and trademark topics.",
  copyright_creative_software:
    "Creative works and software code may be relevant to copyright topics.",
  trade_secret:
    "Confidential know-how you have not shared may be relevant to trade-secret topics.",
  nda_business_support:
    "If you plan to share with others, an NDA or business support resource may be relevant.",
  expert_review:
    "Some answers suggest a professional may want to review the details with you.",
};

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
