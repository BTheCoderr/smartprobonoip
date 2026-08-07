import { NextResponse } from "next/server";
import {
  createDocument,
  listDocumentsForProject,
} from "@/lib/db/documents";
import { recordProjectEvent } from "@/lib/db/events";
import { getRecordById } from "@/lib/db/records";
import {
  documentDisplayLabel,
  findDocumentDescriptor,
} from "@/lib/ideas/documents";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import {
  limitErrorResponse,
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
  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  const owned = await getRecordById(id, pilotSession);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const documents = await listDocumentsForProject(id);
  return NextResponse.json({ documents });
}

/**
 * Records that an artifact was generated. Artifacts are produced in the browser
 * and saved straight to the inventor's device, so the server is told what was
 * made — never sent the file.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { id } = await params;
  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  try {
    const body = (await readJsonWithLimit(request)) as {
      kind?: unknown;
      format?: unknown;
    };

    const descriptor = findDocumentDescriptor(body.kind, body.format);
    if (!descriptor) {
      return NextResponse.json({ error: "Unsupported document" }, { status: 422 });
    }

    const owned = await getRecordById(id, pilotSession);
    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const document = await createDocument({
      projectId: id,
      pilotSessionId: pilotSession,
      kind: descriptor.kind,
      format: descriptor.format,
    });

    if (!document) {
      return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
    }

    await recordProjectEvent({
      projectId: id,
      pilotSessionId: pilotSession,
      type: "document_generated",
      source: "user",
      detail: `${documentDisplayLabel(document)} generated.`,
      metadata: { kind: document.kind, format: document.format },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    const limited = limitErrorResponse(err);
    if (limited) return limited;
    logServerError("documents.post", err, { route: "records/[id]/documents" });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
