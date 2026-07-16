import type { AnalyticsEventName } from "./events";
import { campaignAttributionParams } from "./campaignAttribution";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const PUBLIC_MARKETING_PATHS = new Set([
  "/",
  "/pilot",
  "/sample",
  "/trust",
  "/learn",
  "/after-meeting",
  "/for-professionals",
  "/for/clinics",
  "/for/universities",
  "/about",
  "/contact",
  "/smartprobonoip",
  "/smartprobonoip/pilot",
  "/smartprobonoip/sample",
  "/smartprobonoip/start",
]);

/** Public funnel routes where intake/disclaimer events may fire. */
const PUBLIC_FUNNEL_PATHS = new Set([
  ...PUBLIC_MARKETING_PATHS,
  "/disclaimer",
  "/start",
  "/smartprobonoip/disclaimer",
]);

const BLOCKED_PATH_PREFIXES = [
  "/profile/",
  "/recover",
  "/dashboard",
  "/leads",
  "/smartprobonoip/profile/",
  "/smartprobonoip/recover",
  "/smartprobonoip/dashboard",
  "/smartprobonoip/leads",
];

/** Public marketing events only — private app events stay in Supabase analytics. */
const GTM_EVENT_MAP: Partial<Record<AnalyticsEventName, string>> = {
  start_clicked: "start_packet_clicked",
  demo_started: "start_packet_clicked",
  sample_packet_viewed: "sample_packet_clicked",
  pilot_page_viewed: "pilot_page_viewed",
  contact_form_viewed: "contact_form_viewed",
  interest_submitted: "contact_form_submitted",
  disclaimer_accepted: "disclaimer_accepted",
  intake_started: "intake_started",
  intake_step_completed: "intake_step_completed",
  intake_completed: "intake_completed",
  intake_draft_saved: "intake_draft_saved",
  partner_interest_clicked: "partner_interest_clicked",
};

const SAFE_GTM_PARAMS = new Set([
  "demo",
  "interest_type",
  "page_path",
  "step_number",
  "step_name",
  "route",
  "partner",
  "source",
  "campaign",
  "total_steps",
  "cta_name",
  "page_section",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "referrer",
  "landing_page",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function gtmContainerId(): string | null {
  const id = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  return id || null;
}

export function isGtmEnabled(): boolean {
  return Boolean(gtmContainerId());
}

export function isPublicMarketingPath(pathname: string): boolean {
  if (BLOCKED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }
  return PUBLIC_MARKETING_PATHS.has(pathname);
}

export function isPublicGtmEventPath(pathname: string): boolean {
  if (BLOCKED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }
  return PUBLIC_FUNNEL_PATHS.has(pathname);
}

function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === "undefined" || !isGtmEnabled()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function sanitizeGtmParams(
  metadata?: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  if (!metadata) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) continue;
    const snake = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    if (!SAFE_GTM_PARAMS.has(snake)) continue;
    if (typeof value === "boolean" || typeof value === "number") {
      out[snake] = value;
      continue;
    }
    const trimmed = String(value).trim().slice(0, 120);
    if (!trimmed || trimmed.includes("@")) continue;
    if (UUID_PATTERN.test(trimmed)) continue;
    if (/^[A-Za-z0-9_-]{24,}$/.test(trimmed)) continue;
    out[snake] = trimmed;
  }
  return out;
}

export function trackGtmPageView(path: string): void {
  if (!isPublicMarketingPath(path)) return;
  pushDataLayer({
    event: "page_view",
    page_path: path.slice(0, 200),
    ...campaignAttributionParams(),
  });
}

export function trackGtmEvent(
  eventName: AnalyticsEventName,
  metadata?: Record<string, string | number | boolean | undefined>,
): void {
  const gtmEvent = GTM_EVENT_MAP[eventName];
  if (!gtmEvent) return;

  const route =
    typeof metadata?.route === "string"
      ? metadata.route
      : typeof window !== "undefined"
        ? window.location.pathname
        : "";

  if (!isPublicGtmEventPath(route)) return;

  pushDataLayer({
    event: gtmEvent,
    ...campaignAttributionParams(),
    ...sanitizeGtmParams(metadata),
  });
}
