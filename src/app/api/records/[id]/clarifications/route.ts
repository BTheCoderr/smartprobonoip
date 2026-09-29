import { NextResponse } from "next/server";
import {
  answerProjectClarification,
  listProjectClarifications,
} from "@/lib/db/clarificationRequests";
import { recordProjectEvent } from "@/lib/db/events";
import { GENERIC_SERVER_ERROR } from "@/lib/security/api";
import { resolveProjectAccess } from "@/lib/account/projectAccess";
import {
  assertTextWithinLimit,
  limitErrorResponse,
  MAX_TEXT,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const { id } = await params;
  const owned = await resolveProjectAccess(request, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const clarifications = await listProjectClarifications(id);
    return NextResponse.json({ clarifications });
  } catch (err) {
    logServerError("clarifications.project.list", err, { projectId: id });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const { id } = await params;
  const owned = await resolveProjectAccess(request, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = (await readJsonWithLimit(request)) as {
      action?: "answer";
      clarificationId?: string;
      answerText?: string;
    };
    if (
      body.action !== "answer" ||
      !body.clarificationId ||
      !body.answerText?.trim()
    ) {
      return NextResponse.json(
        { error: "Enter an answer before saving." },
        { status: 422 },
      );
    }
    assertTextWithinLimit(body.answerText, MAX_TEXT.long);

    const clarification = await answerProjectClarification({
      projectId: id,
      clarificationId: body.clarificationId,
      answerText: body.answerText,
    });
    if (!clarification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await recordProjectEvent({
      projectId: id,
      pilotSessionId: owned.pilotSessionId,
      type: "professional_clarification_answered",
      source: "user",
      detail: "Inventor answered a professional clarification request.",
      metadata: {
        clarificationId: clarification.id,
        organizationId: clarification.organizationId,
        canonicalKey: clarification.canonicalKey,
      },
    }).catch(() => undefined);

    return NextResponse.json({ clarification });
  } catch (err) {
    const limited = limitErrorResponse(err);
    if (limited) return limited;
    logServerError("clarifications.project.answer", err, { projectId: id });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
