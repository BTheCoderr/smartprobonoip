import { generateProfile } from "./generateProfile";
import type { IntakeAnswers, ProjectRecord } from "./types";

const DEMO_MODE_KEY = "smartprobonoip:demo-mode";

export const DEMO_INVENTION: IntakeAnswers = {
  whatCreated:
    "HydroSeal — a portable water-filtration bottle for hikers that filters water as you drink through a replaceable carbon-and-ceramic cartridge.",
  problemSolved:
    "Backcountry hikers often run out of clean water or carry heavy purification gear. HydroSeal lets them refill from streams safely without extra equipment.",
  whoFor:
    "Outdoor enthusiasts, hikers, and campers who want lightweight gear on multi-day trips.",
  howItWorks:
    "Water enters through the mouthpiece, passes through a dual-layer filter (activated carbon + ceramic mesh), and flows out clean. The cartridge twists out for replacement after ~40 uses.",
  mainParts:
    "BPA-free bottle body, twist-lock filter cartridge, one-way intake valve, silicone mouthpiece cap, and volume markers on the side.",
  whatDifferent:
    "Unlike pump filters or UV pens, it filters inline while drinking — no stopping, no batteries, and the cartridge is compostable.",
  itemType: "physical_product",
  hasPrototype: true,
  assets: ["drawings", "photos", "diagrams", "notes"],
  sharedChannels: ["pitch", "social_media"],
  hasBrandIdentity: true,
  goals: ["protection", "expert_review"],
  location: "Denver, Colorado, USA",
  wantsProBono: true,
  preClarity: 2,
  contributorsInvolved: "solo",
  agreementStatus: "not_applicable",
  institutionRelationship: "no",
  brandName: "HydroSeal",
  inventionTitle: "HydroSeal portable inline filter bottle",
  preferredEmbodiment:
    "Hiking bottle with twist-lock compostable dual-layer cartridge and silicone mouthpiece for inline sipping.",
  alternativeVersions:
    "Earlier screw-cap prototype; possible press-style cartridge variant for basecamp use.",
  knownSimilarWork:
    "LifeStraw bottles, Grayl press bottles, Sawyer squeeze filters — none with twist-lock compostable inline sipping cartridge.",
  aiAssistance: "assisted",
  aiAssistanceNotes:
    "Used a generative writing tool to draft early marketing copy; filter mechanism, seal design, and prototype were human-designed and built.",
  protectionPath: "patent",
  searchReadiness: {
    keyFeatures:
      "Inline dual-layer filtration while drinking, twist-lock replaceable cartridge, compostable cartridge material, no pumps or batteries.",
    whatFeelsNew:
      "Filtering happens as you sip through the mouthpiece instead of stopping to pump or treat the water first.",
    closestProducts:
      "LifeStraw bottles, Grayl press bottles, Sawyer squeeze filters",
    customerSearchTerms:
      "water bottle that filters while you drink, hiking water filter bottle, replaceable cartridge filter bottle",
    technicalSearchTerms:
      "inline carbon ceramic filter cartridge, twist lock filter housing, one-way intake valve bottle",
    possibleIndustries:
      "outdoor gear, camping equipment, travel accessories, emergency preparedness",
    materialsMechanismsSteps:
      "Water enters through a one-way intake valve, passes through activated carbon then ceramic mesh, and exits the silicone mouthpiece; the cartridge twists out after about 40 uses.",
    sourcesAlreadySearched: ["google", "google_patents", "marketplaces"],
    similarReferencesFound:
      "Found several straw-style filters and press bottles; none used a twist-lock compostable cartridge with inline sipping.",
  },
  disclosureEvents: [
    {
      id: "hydroseal-event-1",
      kind: "private",
      approximateDate: "around January 2026",
      whereShown: "A gear-tester meetup in Denver",
      whoSawIt: "Three hiking friends who signed a simple confidentiality note",
      whatWasShown: "The working prototype and the cartridge swap process",
      ndaOrConfidentiality: "yes",
      includedKeyFeatures: "yes",
    },
    {
      id: "hydroseal-event-2",
      kind: "public",
      approximateDate: "March 2026",
      whereShown: "An outdoor startup pitch night and a social media post",
      whoSawIt: "Public audience — attendees and followers",
      whatWasShown:
        "A short demo of drinking through the bottle; the internal filter layers were not shown",
      ndaOrConfidentiality: "no",
      includedKeyFeatures: "not_sure",
    },
  ],
};

export const DEMO_PROFILE_ID = "demo-hydroseal-profile";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function makeRecord(
  id: string,
  answers: Partial<IntakeAnswers> & Pick<IntakeAnswers, "whatCreated" | "itemType">,
  days: number,
  pre: number,
  post: number,
  followUp: ProjectRecord["followUpStatus"],
  tracking?: Pick<
    ProjectRecord,
    "partnerSlug" | "partnerName" | "source" | "campaign"
  >,
): ProjectRecord {
  const full: IntakeAnswers = {
    ...DEMO_INVENTION,
    // HydroSeal-specific extras should not leak into other demo inventions.
    brandName: undefined,
    searchReadiness: undefined,
    disclosureEvents: undefined,
    ...answers,
    preClarity: pre,
  };
  const profile = generateProfile(full);
  return {
    id,
    createdAt: daysAgo(days),
    answers: full,
    profile,
    preClarity: pre,
    postClarity: post,
    isDemo: true,
    followUpStatus: followUp,
    partnerSlug: tracking?.partnerSlug ?? null,
    partnerName: tracking?.partnerName ?? null,
    source: tracking?.source ?? null,
    campaign: tracking?.campaign ?? null,
  };
}

