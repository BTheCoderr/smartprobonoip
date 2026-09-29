import * as mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { EXTRACTED_TEXT_LIMIT } from "@/lib/legal/documentAnalysis";

export const MAX_LEGAL_DOCUMENT_BYTES = 4 * 1024 * 1024;
export const MAX_MULTIPART_BYTES = Math.floor(4.5 * 1024 * 1024);

type DocumentKind = "pdf" | "docx" | "txt";

export class LegalDocumentError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

function extensionFor(name: string): string {
  const normalized = name.toLowerCase().trim();
  const index = normalized.lastIndexOf(".");
  return index >= 0 ? normalized.slice(index) : "";
}

function classifyDocument(file: File): DocumentKind {
  const ext = extensionFor(file.name);
  const mime = (file.type || "").toLowerCase();

  if (ext === ".pdf") {
    if (!["application/pdf", "application/octet-stream", ""].includes(mime)) {
      throw new LegalDocumentError("The PDF file type does not match its extension.", 415, "mime_mismatch");
    }
    return "pdf";
  }

  if (ext === ".docx") {
    if (
      ![
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
        "",
      ].includes(mime)
    ) {
      throw new LegalDocumentError("The DOCX file type does not match its extension.", 415, "mime_mismatch");
    }
    return "docx";
  }

  if (ext === ".txt") {
    if (!["text/plain", "application/octet-stream", ""].includes(mime)) {
      throw new LegalDocumentError("The TXT file type does not match its extension.", 415, "mime_mismatch");
    }
    return "txt";
  }

  throw new LegalDocumentError(
    "Unsupported file type. Upload a PDF, DOCX, or TXT file.",
    415,
    "unsupported_type",
  );
}

function validateSignature(kind: DocumentKind, buffer: Buffer): void {
  if (kind === "pdf") {
    if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new LegalDocumentError("This file does not appear to be a valid PDF.", 422, "invalid_pdf");
    }
    return;
  }

  if (kind === "docx") {
    const signature = buffer.subarray(0, 4);
    const isZip =
      signature[0] === 0x50 &&
      signature[1] === 0x4b &&
      [0x03, 0x05, 0x07].includes(signature[2] ?? -1) &&
      [0x04, 0x06, 0x08].includes(signature[3] ?? -1);
    if (!isZip) {
      throw new LegalDocumentError("This file does not appear to be a valid DOCX.", 422, "invalid_docx");
    }
    return;
  }

  if (buffer.subarray(0, Math.min(buffer.length, 4096)).includes(0)) {
    throw new LegalDocumentError("This TXT file appears to contain binary data.", 422, "invalid_txt");
  }
}

function normalizeText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

export type ExtractedLegalDocument = {
  fileName: string;
  fileType: DocumentKind;
  fileSize: number;
  text: string;
  extractedCharacters: number;
  returnedCharacters: number;
  truncated: boolean;
};

export async function extractLegalDocument(
  file: File,
): Promise<ExtractedLegalDocument> {
  if (!file.name.trim()) {
    throw new LegalDocumentError("The uploaded file must have a name.", 400, "missing_name");
  }
  if (file.size <= 0) {
    throw new LegalDocumentError("The uploaded file is empty.", 400, "empty_file");
  }
  if (file.size > MAX_LEGAL_DOCUMENT_BYTES) {
    throw new LegalDocumentError(
      "File too large. SmartProBono currently accepts documents up to 4 MB.",
      413,
      "file_too_large",
    );
  }

  const kind = classifyDocument(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  validateSignature(kind, buffer);

  let rawText = "";
  try {
    if (kind === "pdf") rawText = await extractPdf(buffer);
    else if (kind === "docx") rawText = await extractDocx(buffer);
    else rawText = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  } catch {
    throw new LegalDocumentError(
      "SmartProBono could not extract readable text from this file.",
      422,
      "extraction_failed",
    );
  }

  const normalized = normalizeText(rawText);
  if (!normalized) {
    throw new LegalDocumentError(
      kind === "pdf"
        ? "No selectable text was found. Image-only or scanned PDFs are not supported yet."
        : "No readable text was found in this document.",
      422,
      "no_text",
    );
  }

  const truncated = normalized.length > EXTRACTED_TEXT_LIMIT;
  const text = truncated ? normalized.slice(0, EXTRACTED_TEXT_LIMIT) : normalized;

  return {
    fileName: file.name.slice(0, 180),
    fileType: kind,
    fileSize: file.size,
    text,
    extractedCharacters: normalized.length,
    returnedCharacters: text.length,
    truncated,
  };
}
