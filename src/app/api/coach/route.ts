import { NextResponse } from "next/server";
import {
  buildRuleCoachResponse,
  isCoachMode,
  isCoachResponseSafe,
  type CoachMode,
} from "@/lib/coach";
import { generateCoachAI } from "@/lib/coachAI";
import { isAIConfigured } from "@/lib/generateProfileAI";
import type { ProjectRecord } from "@/lib/types";

export const runtime = "nodejs";

function isValidRecord(value: unknown): value is ProjectRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  const answers = r.answers as Record<string, unknown> | undefined;
  const profile = r.profile as Record<string, unknown> | undefined;
  return (
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
  const question =
    typeof b.question === "string" ? b.question.slice(0, 500) : undefined;
  const mode: CoachMode | "custom" = isCoachMode(b.mode) ? b.mode : "custom";

  if (mode === "custom" && !question) {
    return NextResponse.json(
      { error: "Provide a coach mode or a question" },
      { status: 422 },
    );
  }

  if (isAIConfigured()) {
    try {
      const response = await generateCoachAI(record, mode, question);
      return NextResponse.json({ response });
    } catch {
      // Fall back to the rule-based coach if the AI call fails or is unsafe.
    }
  }

  const fallback = buildRuleCoachResponse(record, mode, question);
  // Rule-based content is safe by construction, but verify before returning.
  if (!isCoachResponseSafe(fallback)) {
    return NextResponse.json(
      { error: "Unable to generate a safe response" },
      { status: 500 },
    );
  }

  return NextResponse.json({ response: fallback });
}
