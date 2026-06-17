import { jsPDF } from "jspdf";
import { BRAND } from "./brand";
import {
  RESOURCE_LABELS,
  SIGNAL_DESCRIPTIONS,
  SIGNAL_LABELS,
} from "./labels";
import type { ProjectRecord } from "./types";

const MARGIN = 48;
const LINE = 15;

const NAVY: [number, number, number] = [11, 31, 58];
const TEAL: [number, number, number] = [15, 133, 133];
const AMBER: [number, number, number] = [146, 64, 14];
const GRAY: [number, number, number] = [90, 105, 120];

export function buildProfilePdf(record: ProjectRecord): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  function ensureSpace(needed: number) {
    if (y + needed > pageHeight - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
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
    const { size = 10, color = NAVY, bold = false, gap = 4 } = opts;
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

  function heading(value: string) {
    ensureSpace(LINE + 10);
    y += 6;
    doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.setLineWidth(2);
    doc.line(MARGIN, y - 10, MARGIN + 24, y - 10);
    text(value, { size: 12, color: TEAL, bold: true, gap: 6 });
  }

  function bullets(items: string[], marker = "•") {
    if (items.length === 0) {
      text("None recorded.", { color: GRAY });
      return;
    }
    for (const item of items) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      const lines = doc.splitTextToSize(item, maxWidth - 16) as string[];
      lines.forEach((line, idx) => {
        ensureSpace(LINE);
        doc.text(idx === 0 ? marker : "", MARGIN, y);
        doc.text(line, MARGIN + 16, y);
        y += LINE;
      });
    }
    y += 4;
  }

  const profile = record.profile;

  // Header band
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`${BRAND.product}`, MARGIN, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(180, 200, 220);
  doc.text("IP Readiness Profile", MARGIN, 52);
  y = 96;

  text(
    `Generated ${new Date(record.createdAt).toLocaleString()} · ${
      profile.generator === "ai" ? "AI-assisted" : "Rule-based"
    } draft`,
    { size: 9, color: GRAY, gap: 8 },
  );

  heading("Plain-language summary");
  text(profile.ideaSummary);

  heading("Public sharing / disclosure flag");
  text(
    profile.publicDisclosure
      ? "Possible public disclosure detected."
      : "No public disclosure indicated.",
    { bold: true, color: profile.publicDisclosure ? AMBER : NAVY },
  );
  text(profile.publicDisclosureNote, { color: GRAY });

  heading("Possible IP category signals");
  for (const s of profile.signals) {
    text(SIGNAL_LABELS[s], { bold: true, gap: 1 });
    text(SIGNAL_DESCRIPTIONS[s], { color: GRAY });
  }

  heading("What information is complete");
  bullets(profile.completeInfo, "+");

  heading("What information is missing");
  bullets(profile.missingInfo, "-");

  heading("Suggested next step");
  text(profile.suggestedNextStep);

  heading("Questions to bring to an expert");
  bullets(profile.expertQuestions, "?");

  heading("Recommended resource categories");
  bullets(
    profile.recommendedResources.map((r) => RESOURCE_LABELS[r]),
    "•",
  );

  if (record.postClarity) {
    heading("Clarity check");
    text(
      `Before: ${record.preClarity}/5   After: ${record.postClarity}/5`,
      { color: TEAL, bold: true },
    );
  }

  heading("Important — please read");
  for (const para of profile.disclaimer.split("\n\n")) {
    text(para, { size: 9, color: AMBER });
  }

  return doc;
}

export function downloadProfilePdf(record: ProjectRecord): void {
  const doc = buildProfilePdf(record);
  doc.save(`smartprobonoip-readiness-profile-${record.id.slice(0, 8)}.pdf`);
}