export const DEMO_RECORDS: ProjectRecord[] = [
  makeRecord(
    DEMO_PROFILE_ID,
    DEMO_INVENTION,
    1,
    2,
    4,
    { day30: "pending", day60: "pending", day90: "pending" },
    {
      partnerSlug: "smartprobonoip-ri-pilot",
      partnerName: "SmartProBonoIP Rhode Island Pilot",
      source: "demo",
      campaign: "pilot-2026",
    },
  ),
  makeRecord(
    "demo-002",
    {
      whatCreated: "StudyBuddy AI — a flashcard app for nursing students",
      itemType: "software",
      sharedChannels: ["none"],
      hasBrandIdentity: false,
      goals: ["funding", "business_support"],
      wantsProBono: false,
      assets: ["code", "screenshots"],
      contributorsInvolved: "freelancer_contractor",
      contributorHelpTypes: ["software_code", "logo_visual"],
      agreementStatus: "not_sure",
      agreementTypes: ["contractor", "not_sure"],
      institutionRelationship: "no",
    },
    3,
    3,
    4,
    { day30: "pending", day60: "pending", day90: "pending" },
    {
      partnerSlug: "rihub",
      partnerName: "RIHub",
      source: "qr",
      campaign: "pilot-2026",
    },
  ),
  makeRecord(
    "demo-003",
    {
      whatCreated: "Bloom & Root — organic skincare line with custom botanical blends",
      itemType: "brand",
      hasBrandIdentity: true,
      sharedChannels: ["online", "customers"],
      goals: ["protection", "licensing"],
      wantsProBono: false,
      assets: ["photos", "notes"],
    },
    5,
    2,
    3,
    { day30: "done", day60: "pending", day90: "pending" },
    {
      partnerSlug: "communityip",
      partnerName: "Community IP",
      source: "demo",
    },
  ),
  makeRecord(
    "demo-004",
    {
      whatCreated: "QuietCrate — sound-dampening panels made from recycled denim",
      itemType: "physical_product",
      sharedChannels: ["investors", "pitch"],
      goals: ["funding", "expert_review"],
      wantsProBono: true,
      hasPrototype: true,
      assets: ["diagrams", "photos"],
    },
    7,
    1,
    3,
    { day30: "done", day60: "pending", day90: "pending" },
  ),
  makeRecord(
    "demo-005",
    {
      whatCreated: "Recipe for low-sugar fermented hot sauce using local peppers",
      itemType: "recipe",
      sharedChannels: ["friends"],
      goals: ["business_support"],
      wantsProBono: false,
      hasBrandIdentity: true,
      assets: ["notes", "photos"],
    },
    10,
    4,
    4,
    { day30: "done", day60: "done", day90: "pending" },
  ),
  makeRecord(
    "demo-006",
    {
      whatCreated: "Confidential manufacturing process for biodegradable packaging film",
      itemType: "process",
      sharedChannels: ["none"],
      goals: ["protection", "licensing"],
      wantsProBono: false,
      hasPrototype: true,
      assets: ["diagrams", "notes"],
    },
    12,
    2,
    4,
    { day30: "skipped", day60: "pending", day90: "pending" },
  ),
  makeRecord(
    "demo-007",
    {
      whatCreated: "Original illustrated children's book about climate resilience",
      itemType: "creative_work",
      sharedChannels: ["social_media"],
      goals: ["protection", "funding"],
      wantsProBono: true,
      assets: ["drawings", "notes"],
    },
    14,
    3,
    5,
    { day30: "done", day60: "done", day90: "pending" },
  ),
  makeRecord(
    "demo-008",
    {
      whatCreated: "Modular desk organizer with magnetic attachment system",
      itemType: "design",
      sharedChannels: ["event", "customers"],
      goals: ["expert_review", "business_support"],
      wantsProBono: false,
      hasPrototype: false,
      assets: ["wireframes", "diagrams"],
    },
    18,
    2,
    2,
    { day30: "done", day60: "skipped", day90: "pending" },
  ),
  makeRecord(
    "demo-009",
    {
      whatCreated: "NeighborhoodFix — app connecting homeowners with vetted repair mentors",
      itemType: "software",
      sharedChannels: ["pitch", "investors"],
      goals: ["funding", "expert_review"],
      wantsProBono: true,
      assets: ["code", "wireframes", "screenshots"],
    },
    21,
    1,
    4,
    { day30: "done", day60: "done", day90: "done" },
  ),
  makeRecord(
    "demo-010",
    {
      whatCreated: "LumenTag — RFID inventory tags for small libraries",
      itemType: "physical_product",
      sharedChannels: ["none"],
      goals: ["protection"],
      wantsProBono: true,
      hasPrototype: true,
      assets: ["diagrams", "code", "notes"],
    },
    25,
    2,
    3,
    { day30: "pending", day60: "pending", day90: "pending" },
  ),
];

export function setDemoMode(active = true): void {
  if (typeof window === "undefined") return;
  if (active) {
    sessionStorage.setItem(DEMO_MODE_KEY, "true");
  } else {
    sessionStorage.removeItem(DEMO_MODE_KEY);
  }
}

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(DEMO_MODE_KEY) === "true";
}

export function activateDemoFromQuery(search: string): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(search);
  if (params.get("demo") === "1") {
    setDemoMode(true);
    return true;
  }
  return isDemoMode();
}

export function getDemoRecords(): ProjectRecord[] {
  return DEMO_RECORDS;
}

export function mergeWithDemoRecords(
  realRecords: ProjectRecord[],
  includeDemo: boolean,
): ProjectRecord[] {
  const live = realRecords.filter((r) => !r.isDemo);
  if (!includeDemo) return live;
  return [...getDemoRecords(), ...live];
}
