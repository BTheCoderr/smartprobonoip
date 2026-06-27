import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { createRecord } from "@/lib/db/records";
import { validateForGeneration } from "@/lib/intakeValidation";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import type { IntakeAnswers, ReadinessProfile } from "@/lib/types";

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase service role is not configured" },
      { status: 503 },
    );
  }

  const pilotSession = request.headers.get("x-pilot-session");
  if (!pilotSession) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
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
    const message = err instanceof Error ? err.message : "Failed to save record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
