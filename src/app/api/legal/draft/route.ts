import { NextResponse } from "next/server";
import { DRAFT_SYSTEM_PROMPT } from "@/lib/legal/prompts";
import { runLegalModel } from "@/lib/legal/model";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import {
  limitErrorResponse,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";

export const runtime = "nodejs";

type DraftBody = {
  documentType?: unknown;
  jurisdiction?: unknown;
  facts?: unknown;
  goal?: unknown;
  tone?: unknown;
};

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "legal-draft", {
    limit: 12,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  let body: DraftBody;
  try {
    body = (await readJsonWithLimit(request, 96_000)) as DraftBody;
  } catch (error) {
    return (
      limitErrorResponse(error) ??
      NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    );
  }

  try {
    const documentType = text(body.documentType, 120);
    const jurisdiction = text(body.jurisdiction, 160);
    const facts = text(body.facts, 12000);
    const goal = text(body.goal, 3000);
    const tone = text(body.tone, 120);

    if (!documentType || !facts || !goal) {
      return NextResponse.json(
        { error: "Document type, facts, and goal are required." },
        { status: 400 },
      );
    }

    const userPrompt = [
      `Document type: ${documentType}`,
      `Jurisdiction (if known): ${jurisdiction || "Not provided"}`,
      `Requested tone: ${tone || "Professional and factual"}`,
      "",
      "User-supplied facts:",
      facts,
      "",
      "What the user wants the draft to accomplish:",
      goal,
    ].join("\n");

    const draft = await runLegalModel({
      system: DRAFT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 2200,
    });

    return NextResponse.json({ draft });
  } catch (error) {
    logServerError("legal.draft", error, { route: "api/legal/draft" });
    return NextResponse.json(
      { error: "The draft could not be generated right now. Please try again." },
      { status: 500 },
    );
  }
}
