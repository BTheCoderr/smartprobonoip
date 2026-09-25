import { NextResponse } from "next/server";
import { recordProjectEvent } from "@/lib/db/events";
import { getRecordById } from "@/lib/db/records";
import {
  answerProfessionalHandoffQuestion,
  approveMappedProfessionalHandoff,
  getLatestProfessionalHandoff,
  listAvailableProfessionalHandoffTemplates,
  prepareProfessionalHandoff,
  shareProfessionalHandoffToOrganization,
} from "@/lib/handoff/canonicalMapper";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import { readJsonWithLimit } from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

async function ownedProject(request: Request, id: string) {
  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) return null;
  const record = await getRecordById(id, pilotSession);
  return record ? { record, pilotSession } : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const { id } = await params;
  const owned = await ownedProject(request, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const [handoff, templates] = await Promise.all([
      getLatestProfessionalHandoff(id),
      listAvailableProfessionalHandoffTemplates(id),
    ]);
    return NextResponse.json({ handoff, templates });
  } catch (err) {
    logServerError("professional-handoff.get", err, { projectId: id });
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
  const owned = await ownedProject(request, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = (await readJsonWithLimit(request)) as {
      action?: "prepare" | "approve_mapped" | "answer" | "share";
      sessionId?: string;
      questionId?: string;
      value?: string;
      templateId?: string | null;
    };

    if (body.action === "answer") {
      if (!body.sessionId || !body.questionId || !body.value?.trim()) {
        return NextResponse.json({ error: "Missing answer details" }, { status: 422 });
      }
      const handoff = await answerProfessionalHandoffQuestion({
        projectId: id,
        sessionId: body.sessionId,
        questionId: body.questionId,
        value: body.value,
      });
      return NextResponse.json({ handoff });
    }

    if (body.action === "share") {
      if (!body.sessionId) {
        return NextResponse.json({ error: "Missing handoff session" }, { status: 422 });
      }
      const handoff = await shareProfessionalHandoffToOrganization({
        projectId: id,
        sessionId: body.sessionId,
      });
      return NextResponse.json({ handoff });
    }

    if (body.action === "approve_mapped") {
      if (!body.sessionId) {
        return NextResponse.json({ error: "Missing handoff session" }, { status: 422 });
      }
      const handoff = await approveMappedProfessionalHandoff(id, body.sessionId);
      return NextResponse.json({ handoff });
    }

    const handoff = await prepareProfessionalHandoff({
      projectId: id,
      pilotSessionId: owned.pilotSession,
      templateId: body.templateId ?? null,
    });

    await recordProjectEvent({
      projectId: id,
      pilotSessionId: owned.pilotSession,
      type: "professional_handoff_prepared",
      source: "user",
      detail: "Canonical invention facts mapped into a professional intake draft.",
      metadata: {
        mappedQuestionCount: handoff.mappedQuestionCount,
        unresolvedQuestionCount: handoff.unresolvedQuestionCount,
      },
    });

    return NextResponse.json({ handoff });
  } catch (err) {
    logServerError("professional-handoff.post", err, { projectId: id });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
