import { NextResponse } from "next/server";
import { createRecord } from "@/lib/db/records";
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
    };

    const record = await createRecord({
      answers: body.answers,
      profile: body.profile,
      preClarity: body.preClarity,
      pilotSessionId: pilotSession,
      isDemo: body.isDemo ?? false,
    });

    return NextResponse.json({ record });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
