import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { recordProjectEvent } from "@/lib/db/events";
import { createRecord } from "@/lib/db/records";
import { validateForGeneration } from "@/lib/intakeValidation";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import {
  assertIntakeAnswersWithinLimits,
  limitErrorResponse,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import type { IntakeAnswers, ReadinessProfile } from "@/lib/types";

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase service role is not configured" },
      { status: 503 },
    );
  }

  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  try {
    const body = (await readJsonWithLimit(request)) as {
      answers: IntakeAnswers;
      profile: ReadinessProfile;
      preClarity: number;
      isDemo?: boolean;
      tracking?: {
        partnerSlug?: string;
        partnerName?: string;
        source?: string;
        campaign?: string;
      } | null;
    };

    if (!body?.answers || !body?.profile) {
      return NextResponse.json(
        { error: "Invalid or incomplete intake answers" },
        { status: 422 },
      );
    }

    assertIntakeAnswersWithinLimits(body.answers);

    const validationErrors = validateForGeneration(body.answers);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0].message, field: validationErrors[0].field },
        { status: 422 },
      );
    }

    const record = await createRecord({
      answers: body.answers,
      profile: body.profile,
      preClarity: body.preClarity,
      pilotSessionId: pilotSession,
      isDemo: body.isDemo ?? false,
      tracking: body.tracking ?? null,
    });

    await Promise.all([
      recordProjectEvent({
        projectId: record.id,
        pilotSessionId: pilotSession,
        type: "idea_created",
        occurredAt: record.createdAt,
        dedupeKey: "idea_created",
      }),
      recordProjectEvent({
        projectId: record.id,
        pilotSessionId: pilotSession,
        type: "packet_generated",
        occurredAt: record.createdAt,
        dedupeKey: "packet_generated",
      }),
      record.answers.hasPrototype || record.answers.assets.length > 0
        ? recordProjectEvent({
            projectId: record.id,
            pilotSessionId: pilotSession,
            type: "materials_recorded",
            occurredAt: record.createdAt,
            dedupeKey: "materials_recorded",
          })
        : Promise.resolve(),
    ]);

    const tracking = body.tracking ?? null;
    const analyticsContext = {
      projectId: record.id,
      pilotSessionId: pilotSession,
      anonymousId: request.headers.get("x-anonymous-id"),
      partnerSlug: tracking?.partnerSlug ?? record.partnerSlug,
      partnerName: tracking?.partnerName ?? record.partnerName,
      source: tracking?.source ?? record.source,
      campaign: tracking?.campaign ?? record.campaign,
      metadata: {
        demo: body.isDemo ?? false,
        clarityRating: body.preClarity,
        signalKeys: body.profile.signals,
      },
    };
    await trackServerEvent("packet_generated", analyticsContext);
    await trackServerEvent("intake_completed", analyticsContext);
    await trackServerEvent("clarity_before_recorded", analyticsContext);

    return NextResponse.json({ record });
  } catch (err) {
    const limited = limitErrorResponse(err);
    if (limited) return limited;
    logServerError("records.create", err, { route: "records" });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
