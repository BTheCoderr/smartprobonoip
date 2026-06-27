import { NextResponse } from "next/server";
import {
  deleteResearchReference,
  getResearchWorkspace,
  saveResearchReference,
  updateResearchReference,
} from "@/lib/db/research";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import type { SaveReferenceInput, UpdateReferenceInput } from "@/lib/research/types";

export const runtime = "nodejs";

function pilotSession(request: Request): string | null {
  return request.headers.get("x-pilot-session");
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const session = pilotSession(request);
  if (!session) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

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

  const session = pilotSession(request);
  if (!session) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

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
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
