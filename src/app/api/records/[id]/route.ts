import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { recordProjectEvent } from "@/lib/db/events";
import {
  getRecordById,
  updateAnswersAndProfile,
  updateDevelopmentTimeline,
  updateInvention,
  updatePostClarity,
  updateProfile,
} from "@/lib/db/records";
import { isInventionStatus } from "@/lib/ideas/status";
import { MAX_INVENTION_TITLE_LENGTH } from "@/lib/ideas/title";
import { inventionStatusLabel } from "@/lib/ideas/status";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import {
  assertIntakeAnswersWithinLimits,
  assertTextWithinLimit,
  limitErrorResponse,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import type {
  DevelopmentTimeline,
  IntakeAnswers,
  ReadinessProfile,
} from "@/lib/types";

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

  const record = await getRecordById(id, pilotSession);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ record });
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
      postClarity?: number;
      profile?: ReadinessProfile;
      answers?: IntakeAnswers;
      preClarity?: number;
      developmentTimeline?: DevelopmentTimeline;
      title?: string;
      status?: string;
    };

    if (body.answers && body.profile) {
      assertIntakeAnswersWithinLimits(body.answers);
      const preClarity =
        typeof body.preClarity === "number"
          ? body.preClarity
          : body.answers.preClarity;
      await updateAnswersAndProfile(id, pilotSession, {
        answers: body.answers,
        profile: body.profile,
        preClarity,
      });
      await recordProjectEvent({
        projectId: id,
        pilotSessionId: pilotSession,
        type: "packet_updated",
        source: "user",
      });
      const record = await getRecordById(id, pilotSession);
      return NextResponse.json({ record });
    }

    if (body.title !== undefined || body.status !== undefined) {
      assertTextWithinLimit(body.title, MAX_INVENTION_TITLE_LENGTH);
      if (body.status !== undefined && !isInventionStatus(body.status)) {
        return NextResponse.json({ error: "Unsupported status" }, { status: 422 });
      }

      const result = await updateInvention(id, pilotSession, {
        title: body.title,
        status: isInventionStatus(body.status) ? body.status : undefined,
      });

      if (result.titleChanged) {
        await recordProjectEvent({
          projectId: id,
          pilotSessionId: pilotSession,
          type: "title_updated",
          source: "user",
        });
      }
      if (result.statusChanged && result.record.status) {
        await recordProjectEvent({
          projectId: id,
          pilotSessionId: pilotSession,
          type: "status_changed",
          source: "user",
          detail: `Status changed to ${inventionStatusLabel(result.record.status)}.`,
          metadata: {
            from: result.previousStatus,
            to: result.record.status,
          },
        });
      }
    }

    if (typeof body.postClarity === "number") {
      await updatePostClarity(id, pilotSession, body.postClarity);
      const existing = await getRecordById(id, pilotSession);
      await trackServerEvent("clarity_after_recorded", {
        projectId: id,
        pilotSessionId: pilotSession,
        anonymousId: request.headers.get("x-anonymous-id"),
        partnerSlug: existing?.partnerSlug,
        partnerName: existing?.partnerName,
        source: existing?.source,
        campaign: existing?.campaign,
        metadata: { clarityRating: body.postClarity },
      });
      await recordProjectEvent({
        projectId: id,
        pilotSessionId: pilotSession,
        type: "clarity_recorded",
        source: "user",
        dedupeKey: "clarity_recorded",
      });
    }
    if (body.profile) {
      await updateProfile(id, pilotSession, body.profile);
      await recordProjectEvent({
        projectId: id,
        pilotSessionId: pilotSession,
        type: "packet_updated",
        source: "user",
      });
    }
    if (body.developmentTimeline) {
      await updateDevelopmentTimeline(id, pilotSession, body.developmentTimeline);
      await recordProjectEvent({
        projectId: id,
        pilotSessionId: pilotSession,
        type: "timeline_updated",
        source: "user",
        dedupeKey: "timeline_updated",
      });
    }

    const record = await getRecordById(id, pilotSession);
    return NextResponse.json({ record });
  } catch (err) {
    const limited = limitErrorResponse(err);
    if (limited) return limited;
    logServerError("records.patch", err, { route: "records/[id]" });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
