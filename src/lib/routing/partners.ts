import {
  getPartner,
  getPartnerAvailability,
  isPartnerPersonalizable,
  PARTNER_REGISTRY,
  type PartnerAvailability,
} from "./registry";
import type { PartnerOrgType, PartnerRegistryEntry } from "./types";

/** External verified partners eligible for the public directory when active. */
export const PUBLIC_DIRECTORY_PARTNER_IDS = [
  "uri_innovations",
  "ppl_ptrc",
  "uspto_ptrc_directory",
  "uspto_patent_pro_bono",
] as const;

export type PublicDirectoryPartnerId =
  (typeof PUBLIC_DIRECTORY_PARTNER_IDS)[number];

/** Serializable partner shape for client directory UI — no destination builders. */
export type PublicPartnerView = Omit<PartnerRegistryEntry, "buildDestination">;

export interface PartnerDirectoryFilters {
  orgType?: PartnerOrgType;
  location?: string;
  serviceCategory?: string;
  audience?: string;
  availability?: PartnerAvailability;
  query?: string;
}

const ORG_TYPE_LABELS: Record<PartnerOrgType, string> = {
  university_tech_transfer: "University tech transfer",
  library_ptrc: "Library PTRC",
  federal_directory: "Federal directory",
  internal_platform: "Platform resource",
};

const AVAILABILITY_LABELS: Record<PartnerAvailability, string> = {
  active: "Accepting",
  check_availability: "Check availability",
  eligibility_required: "Eligibility required",
  unavailable: "Unavailable",
};

/** Approved “why this may help” copy — registry fields only, no endorsement. */
const WHY_MAY_HELP: Record<PublicDirectoryPartnerId, string> = {
  uri_innovations:
    "May help URI-affiliated inventors, researchers, students, and university innovators explore disclosure and commercialization pathways — confirm eligibility with the office.",
  ppl_ptrc:
    "May help Rhode Island inventors and entrepreneurs learn patent and trademark search tools at a public library resource center.",
  uspto_ptrc_directory:
    "May help you locate a Patent and Trademark Resource Center for public search education and database orientation.",
  uspto_patent_pro_bono:
    "May help if you may qualify for regional pro bono patent assistance — each program sets its own income and readiness requirements.",
};

function isPublicDirectoryId(id: string): id is PublicDirectoryPartnerId {
  return (PUBLIC_DIRECTORY_PARTNER_IDS as readonly string[]).includes(id);
}

/** Public directory uses the same status logic as personalized routing, plus external-only scope. */
export function isPartnerPublicDirectoryEligible(
  partner: PartnerRegistryEntry,
): boolean {
  if (partner.orgType === "internal_platform") return false;
  if (!isPublicDirectoryId(partner.id)) return false;
  return isPartnerPersonalizable(partner);
}

export function getPublicDirectoryPartners(): PartnerRegistryEntry[] {
  return PUBLIC_DIRECTORY_PARTNER_IDS.map((id) => PARTNER_REGISTRY[id])
    .filter(Boolean)
    .filter(isPartnerPublicDirectoryEligible)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Alias for directory consumers. */
export const getPublicPartners = getPublicDirectoryPartners;

export function getPublicPartnerById(
  id: string,
): PartnerRegistryEntry | undefined {
  const partner = getPartner(id);
  if (!partner || !isPartnerPublicDirectoryEligible(partner)) return undefined;
  return partner;
}

export function toPublicPartnerView(
  partner: PartnerRegistryEntry,
): PublicPartnerView {
  const { buildDestination, ...view } = partner;
  void buildDestination;
  return view;
}

export function getPublicPartnerViews(): PublicPartnerView[] {
  return getPublicDirectoryPartners().map(toPublicPartnerView);
}

export function formatPartnerOrgType(orgType: PartnerOrgType): string {
  return ORG_TYPE_LABELS[orgType] ?? orgType.replace(/_/g, " ");
}

export function formatPartnerAvailability(
  availability: PartnerAvailability,
): string {
  return AVAILABILITY_LABELS[availability] ?? availability;
}

export function formatServiceCategory(category: string): string {
  return category.replace(/_/g, " ");
}

export function formatAudience(audience: string): string {
  return audience.replace(/_/g, " ");
}

export function getPartnerWhyMayHelp(partner: PublicPartnerView): string {
  if (isPublicDirectoryId(partner.id)) {
    return WHY_MAY_HELP[partner.id];
  }
  return partner.description;
}

export function formatLastVerified(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Plain-text search on safe registry fields only — never logs the query. */
export function searchPartners(
  partners: PublicPartnerView[],
  query: string,
): PublicPartnerView[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...partners];

  return partners.filter((partner) => {
    const haystack = [
      partner.name,
      partner.description,
      formatPartnerOrgType(partner.orgType),
      ...partner.geography,
      ...partner.jurisdictions,
      ...partner.serviceCategories.map(formatServiceCategory),
      ...partner.audiences.map(formatAudience),
      partner.eligibilityNotes ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return normalized.split(/\s+/).every((token) => haystack.includes(token));
  });
}

export function filterPartners(
  partners: PublicPartnerView[],
  filters: PartnerDirectoryFilters,
): PublicPartnerView[] {
  let result = [...partners];

  if (filters.query?.trim()) {
    result = searchPartners(result, filters.query);
  }
  if (filters.orgType) {
    result = result.filter((partner) => partner.orgType === filters.orgType);
  }
  if (filters.location?.trim()) {
    const needle = filters.location.trim().toLowerCase();
    result = result.filter((partner) =>
      partner.geography.some((place) => place.toLowerCase().includes(needle)),
    );
  }
  if (filters.serviceCategory) {
    result = result.filter((partner) =>
      partner.serviceCategories.includes(filters.serviceCategory!),
    );
  }
  if (filters.audience) {
    result = result.filter((partner) =>
      partner.audiences.includes(filters.audience!),
    );
  }
  if (filters.availability) {
    result = result.filter(
      (partner) => getPartnerAvailability(partner) === filters.availability,
    );
  }

  return result.sort((a, b) => a.id.localeCompare(b.id));
}

export function getDirectoryFilterOptions(
  partners: PublicPartnerView[],
): {
  orgTypes: PartnerOrgType[];
  locations: string[];
  serviceCategories: string[];
  audiences: string[];
  availabilities: PartnerAvailability[];
} {
  const orgTypes = new Set<PartnerOrgType>();
  const locations = new Set<string>();
  const serviceCategories = new Set<string>();
  const audiences = new Set<string>();
  const availabilities = new Set<PartnerAvailability>();

  for (const partner of partners) {
    orgTypes.add(partner.orgType);
    for (const place of partner.geography) locations.add(place);
    for (const category of partner.serviceCategories) {
      serviceCategories.add(category);
    }
    for (const audience of partner.audiences) audiences.add(audience);
    availabilities.add(getPartnerAvailability(partner));
  }

  return {
    orgTypes: [...orgTypes].sort(),
    locations: [...locations].sort(),
    serviceCategories: [...serviceCategories].sort(),
    audiences: [...audiences].sort(),
    availabilities: [...availabilities].sort(),
  };
}

export function assertPartnerDirectoryCopySafe(text: string): boolean {
  const lower = text.toLowerCase();
  const forbidden = [
    "guarantee",
    "endorse",
    "referral",
    "we recommend",
    "legal advice from smartprobonoip",
  ];
  return !forbidden.some((phrase) => lower.includes(phrase));
}
