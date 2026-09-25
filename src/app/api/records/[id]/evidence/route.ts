import { NextResponse } from "next/server";
import {
  createEvidenceDownloadUrl,
  createEvidenceFile,
  deleteEvidenceFile,
  listEvidenceFiles,
} from "@/lib/db/canonicalWorkspace";
import { getRecordById } from "@/lib/db/records";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import type { CanonicalEvidenceFile } from "@/lib/types";

const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const EVIDENCE_TYPES = new Set([
  "drawing","photo","video","email","presentation","paper","notebook",
  "agreement","prototype_record","search_result","other",
]);

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
    const fileId = new URL(request.url).searchParams.get("file");
    if (fileId) {
      const download = await createEvidenceDownloadUrl(id, fileId);
      if (!download) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(download);
    }
    return NextResponse.json({ evidence: await listEvidenceFiles(id) });
  } catch (err) {
    logServerError("canonical.evidence.get", err, { projectId: id });
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

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_EVIDENCE_BYTES + 256_000) {
    return NextResponse.json({ error: "Evidence file is too large" }, { status: 413 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a file to upload" }, { status: 422 });
    }
    if (file.size <= 0 || file.size > MAX_EVIDENCE_BYTES) {
      return NextResponse.json({ error: "Files must be 10 MB or smaller" }, { status: 413 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Supported files: PDF, Word, text, JPG, PNG, or WebP" },
        { status: 422 },
      );
    }

    const evidenceTypeRaw = String(form.get("evidenceType") ?? "other");
    const evidenceType = EVIDENCE_TYPES.has(evidenceTypeRaw)
      ? (evidenceTypeRaw as CanonicalEvidenceFile["evidenceType"])
      : "other";
    const documentDate = String(form.get("documentDate") ?? "").trim() || null;
    const description = String(form.get("description") ?? "").trim().slice(0, 4000) || null;

    const evidence = await createEvidenceFile({
      projectId: id,
      pilotSessionId: owned.pilotSession,
      originalFilename: file.name.slice(0, 255),
      mimeType: file.type,
      sizeBytes: file.size,
      bytes: new Uint8Array(await file.arrayBuffer()),
      evidenceType,
      documentDate,
      description,
    });
    return NextResponse.json({ evidence }, { status: 201 });
  } catch (err) {
    logServerError("canonical.evidence.post", err, { projectId: id });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const { id } = await params;
  const owned = await ownedProject(request, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const fileId = new URL(request.url).searchParams.get("file");
  if (!fileId) return NextResponse.json({ error: "Missing file" }, { status: 422 });

  try {
    await deleteEvidenceFile(id, fileId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    logServerError("canonical.evidence.delete", err, { projectId: id });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
