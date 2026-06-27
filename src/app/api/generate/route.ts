import { NextResponse } from "next/server";
import { generateProfile } from "@/lib/generateProfile";
import { generateProfileAI, isAIConfigured } from "@/lib/generateProfileAI";
import { validateForGeneration } from "@/lib/intakeValidation";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import type { IntakeAnswers } from "@/lib/types";

export const runtime = "nodejs";

function isValid(answers: unknown): answers is IntakeAnswers {
  if (!answers || typeof answers !== "object") return false;
  const a = answers as Record<string, unknown>;
  return (
    typeof a.whatCreated === "string" &&
    typeof a.itemType === "string" &&
    Array.isArray(a.assets) &&
    Array.isArray(a.sharedChannels) &&
    Array.isArray(a.goals)
  );
}

export async function POST(request: Request) {
  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  const limited = enforceRateLimit(
    request,
    "generate",
    RATE_LIMITS.generate,
    pilotSession,
  );
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const answers = (body as { answers?: unknown })?.answers;
  if (!isValid(answers)) {
    return NextResponse.json(
      { error: "Invalid or incomplete intake answers" },
      { status: 422 },
    );
  }

  const validationErrors = validateForGeneration(answers);
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: validationErrors[0].message, field: validationErrors[0].field },
      { status: 422 },
    );
  }

  try {
    if (isAIConfigured()) {
      try {
        const profile = await generateProfileAI(answers);
        return NextResponse.json({ profile });
      } catch {
        // Fall back to the rule-based generator if the AI call fails.
      }
    }

    return NextResponse.json({ profile: generateProfile(answers) });
  } catch {
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
