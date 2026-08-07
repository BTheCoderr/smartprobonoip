import type { DocumentFormat, DocumentKind, DocumentRecord } from "./types";

export interface DocumentDescriptor {
  kind: DocumentKind;
  format: DocumentFormat;
  /** Stored as the document title. Never contains invention free text. */
  title: string;
  description: string;
}

/**
 * The artifacts SmartProBonoIP produces. Kind is what the document is, format
 * is how it is written, so a new report type does not need a new type per file
 * format.
 */
export const DOCUMENT_DESCRIPTORS: readonly DocumentDescriptor[] = [
  {
    kind: "readiness_packet",
    format: "pdf",
    title: "IP Readiness Packet",
    description: "The full packet, formatted for a professional conversation.",
  },
  {
    kind: "attorney_brief",
    format: "pdf",
    title: "One-page professional brief",
    description: "A condensed summary for a first meeting.",
  },
  {
    kind: "attorney_export",
    format: "json",
    title: "Professional handoff data",
    description: "Structured export of the packet for intake systems.",
  },
  {
    kind: "attorney_export",
    format: "csv",
    title: "Professional handoff data",
    description: "Flat export of the packet for spreadsheets.",
  },
  {
    kind: "intake_summary",
    format: "md",
    title: "Invention intake summary",
    description: "A plain-text summary of what you entered during intake.",
  },
] as const;

export const DOCUMENT_KINDS: readonly DocumentKind[] = [
  "readiness_packet",
  "attorney_brief",
  "attorney_export",
  "intake_summary",
] as const;

export const DOCUMENT_FORMATS: readonly DocumentFormat[] = [
  "pdf",
  "json",
  "csv",
  "md",
] as const;

export function isDocumentKind(value: unknown): value is DocumentKind {
  return (
    typeof value === "string" &&
    (DOCUMENT_KINDS as readonly string[]).includes(value)
  );
}

export function isDocumentFormat(value: unknown): value is DocumentFormat {
  return (
    typeof value === "string" &&
    (DOCUMENT_FORMATS as readonly string[]).includes(value)
  );
}

export function findDocumentDescriptor(
  kind: unknown,
  format: unknown,
): DocumentDescriptor | null {
  if (!isDocumentKind(kind) || !isDocumentFormat(format)) return null;
  return (
    DOCUMENT_DESCRIPTORS.find(
      (descriptor) => descriptor.kind === kind && descriptor.format === format,
    ) ?? null
  );
}

/** Display label including the file format, e.g. "IP Readiness Packet (PDF)". */
export function documentDisplayLabel(document: {
  title: string;
  format: DocumentFormat;
}): string {
  return `${document.title} (${document.format.toUpperCase()})`;
}

/**
 * Stored artifacts are downloaded directly; everything else is regenerated on
 * demand, because the app never keeps a copy of what it produced.
 */
export function isStoredDocument(document: DocumentRecord): boolean {
  return Boolean(document.storageUrl);
}

export function sortDocumentsByNewest<T extends { createdAt: string }>(
  documents: T[],
): T[] {
  return [...documents].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}
