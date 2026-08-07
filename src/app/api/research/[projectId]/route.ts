import { NextResponse } from "next/server";
import { recordProjectEvent } from "@/lib/db/events";
import {
  deleteResearchReference,
  getResearchWorkspace,
  saveResearchReference,
  updateResearchReference,
} from "@/lib/db/research";
import { GENERIC_SERVER_ERROR, readPilotSession } from "@/lib/security/api";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import type { SaveReferenceInput, UpdateReferenceInput } from "@/lib/research/types";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const session = readPilotSession(request);
  if (!session) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  const limited = enforceRateLimit(
    request,
    "research",
    RATE_LIMITS.research,
    session,
  );
  if (limited) return limited;

  const { projectId } = await context.params;
  const workspace = await getResearchWorkspace(projectId, session);
  if (!workspace) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  return NextResponse.json({ workspace });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const session = readPilotSession(request);
  if (!session) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  const limited = enforceRateLimit(
    request,
    "research",
    RATE_LIMITS.research,
    session,
  );
  if (limited) return limited;

  const { projectId } = await context.params;
  let body: {
    action?: string;
    reference?: SaveReferenceInput;
    update?: UpdateReferenceInput;
    refId?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.action === "save" && body.reference) {
      const saved = await saveResearchReference(
        projectId,
        session,
        body.reference,
      );
      await recordProjectEvent({
        projectId,
        pilotSessionId: session,
        type: "research_reference_added",
        source: "user",
        dedupeKey: `reference:${saved.id}`,
      });
      return NextResponse.json({ reference: saved });
    }

    if (body.action === "update" && body.update) {
      const updated = await updateResearchReference(
        projectId,
        session,
        body.update,
      );
      return NextResponse.json({ reference: updated });
    }

    if (body.action === "delete" && body.refId) {
      await deleteResearchReference(projectId, session, body.refId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 422 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("not found")) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
