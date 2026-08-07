import { getPartner, isPartnerPersonalizable } from "./registry";
import { formatWhyRecommended } from "./reasons";
import type { PartnerRegistryEntry, RoutingRecommendation } from "./types";

export const HANDOFF_SHARED_INFO_COPY =
  "SmartProBonoIP does not automatically send your invention details, intake answers, or contact information to external partners. You leave this site under your control — share only what you choose on the partner's site or in conversation.";

export interface HandoffContent {
  partnerName: string;
  whyRecommended: string;
  helpsWith: string[];
  doesNotDo: string;
  eligibilityNotes: string | null;
  jurisdictions: string[];
  destinationUrl: string;
  handoffMode: PartnerRegistryEntry["handoffMode"];
  partnerStatus: "active" | "check_availability" | "unavailable";
  statusReason: string | null;
}

function helpsWithFromPartner(partner: PartnerRegistryEntry): string[] {
  const fromCategories = partner.serviceCategories.map((category) =>
    category.replace(/_/g, " "),
  );
  if (fromCategories.length > 0) return fromCategories.slice(0, 4);
  return [partner.description];
}

function partnerAvailability(
  partner: PartnerRegistryEntry,
): HandoffContent["partnerStatus"] {
  if (!isPartnerPersonalizable(partner)) return "unavailable";
  if (
    partner.acceptingStatus === "check_current_availability" ||
    partner.acceptingStatus === "eligibility_required"
  ) {
    return "check_availability";
  }
  return "active";
}

export function buildHandoffContent(
  rec: RoutingRecommendation,
  projectId: string,
): HandoffContent | null {
  if (!rec.partnerId) return null;
  const partner = getPartner(rec.partnerId);
  if (!partner) return null;

  const destinationUrl = partner.buildDestination({
    projectId,
    utmCampaign: rec.id,
  });

  return {
    partnerName: partner.name,
    whyRecommended: formatWhyRecommended(rec.reasons),
    helpsWith: helpsWithFromPartner(partner),
    doesNotDo: partner.disclaimer,
    eligibilityNotes: partner.eligibilityNotes ?? null,
    jurisdictions: partner.jurisdictions.length
      ? partner.jurisdictions
      : partner.geography,
    destinationUrl,
    handoffMode: partner.handoffMode,
    partnerStatus: partnerAvailability(partner),
    statusReason: partner.statusReason ?? null,
  };
}

export function requiresHandoffConfirmation(
  rec: RoutingRecommendation,
): boolean {
  if (rec.action.kind === "external_link") return true;
  if (!rec.partnerId) return false;
  const partner = getPartner(rec.partnerId);
  if (!partner) return false;
  return partner.handoffMode === "external_link";
}
