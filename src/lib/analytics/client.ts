import { getStoredTracking } from "@/lib/partnerTracking";
import { getAnonymousId, pilotSessionHeaders } from "@/lib/pilotSession";
import { trackGa4Event } from "./ga4";
import type { AnalyticsEventName } from "./events";

export interface TrackOptions {
  projectId?: string;
  route?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
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
    trackGa4Event(eventName, {
      ...options.metadata,
      route_name: body.route?.slice(0, 120),
    });
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
