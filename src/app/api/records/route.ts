import { NextResponse } from "next/server";
import { getPlatformAuth } from "@/lib/account/auth";
import { trackServerEvent } from "@/lib/analytics/server";
import { recordProjectEvent } from "@/lib/db/events";
import { createRecord } from "@/lib/db/records";
import { CONSENT_REQUIRED_ERROR, parseIntakeConsent } from "@/lib/consent";
import { validateForGeneration } from "@/lib/intakeValidation";
import { validateClientProfile } from "@/lib/profileValidation";
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
      consent?: unknown;
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

    const checkedProfile = validateClientProfile(body.profile, { generated: true });
    if (!checkedProfile.ok) {
      return NextResponse.json({ error: checkedProfile.error }, { status: 422 });
    }

    const validationErrors = validateForGeneration(body.answers);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0].message, field: validationErrors[0].field },
        { status: 422 },
      );
    }

    const isDemo = body.isDemo ?? false;
    const consent = parseIntakeConsent(body.consent);
    if (!isDemo && !consent) {
      return NextResponse.json(
        { error: CONSENT_REQUIRED_ERROR, code: "consent_required" },
        { status: 422 },
      );
    }

    const auth = await getPlatformAuth().catch(() => null);
    const record = await createRecord({
      answers: body.answers,
      profile: checkedProfile.profile,
      preClarity: body.preClarity,
      pilotSessionId: pilotSession,
      isDemo: body.isDemo ?? false,
      tracking: body.tracking ?? null,
      ownerUserId: auth?.userId ?? null,
      consent,
    });

    await Promise.all([
      // With consent, createRecord already wrote idea_created strictly
      // (carrying the consent record); this is a no-op on the dedupe index.
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
        signalKeys: checkedProfile.profile.signals,
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
