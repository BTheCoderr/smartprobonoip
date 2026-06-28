import { getStoredTracking } from "@/lib/partnerTracking";
import { getAnonymousId, pilotSessionHeaders } from "@/lib/pilotSession";
import { trackGtmEvent } from "./gtm";
import type { AnalyticsEventName } from "./events";

export interface TrackOptions {
  projectId?: string;
  route?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}

function buildGtmMetadata(
  options: TrackOptions,
  tracking: ReturnType<typeof getStoredTracking>,
): Record<string, string | number | boolean | undefined> {
  const route =
    options.route ??
    (typeof window !== "undefined" ? window.location.pathname : undefined);

  return {
    route: route?.slice(0, 120),
    partner: tracking?.partnerSlug?.slice(0, 80),
    source: tracking?.source?.slice(0, 80),
    campaign: tracking?.campaign?.slice(0, 80),
    ...options.metadata,
  };
}

export function trackEvent(
  eventName: AnalyticsEventName,
  options: TrackOptions = {},
): void {
  if (typeof window === "undefined") return;

  const tracking = getStoredTracking();
  const body = {
    eventName,
    projectId: options.projectId,
    route: options.route ?? window.location.pathname,
    metadata: options.metadata,
    partnerSlug: tracking?.partnerSlug,
    partnerName: tracking?.partnerName,
    source: tracking?.source,
    campaign: tracking?.campaign,
  };

  try {
    trackGtmEvent(eventName, buildGtmMetadata(options, tracking));
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
        "x-anonymous-id": getAnonymousId(),
      },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Fail silently — analytics must not block UX.
  }
}

export function trackStartClicked(isDemo: boolean): void {
  trackEvent(isDemo ? "demo_started" : "start_clicked", {
    metadata: { demo: isDemo },
  });
}

export function trackPartnerInterestClicked(input: {
  ctaName: string;
  pageSection: string;
  route?: string;
}): void {
  trackEvent("partner_interest_clicked", {
    route: input.route,
    metadata: {
      ctaName: input.ctaName.slice(0, 80),
      pageSection: input.pageSection.slice(0, 80),
    },
  });
}
