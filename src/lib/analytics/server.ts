import "server-only";
import { insertAnalyticsEvent } from "@/lib/db/analytics";
import { resolvePartnerName } from "@/lib/partnerTracking";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { isAnalyticsEventName } from "./events";
import type { AnalyticsEventName } from "./events";

export interface ServerTrackContext {
  projectId?: string | null;
  pilotSessionId?: string | null;
  anonymousId?: string | null;
  partnerSlug?: string | null;
  partnerName?: string | null;
  source?: string | null;
  campaign?: string | null;
  route?: string | null;
  metadata?: Record<string, unknown>;
}

export function readAnalyticsHeaders(request: Request): {
  pilotSessionId?: string;
  anonymousId?: string;
} {
  return {
    pilotSessionId: request.headers.get("x-pilot-session") ?? undefined,
    anonymousId: request.headers.get("x-anonymous-id") ?? undefined,
  };
}

export async function trackServerEvent(
  eventName: AnalyticsEventName,
  context: ServerTrackContext = {},
): Promise<void> {
  if (!isSupabaseServerConfigured() || !isAnalyticsEventName(eventName)) return;
  try {
    const partnerName =
      context.partnerName ??
      (context.partnerSlug ? resolvePartnerName(context.partnerSlug) : undefined);
    await insertAnalyticsEvent({
      eventName,
      projectId: context.projectId,
      pilotSessionId: context.pilotSessionId,
      anonymousId: context.anonymousId,
      partnerSlug: context.partnerSlug,
      partnerName,
      source: context.source,
      campaign: context.campaign,
      route: context.route,
      metadata: context.metadata,
    });
  } catch {
    // Analytics must never block core flows.
  }
}
