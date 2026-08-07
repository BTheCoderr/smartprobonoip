import { ROUTES } from "@/lib/routes";
import type { PartnerRegistryEntry } from "./types";

/** Build a tracked external URL — never embeds invention text or PII. */
export function withUtm(
  baseUrl: string,
  ctx: { projectId?: string; utmCampaign?: string; utmSource?: string },
): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("utm_source", ctx.utmSource ?? "smartprobonoip");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", ctx.utmCampaign ?? "next_best_step");
    if (ctx.projectId) {
      url.searchParams.set("utm_content", ctx.projectId.slice(0, 36));
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/** Verified destinations checked for identity — not an endorsement of legal quality. */
export const PARTNER_REGISTRY: Record<string, PartnerRegistryEntry> = {
  uri_innovations: {
    id: "uri_innovations",
    name: "URI Innovations",
    orgType: "university_tech_transfer",
    serviceCategories: [
      "technology_transfer",
      "university_commercialization",
      "startup_support",
    ],
    geography: ["Rhode Island", "URI"],
    jurisdictions: ["Rhode Island", "United States"],
    audiences: ["uri_affiliated_inventors", "faculty", "students", "staff"],
    eligibilityNotes:
      "Primarily serves University of Rhode Island-affiliated inventors for disclosures and commercialization pathways.",
    websiteUrl: "https://uriinnovations.org/",
    acceptingStatus: "accepting",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    handoffMode: "external_link",
    description:
      "University of Rhode Island innovation and technology transfer office for research translation, licensing, and partnership conversations.",
    disclaimer:
      "URI Innovations provides university commercialization services — not legal advice from SmartProBonoIP. Verification confirms the destination identity only.",
    buildDestination: (ctx) =>
      withUtm("https://uriinnovations.org/", {
        ...ctx,
        utmCampaign: "uri_innovations",
      }),
  },
  ppl_ptrc: {
    id: "ppl_ptrc",
    name: "Providence Public Library PTRC",
    orgType: "library_ptrc",
    serviceCategories: ["patent_search_education", "trademark_search_education"],
    geography: ["Rhode Island", "Providence"],
    jurisdictions: ["Rhode Island", "United States"],
    audiences: ["inventors", "entrepreneurs", "general_public"],
    websiteUrl: "https://www.provlib.org/node/101",
    acceptingStatus: "accepting",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    handoffMode: "external_link",
    description:
      "Rhode Island Patent and Trademark Resource Center offering public IP search education and database orientation — not legal review.",
    disclaimer:
      "PTRC staff help with search tools and public resources. They do not provide legal advice, patentability opinions, or application drafting.",
    buildDestination: (ctx) =>
      withUtm("https://www.provlib.org/node/101", {
        ...ctx,
        utmCampaign: "ppl_ptrc",
      }),
  },
  uspto_ptrc_directory: {
    id: "uspto_ptrc_directory",
    name: "USPTO PTRC Directory",
    orgType: "federal_directory",
    serviceCategories: ["ptrc_directory", "patent_search_education"],
    geography: ["United States"],
    jurisdictions: ["United States"],
    audiences: ["inventors", "entrepreneurs", "general_public"],
    websiteUrl:
      "https://www.uspto.gov/learning-and-resources/patent-trademark-resource-centers",
    acceptingStatus: "accepting",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    handoffMode: "external_link",
    description:
      "Official USPTO directory of Patent and Trademark Resource Centers for public search education nationwide.",
    disclaimer:
      "PTRCs assist with search tools and public USPTO resources — not legal advice or filing recommendations.",
    buildDestination: (ctx) =>
      withUtm(
        "https://www.uspto.gov/learning-and-resources/patent-trademark-resource-centers",
        { ...ctx, utmCampaign: "uspto_ptrc" },
      ),
  },
  uspto_patent_pro_bono: {
    id: "uspto_patent_pro_bono",
    name: "USPTO Patent Pro Bono Directory",
    orgType: "federal_directory",
    serviceCategories: ["pro_bono_patent_assistance"],
    geography: ["United States"],
    jurisdictions: ["United States"],
    audiences: ["financially_under_resourced_inventors"],
    eligibilityNotes:
      "Regional programs set income, knowledge, and invention-readiness requirements. SmartProBonoIP does not determine eligibility.",
    websiteUrl:
      "https://www.uspto.gov/patents/basics/using-legal-services/pro-bono/patent-pro-bono-program",
    acceptingStatus: "eligibility_required",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    handoffMode: "external_link",
    description:
      "Official USPTO hub for regional Patent Pro Bono programs that may connect qualifying inventors with volunteer practitioners.",
    disclaimer:
      "Eligibility varies by region and program. This link does not mean you qualify — consider asking a partner about requirements that may apply.",
    buildDestination: (ctx) =>
      withUtm(
        "https://www.uspto.gov/patents/basics/using-legal-services/pro-bono/patent-pro-bono-program",
        { ...ctx, utmCampaign: "patent_pro_bono" },
      ),
  },
  internal_learn: {
    id: "internal_learn",
    name: "Learn",
    orgType: "internal_platform",
    serviceCategories: ["education"],
    geography: ["platform"],
    jurisdictions: ["platform"],
    audiences: ["inventors"],
    websiteUrl: ROUTES.learn,
    acceptingStatus: "accepting",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    handoffMode: "internal_page",
    description: "SmartProBonoIP educational topics about IP preparation.",
    disclaimer: "Educational content only — not legal advice.",
    buildDestination: () => ROUTES.learn,
  },
  internal_trust: {
    id: "internal_trust",
    name: "Trust Center",
    orgType: "internal_platform",
    serviceCategories: ["privacy", "security"],
    geography: ["platform"],
    jurisdictions: ["platform"],
    audiences: ["inventors"],
    websiteUrl: ROUTES.trust,
    acceptingStatus: "accepting",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    handoffMode: "internal_page",
    description: "Privacy, security, and data handling information.",
    disclaimer: "Platform policies — not legal advice.",
    buildDestination: () => ROUTES.trust,
  },
  internal_for_professionals: {
    id: "internal_for_professionals",
    name: "For Professionals",
    orgType: "internal_platform",
    serviceCategories: ["professional_handoff"],
    geography: ["platform"],
    jurisdictions: ["platform"],
    audiences: ["ip_professionals", "clinics"],
    websiteUrl: ROUTES.forProfessionals,
    acceptingStatus: "accepting",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    handoffMode: "internal_page",
    description: "How professionals and partner organizations may use exports.",
    disclaimer: "Preparation handoff only — not legal advice.",
    buildDestination: () => ROUTES.forProfessionals,
  },
  internal_research: {
    id: "internal_research",
    name: "Research workspace",
    orgType: "internal_platform",
    serviceCategories: ["similar_reference_prep"],
    geography: ["platform"],
    jurisdictions: ["platform"],
    audiences: ["inventors"],
    websiteUrl: "",
    acceptingStatus: "accepting",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    handoffMode: "internal_page",
    description: "Save and compare possible similar references before a professional conversation.",
    disclaimer: "Research notes only — not a legal opinion or clearance search.",
    buildDestination: (ctx) =>
      ctx.projectId ? ROUTES.profileResearch(ctx.projectId) : ROUTES.learn,
  },
  internal_export: {
    id: "internal_export",
    name: "Export packet",
    orgType: "internal_platform",
    serviceCategories: ["export"],
    geography: ["platform"],
    jurisdictions: ["platform"],
    audiences: ["inventors"],
    websiteUrl: "",
    acceptingStatus: "accepting",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    handoffMode: "internal_page",
    description: "Download or export your preparation packet for a professional conversation.",
    disclaimer: "Export is preparation material — not legal advice.",
    buildDestination: (ctx) =>
      ctx.projectId ? `${ROUTES.profile(ctx.projectId)}#export` : ROUTES.learn,
  },
  internal_recovery: {
    id: "internal_recovery",
    name: "Recovery link",
    orgType: "internal_platform",
    serviceCategories: ["account_recovery"],
    geography: ["platform"],
    jurisdictions: ["platform"],
    audiences: ["inventors"],
    websiteUrl: ROUTES.recover,
    acceptingStatus: "accepting",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    handoffMode: "internal_page",
    description: "Create a recovery link to return to this packet later.",
    disclaimer: "Pilot recovery feature — not legal advice.",
    buildDestination: () => ROUTES.recover,
  },
  // Documented but inactive — never surface as personalized recommendations.
  rihub: {
    id: "rihub",
    name: "RIHub",
    orgType: "internal_platform",
    serviceCategories: ["innovation_hub"],
    geography: ["Rhode Island"],
    jurisdictions: ["Rhode Island"],
    audiences: ["entrepreneurs"],
    websiteUrl: "https://rihub.org/",
    acceptingStatus: "paused",
    verificationStatus: "unverified",
    lastVerifiedAt: "2025-01-01",
    statusReason: "Partner documentation incomplete — paused pending review.",
    handoffMode: "external_link",
    description: "Rhode Island innovation hub — partner documentation incomplete.",
    disclaimer: "Not currently offered as an active routing destination.",
    buildDestination: () => "https://rihub.org/",
  },
  seg: {
    id: "seg",
    name: "SEG",
    orgType: "internal_platform",
    serviceCategories: ["mentorship"],
    geography: ["Rhode Island"],
    jurisdictions: ["Rhode Island"],
    audiences: ["entrepreneurs"],
    websiteUrl: "",
    acceptingStatus: "paused",
    verificationStatus: "unverified",
    lastVerifiedAt: "2025-01-01",
    statusReason: "Partner documentation incomplete — paused pending review.",
    handoffMode: "external_link",
    description: "SEG — partner documentation incomplete.",
    disclaimer: "Not currently offered as an active routing destination.",
    buildDestination: () => "#",
  },
  community_ip: {
    id: "community_ip",
    name: "CommunityIP",
    orgType: "internal_platform",
    serviceCategories: ["innovation_hub"],
    geography: ["Rhode Island"],
    jurisdictions: ["Rhode Island"],
    audiences: ["entrepreneurs"],
    websiteUrl: "",
    acceptingStatus: "not_accepting",
    verificationStatus: "unverified",
    lastVerifiedAt: "2025-01-01",
    statusReason: "Not accepting referrals — documentation incomplete.",
    handoffMode: "external_link",
    description: "CommunityIP — partner documentation incomplete.",
    disclaimer: "Not currently offered as an active routing destination.",
    buildDestination: () => "#",
  },
};

export function getPartner(id: string): PartnerRegistryEntry | undefined {
  return PARTNER_REGISTRY[id];
}

/** Only verified, accepting partners may appear in personalized recommendations. */
export function isPartnerPersonalizable(
  partner: Pick<PartnerRegistryEntry, "verificationStatus" | "acceptingStatus">,
): boolean {
  if (partner.verificationStatus === "unverified") return false;
  if (partner.verificationStatus === "stale") return false;
  if (partner.acceptingStatus === "not_accepting") return false;
  if (partner.acceptingStatus === "paused") return false;
  return true;
}

export type PartnerAvailability =
  | "active"
  | "check_availability"
  | "eligibility_required"
  | "unavailable";

export function getPartnerAvailability(
  partner: Pick<PartnerRegistryEntry, "verificationStatus" | "acceptingStatus">,
): PartnerAvailability {
  if (!isPartnerPersonalizable(partner)) return "unavailable";
  if (partner.acceptingStatus === "eligibility_required") {
    return "eligibility_required";
  }
  if (partner.acceptingStatus === "check_current_availability") {
    return "check_availability";
  }
  return "active";
}
