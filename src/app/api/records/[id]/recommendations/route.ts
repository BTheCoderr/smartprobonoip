import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import {
  dismissRecommendation,
  getRoutingPreferences,
  restoreAllRecommendations,
  restoreRecommendation,
} from "@/lib/db/routingPreferences";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import { readJsonWithLimit } from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { id } = await params;
  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  const preferences = await getRoutingPreferences(id, pilotSession);
  if (!preferences) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ preferences });
}

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
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  try {
    const body = (await readJsonWithLimit(request)) as {
      action?: "dismiss" | "restore" | "restore_all";
      recommendationId?: string;
    };

    if (body.action === "restore_all") {
      const before = await getRoutingPreferences(id, pilotSession);
      const restoredCount = before?.dismissedRecommendationIds.length ?? 0;
      const preferences = await restoreAllRecommendations(id, pilotSession);
      await trackServerEvent("recommendation_dismissals_restored", {
        projectId: id,
        pilotSessionId: pilotSession,
        anonymousId: request.headers.get("x-anonymous-id"),
        metadata: { restoredCount },
      });
      return NextResponse.json({ preferences });
    }

    if (!body.recommendationId?.trim()) {
      return NextResponse.json({ error: "Missing recommendationId" }, { status: 422 });
    }

    const recommendationId = body.recommendationId.trim();

    if (body.action === "dismiss") {
      const preferences = await dismissRecommendation(
        id,
        pilotSession,
        recommendationId,
      );
      return NextResponse.json({ preferences });
    }

    if (body.action === "restore") {
      const preferences = await restoreRecommendation(
        id,
        pilotSession,
        recommendationId,
      );
      await trackServerEvent("recommendation_dismissals_restored", {
        projectId: id,
        pilotSessionId: pilotSession,
        anonymousId: request.headers.get("x-anonymous-id"),
        metadata: { recommendationId, restoredCount: 1 },
      });
      return NextResponse.json({ preferences });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 422 });
  } catch (err) {
    logServerError("records.recommendations.patch", err, {
      route: "records/[id]/recommendations",
    });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
