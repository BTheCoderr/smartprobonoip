/**
 * Privacy-safe GA4 conversion taxonomy for Learn -> Prepare -> Connect.
 *
 * GA4 receives only these event names and a few enum-like parameters.
 * Never: invention or legal-intake text, names, emails, record or project
 * ids, recovery tokens, or private URLs.
 *
 * Public-page conversions go through GTM's dataLayer (see gtm.ts).
 * Conversions that happen on private pages (packets, handoff) are forwarded
 * server-side through the GA4 Measurement Protocol without any page URL
 * (see measurementProtocol.ts), because GTM never loads on private pages.
 */
import type { AnalyticsEventName } from "./events";

export const GA_CONVERSION_EVENTS = [
  "landing_cta_clicked",
  "learn_started",
  "learn_completed",
  "prepare_started",
  "prepare_completed",
  "connect_started",
  "professional_referral_requested",
] as const;

export type GaConversionName = (typeof GA_CONVERSION_EVENTS)[number];

const CONVERSION_FOR: Partial<Record<AnalyticsEventName, GaConversionName>> = {
  landing_cta_clicked: "landing_cta_clicked",
  learn_started: "learn_started",
  learn_completed: "learn_completed",
  intake_started: "prepare_started",
  intake_completed: "prepare_completed",
  recommendation_handoff_viewed: "connect_started",
  organization_share_consent_viewed: "connect_started",
  attorney_export_completed: "connect_started",
  recommendation_handoff_confirmed: "professional_referral_requested",
  organization_share_consent_submitted: "professional_referral_requested",
};

/** Conversions that fire on private pages and therefore use Measurement Protocol. */
const PRIVATE_PAGE_CONVERSIONS = new Set<GaConversionName>([
  "connect_started",
  "professional_referral_requested",
]);

export function conversionFor(event: string): GaConversionName | null {
  return CONVERSION_FOR[event as AnalyticsEventName] ?? null;
}

export function isPrivatePageConversion(name: GaConversionName): boolean {
  return PRIVATE_PAGE_CONVERSIONS.has(name);
}

/** Stable CTA identifiers: the only free-form-looking value GA4 receives. */
export const CTA_ID_PATTERN = /^[a-z0-9_]{1,40}$/;

export interface ConversionParams {
  demo?: boolean;
  cta_id?: string;
  page_section?: string;
}

/** Keeps only allowlisted, enum-like parameters. */
export function conversionParams(
  metadata?: Record<string, unknown> | null,
): ConversionParams {
  const out: ConversionParams = {};
  if (!metadata) return out;
  const demo = metadata.demo ?? metadata.isDemo;
  if (typeof demo === "boolean") out.demo = demo;
  const cta = metadata.ctaId;
  if (typeof cta === "string" && CTA_ID_PATTERN.test(cta)) out.cta_id = cta;
  const section = metadata.pageSection;
  if (typeof section === "string" && CTA_ID_PATTERN.test(section)) {
    out.page_section = section;
  }
  return out;
}
