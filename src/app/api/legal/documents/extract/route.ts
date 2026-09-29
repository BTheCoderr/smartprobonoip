import { NextResponse } from "next/server";
import {
  extractLegalDocument,
  LegalDocumentError,
  MAX_MULTIPART_BYTES,
} from "@/lib/legal/documentExtraction";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import { logServerError } from "@/lib/security/safeLog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "legal-document-extract", {
    limit: 8,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declared = Number(contentLength);
    if (Number.isFinite(declared) && declared > MAX_MULTIPART_BYTES) {
      return NextResponse.json(
        { error: "File too large. SmartProBono currently accepts documents up to 4 MB." },
        { status: 413 },
      );
    }
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a PDF, DOCX, or TXT file." }, { status: 400 });
    }

    const extracted = await extractLegalDocument(file);
    return NextResponse.json(extracted);
  } catch (error) {
    if (error instanceof LegalDocumentError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }

    logServerError("legal.document.extract", error, {
      route: "api/legal/documents/extract",
    });
    return NextResponse.json(
      { error: "SmartProBono could not process this document right now." },
      { status: 500 },
    );
  }
}
