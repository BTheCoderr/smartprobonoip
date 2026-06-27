import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { getFeedbackForProject, saveFeedback } from "@/lib/db/feedback";
import {
  isFeedbackLikert,
  parseSupportNeeds,
  sanitizeConfusionNote,
  type PilotFeedbackInput,
} from "@/lib/feedback";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const pilotSession = request.headers.get("x-pilot-session");
  if (!pilotSession) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  const projectId = new URL(request.url).searchParams.get("projectId")?.trim();
  if (!projectId) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  const feedback = await getFeedbackForProject(projectId, pilotSession);
  return NextResponse.json({ feedback });
}

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const pilotSession = request.headers.get("x-pilot-session");
  if (!pilotSession) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      projectId?: string;
      clarityHelped?: string;
      wouldBringToExpert?: string;
      supportNeeded?: unknown;
      confusionNote?: string;
      followUpRequested?: boolean;
    };

    if (!body.projectId?.trim()) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }
    if (!body.clarityHelped || !isFeedbackLikert(body.clarityHelped)) {
      return NextResponse.json({ error: "Invalid clarity response" }, { status: 422 });
    }
    if (!body.wouldBringToExpert || !isFeedbackLikert(body.wouldBringToExpert)) {
      return NextResponse.json(
        { error: "Invalid expert handoff response" },
        { status: 422 },
      );
    }

    const feedbackInput: PilotFeedbackInput = {
      clarityHelped: body.clarityHelped,
      wouldBringToExpert: body.wouldBringToExpert,
      supportNeeded: parseSupportNeeds(body.supportNeeded),
      confusionNote: sanitizeConfusionNote(body.confusionNote) ?? undefined,
      followUpRequested: Boolean(body.followUpRequested),
    };

    const feedback = await saveFeedback({
      projectId: body.projectId.trim(),
      pilotSessionId: pilotSession,
      feedback: feedbackInput,
    });

    await trackServerEvent("feedback_submitted", {
      projectId: feedback.projectId,
      pilotSessionId: pilotSession,
      anonymousId: request.headers.get("x-anonymous-id"),
      partnerSlug: feedback.partnerSlug,
      partnerName: feedback.partnerName,
      source: feedback.source,
      campaign: feedback.campaign,
      metadata: {
        clarityHelped: feedback.clarityHelped,
        resourceKey: feedback.supportNeeded.join(","),
      },
    });

    if (feedback.followUpRequested) {
      await trackServerEvent("followup_requested", {
        projectId: feedback.projectId,
        pilotSessionId: pilotSession,
        anonymousId: request.headers.get("x-anonymous-id"),
        partnerSlug: feedback.partnerSlug,
        partnerName: feedback.partnerName,
        source: feedback.source,
        campaign: feedback.campaign,
      });
    }

    return NextResponse.json({ feedback });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    const status = message.includes("Demo packets") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
