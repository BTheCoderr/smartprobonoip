import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { recordProjectEvent } from "@/lib/db/events";
import { getRecordById, updateDevelopmentTimeline } from "@/lib/db/records";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { countFilledTimelineFields } from "@/lib/packet";
import type { DevelopmentTimeline } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { id } = await params;
  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const limited = enforceRateLimit(
    request,
    "timeline",
    RATE_LIMITS.timeline,
    pilotSession,
  );
  if (limited) return limited;

  let body: { developmentTimeline?: DevelopmentTimeline };
  try {
    body = (await request.json()) as { developmentTimeline?: DevelopmentTimeline };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.developmentTimeline || typeof body.developmentTimeline !== "object") {
    return NextResponse.json({ error: "Invalid timeline" }, { status: 422 });
  }

  try {
    const existing = await getRecordById(id, pilotSession);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const record = await updateDevelopmentTimeline(
      id,
      pilotSession,
      body.developmentTimeline,
    );

    await trackServerEvent("timeline_saved", {
      projectId: id,
      pilotSessionId: pilotSession,
      anonymousId: request.headers.get("x-anonymous-id"),
      partnerSlug: record.partnerSlug,
      partnerName: record.partnerName,
      source: record.source,
      campaign: record.campaign,
      metadata: {
        demo: record.isDemo ?? false,
        filledTimelineFields: countFilledTimelineFields(record.developmentTimeline),
      },
    });

    await recordProjectEvent({
      projectId: id,
      pilotSessionId: pilotSession,
      type: "timeline_updated",
      source: "user",
      dedupeKey: "timeline_updated",
    });

    return NextResponse.json({ record });
  } catch {
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
