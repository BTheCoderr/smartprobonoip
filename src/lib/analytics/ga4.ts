import type { AnalyticsEventName } from "./events";
import { campaignAttributionParams } from "./campaignAttribution";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function isGa4Enabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());
}

export function ga4MeasurementId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id || null;
}

const GA4_EVENT_MAP: Partial<Record<AnalyticsEventName, string>> = {
  start_clicked: "start_packet_clicked",
  demo_started: "start_packet_clicked",
  sample_packet_viewed: "sample_packet_clicked",
  pilot_page_viewed: "pilot_page_viewed",
  contact_form_viewed: "contact_form_viewed",
  interest_submitted: "contact_form_submitted",
  packet_generated: "packet_generated",
  pdf_downloaded: "pdf_downloaded",
  research_workspace_viewed: "research_workspace_viewed",
  query_copied: "query_copied",
  external_search_opened: "external_search_opened",
  reference_saved: "reference_saved",
  gap_map_saved: "gap_map_saved",
};

const SAFE_GA_PARAMS = new Set([
  "demo",
  "reference_type",
  "query_index",
  "route_name",
  "interest_type",
  "page_path",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "referrer",
  "landing_page",
]);

function sanitizeGaParams(
  metadata?: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  if (!metadata) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) continue;
    const snake = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    if (!SAFE_GA_PARAMS.has(snake)) continue;
    if (typeof value === "boolean" || typeof value === "number") {
      out[snake] = value;
      continue;
    }
    const trimmed = String(value).trim().slice(0, 120);
    if (!trimmed || trimmed.includes("@")) continue;
    out[snake] = trimmed;
  }
  return out;
}

export function trackGa4PageView(path: string): void {
  if (typeof window === "undefined" || !window.gtag || !isGa4Enabled()) return;
  window.gtag("event", "page_view", {
    page_path: path.slice(0, 200),
    ...campaignAttributionParams(),
  });
}

export function trackGa4Event(
  eventName: AnalyticsEventName,
  metadata?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === "undefined" || !window.gtag || !isGa4Enabled()) return;

  const gaName = GA4_EVENT_MAP[eventName];
  if (!gaName) return;

  window.gtag("event", gaName, {
    ...campaignAttributionParams(),
    ...sanitizeGaParams(metadata),
  });
}
