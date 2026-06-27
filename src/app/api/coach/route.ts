import { NextResponse } from "next/server";
import {
  buildRuleCoachResponse,
  isCoachMode,
  isCoachResponseSafe,
  type CoachMode,
} from "@/lib/coach";
import { generateCoachAI } from "@/lib/coachAI";
import { getRecordById } from "@/lib/db/records";
import { isAIConfigured } from "@/lib/generateProfileAI";
import { GENERIC_SERVER_ERROR, readPilotSession } from "@/lib/security/api";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import type { ProjectRecord } from "@/lib/types";

export const runtime = "nodejs";

function isValidRecord(value: unknown): value is ProjectRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  const answers = r.answers as Record<string, unknown> | undefined;
  const profile = r.profile as Record<string, unknown> | undefined;
  return (
    typeof r.id === "string" &&
    !!answers &&
    typeof answers.whatCreated === "string" &&
    Array.isArray(answers.assets) &&
    Array.isArray(answers.sharedChannels) &&
    !!profile &&
    Array.isArray(profile.missingInfo) &&
    Array.isArray(profile.expertQuestions)
  );
}

export async function POST(request: Request) {
  const pilotSession = readPilotSession(request);
  if (!pilotSession) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  const limited = enforceRateLimit(
    request,
    "coach",
    RATE_LIMITS.coach,
    pilotSession,
  );
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as {
    record?: unknown;
    mode?: unknown;
    question?: unknown;
  };

  if (!isValidRecord(b.record)) {
    return NextResponse.json(
      { error: "Missing or invalid packet record" },
      { status: 422 },
    );
  }

  const record = b.record;
  if (
    isSupabaseServerConfigured() &&
    !record.isDemo
  ) {
    const owned = await getRecordById(record.id, pilotSession);
    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const question =
    typeof b.question === "string" ? b.question.slice(0, 500) : undefined;
  const mode: CoachMode | "custom" = isCoachMode(b.mode) ? b.mode : "custom";

  if (mode === "custom" && !question) {
    return NextResponse.json(
      { error: "Provide a coach mode or a question" },
      { status: 422 },
    );
  }

  try {
    if (isAIConfigured()) {
      try {
        const response = await generateCoachAI(record, mode, question);
        return NextResponse.json({ response });
      } catch {
        // Fall back to the rule-based coach if the AI call fails or is unsafe.
      }
    }

    const fallback = buildRuleCoachResponse(record, mode, question);
    if (!isCoachResponseSafe(fallback)) {
      return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
    }

    return NextResponse.json({ response: fallback });
  } catch {
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
