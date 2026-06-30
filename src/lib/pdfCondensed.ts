import { jsPDF } from "jspdf";
import { BRAND, formatCopyrightNotice, LEGAL, PACKET_PDF_VERSION } from "./brand";
import { DISCLAIMER_SHORT } from "./disclaimer";
import {
  buildExpertHandoff,
  buildNextMeetingChecklist,
  getIdeaLabel,
} from "./packet";
import { buildPacketReviewSummary } from "./packetReview";
import type { SavedReference } from "./research/types";
import type { PdfExportOptions } from "./pdf";
import type { ProjectRecord } from "./types";

const MARGIN = 48;
const LINE = 14;

const NAVY: [number, number, number] = [2, 46, 85];
const TEAL: [number, number, number] = [4, 147, 151];
const MIST: [number, number, number] = [245, 248, 250];
const GRAY: [number, number, number] = [90, 105, 120];

function truncate(text: string, maxLen: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1).trim()}…`;
}

export function buildCondensedAttorneyPdf(
  record: ProjectRecord,
  savedReferences: SavedReference[] = [],
  options?: PdfExportOptions,
): jsPDF {
  const savedReferenceCount = savedReferences.length;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  const profile = record.profile;
  const handoff = buildExpertHandoff(record);
  const review = buildPacketReviewSummary(record, savedReferenceCount);
  const packetId = record.id.slice(0, 8).toUpperCase();
  const ideaLabel = getIdeaLabel(record.answers);
  const generatedDate = new Date(record.createdAt).toLocaleDateString();

  function ensureSpace(needed: number) {
    if (y + needed > pageHeight - MARGIN - 24) return;
  }

  function text(
    value: string,
    opts: {
      size?: number;
      color?: [number, number, number];
      bold?: boolean;
      gap?: number;
    } = {},
  ) {
    const { size = 9, color = NAVY, bold = false, gap = 3 } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(value, maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(LINE);
      doc.text(line, MARGIN, y);
      y += LINE;
    }
    y += gap;
  }

  function labeled(label: string, value: string) {
    text(label, { size: 8, bold: true, gap: 0 });
    text(truncate(value || "Not recorded", 220), { size: 9, color: GRAY, gap: 4 });
  }

  function bullets(items: string[], max = 6) {
    for (const item of items.slice(0, max)) {
      const lines = doc.splitTextToSize(item, maxWidth - 14) as string[];
      lines.forEach((line, idx) => {
        ensureSpace(LINE);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.text(idx === 0 ? "☐" : "", MARGIN, y);
        doc.text(line, MARGIN + 12, y);
        y += LINE;
      });
    }
    y += 2;
  }

  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, pageWidth, 56, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`${BRAND.product} · Attorney brief · v${PACKET_PDF_VERSION}`, MARGIN, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 215, 230);
  doc.text(
    `${packetId} · ${generatedDate} · Preparation only — not legal advice`,
    MARGIN,
    40,
  );

  y = 72;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  const titleLines = doc.splitTextToSize(ideaLabel, maxWidth) as string[];
  for (const line of titleLines.slice(0, 2)) {
    doc.text(line, MARGIN, y);
    y += 16;
  }
  y += 4;

  if (options?.attorneyExport) {
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
    const bannerH = 36;
    doc.roundedRect(MARGIN - 4, y - 4, maxWidth + 8, bannerH, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(
      `Attorney export for: ${options.attorneyExport.exportedFor}`,
      MARGIN + 4,
      y + 10,
    );
    if (options.attorneyExport.inventorName) {
      doc.text(
        `Inventor: ${options.attorneyExport.inventorName}`,
        MARGIN + 4,
        y + 22,
      );
    }
    y += bannerH + 8;
  }

  text(truncate(profile.ideaSummary, 280), { gap: 6 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(`Readiness: ${review.readinessScore}/100 (preparation only)`, MARGIN, y);
  y += 12;
  const barW = maxWidth - 48;
  doc.setFillColor(MIST[0], MIST[1], MIST[2]);
  doc.roundedRect(MARGIN, y, barW, 8, 2, 2, "F");
  const fillW = Math.max(0, Math.min(barW, (barW * review.readinessScore) / 100));
  if (fillW > 0) {
    doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.roundedRect(MARGIN, y, fillW, 8, 2, 2, "F");
  }
  y += 18;

  const colW = (maxWidth - 12) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colW + 12;
  const rowStartY = y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text("Problem", leftX, rowStartY);
  doc.text("How it works", rightX, rowStartY);
  y = rowStartY + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  const problemLines = doc.splitTextToSize(truncate(handoff.problem, 160), colW) as string[];
  const howLines = doc.splitTextToSize(truncate(handoff.howItWorks, 160), colW) as string[];
  const rowLines = Math.max(problemLines.length, howLines.length);
  for (let i = 0; i < rowLines; i++) {
    if (problemLines[i]) doc.text(problemLines[i], leftX, y);
    if (howLines[i]) doc.text(howLines[i], rightX, y);
    y += 11;
  }
  y += 6;

  labeled("Key difference", handoff.differences);
  labeled("Prototype / materials", `${handoff.prototypeStatus} · ${handoff.materialsAvailable}`);

  if (profile.publicDisclosure) {
    text("Public disclosure indicated — review timing before broad sharing.", {
      size: 8,
      color: TEAL,
      bold: true,
      gap: 4,
    });
  }

  if (review.topGaps.length > 0) {
    text("Top gap", { size: 9, bold: true, gap: 2 });
    bullets(review.topGaps.slice(0, 2), 2);
  }

  text("Questions to bring", { size: 9, bold: true, gap: 2 });
  bullets(
    review.unansweredQuestions.length > 0
      ? review.unansweredQuestions
      : handoff.expertQuestions,
    4,
  );

  text("Next meeting checklist", { size: 9, bold: true, gap: 2 });
  bullets(buildNextMeetingChecklist(record, savedReferenceCount), 6);

  doc.setDrawColor(MIST[0], MIST[1], MIST[2]);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, pageHeight - 52, pageWidth - MARGIN, pageHeight - 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text(DISCLAIMER_SHORT, MARGIN, pageHeight - 38, { maxWidth });
  doc.text(LEGAL.pdfWatermark, MARGIN, pageHeight - 26, { maxWidth });
  doc.text(formatCopyrightNotice(), MARGIN, pageHeight - 14, { maxWidth });

  return doc;
}

export function downloadCondensedAttorneyPdf(
  record: ProjectRecord,
  savedReferences: SavedReference[] = [],
  options?: PdfExportOptions,
): void {
  const doc = buildCondensedAttorneyPdf(record, savedReferences, options);
  doc.save(`smartprobonoip-attorney-brief-${record.id.slice(0, 8)}.pdf`);
}
