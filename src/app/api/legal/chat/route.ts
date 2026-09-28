import { NextResponse } from "next/server";
import { ERMI_SYSTEM_PROMPT } from "@/lib/legal/prompts";
import { runLegalModel, type LegalModelMessage } from "@/lib/legal/model";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import {
  limitErrorResponse,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";

export const runtime = "nodejs";

type ChatBody = {
  messages?: Array<{ role?: unknown; content?: unknown }>;
  handoff?: unknown;
};

function cleanMessages(input: ChatBody["messages"]): LegalModelMessage[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(-16)
    .flatMap((item): LegalModelMessage[] => {
      if (
        (item?.role !== "user" && item?.role !== "assistant") ||
        typeof item?.content !== "string"
      ) {
        return [];
      }
      const content = item.content.trim().slice(0, 6000);
      return content ? [{ role: item.role, content }] : [];
    });
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "legal-chat", {
    limit: 24,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  let body: ChatBody;
  try {
    body = (await readJsonWithLimit(request, 96_000)) as ChatBody;
  } catch (error) {
    return (
      limitErrorResponse(error) ??
      NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    );
  }

  try {
    const messages = cleanMessages(body.messages);
    if (!messages.length || messages[messages.length - 1]?.role !== "user") {
      return NextResponse.json(
        { error: "A user message is required." },
        { status: 400 },
      );
    }

    const handoff =
      typeof body.handoff === "string" && body.handoff.trim()
        ? body.handoff.trim().slice(0, 8000)
        : "";

    const response = await runLegalModel({
      system: handoff
        ? `${ERMI_SYSTEM_PROMPT}\n\nPreparation context supplied by the user from another SmartProBono tool:\n${handoff}`
        : ERMI_SYSTEM_PROMPT,
      messages,
      maxTokens: 1700,
    });

    return NextResponse.json({ message: response });
  } catch (error) {
    logServerError("legal.chat", error, { route: "api/legal/chat" });
    return NextResponse.json(
      { error: "Ermi could not respond right now. Please try again." },
      { status: 500 },
    );
  }
}
