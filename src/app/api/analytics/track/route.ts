import { NextResponse } from "next/server";
import { isAnalyticsEventName } from "@/lib/analytics/events";
import { readAnalyticsHeaders, trackServerEvent } from "@/lib/analytics/server";
import { resolvePartnerName } from "@/lib/partnerTracking";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return new NextResponse(null, { status: 204 });
  }

  const limited = enforceRateLimit(request, "analytics-track", RATE_LIMITS.analytics);
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      eventName?: string;
      projectId?: string;
      route?: string;
      metadata?: Record<string, unknown>;
      partnerSlug?: string;
      partnerName?: string;
      source?: string;
      campaign?: string;
    };

    if (!body.eventName || !isAnalyticsEventName(body.eventName)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const headers = readAnalyticsHeaders(request);
    const partnerName =
      body.partnerName ??
      (body.partnerSlug ? resolvePartnerName(body.partnerSlug) : undefined);

    await trackServerEvent(body.eventName, {
      projectId: body.projectId?.trim() || null,
      pilotSessionId: headers.pilotSessionId ?? null,
      anonymousId: headers.anonymousId ?? null,
      partnerSlug: body.partnerSlug ?? null,
      partnerName: partnerName ?? null,
      source: body.source ?? null,
      campaign: body.campaign ?? null,
      route: body.route ?? null,
      metadata: body.metadata,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
