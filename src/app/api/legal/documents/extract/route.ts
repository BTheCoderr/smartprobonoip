import { NextResponse } from "next/server";
import {
  extractLegalDocument,
  LegalDocumentError,
  MAX_LEGAL_DOCUMENT_BYTES,
} from "@/lib/legal/documentExtraction";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import { logServerError } from "@/lib/security/safeLog";

export const runtime = "nodejs";

function readFileName(request: Request): string {
  const encoded = request.headers.get("x-file-name") || "";
  if (!encoded) return "";
  try {
    return decodeURIComponent(encoded).slice(0, 180);
  } catch {
    return encoded.slice(0, 180);
  }
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "legal-document-extract", {
    limit: 8,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declared = Number(contentLength);
    if (Number.isFinite(declared) && declared > MAX_LEGAL_DOCUMENT_BYTES) {
      return NextResponse.json(
        { error: "File too large. SmartProBono currently accepts documents up to 4 MB." },
        { status: 413 },
      );
    }
  }

  try {
    const fileName = readFileName(request);
    if (!fileName) {
      return NextResponse.json({ error: "The upload is missing a file name." }, { status: 400 });
    }

    const buffer = Buffer.from(await request.arrayBuffer());
    const extracted = await extractLegalDocument({
      name: fileName,
      type: request.headers.get("content-type") || "application/octet-stream",
      buffer,
    });

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
