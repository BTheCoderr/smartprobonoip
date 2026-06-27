import { jsPDF } from "jspdf";
import { BRAND } from "./brand";
import {
  RESOURCE_DESCRIPTIONS,
  RESOURCE_LABELS,
  SIGNAL_DESCRIPTIONS,
  SIGNAL_LABELS,
} from "./labels";
import {
  buildDifferenceMap,
  buildExpertHandoff,
  buildFollowUpPlan,
  buildIdeaSummaryFields,
  buildMaterialsChecklist,
  buildMissingInfoStatus,
  buildNextBestAction,
  buildPatentPrepChecklist,
  buildReadinessMetrics,
  buildReadinessSnapshot,
  DEVELOPMENT_TIMELINE_FIELDS,
  DIFFERENCE_MAP_NOTE,
  getIdeaLabel,
  PATENT_PREP_INTRO,
  TIMELINE_NOTE,
} from "./packet";
import {
  buildPatentSearchPrep,
  PATENT_SEARCH_PREP_INTRO,
  WORKSHEET_HEADERS,
} from "./patentSearchPrep";
import type { ProjectRecord } from "./types";

const MARGIN = 48;
const LINE = 15;

const NAVY: [number, number, number] = [11, 31, 58];
const TEAL: [number, number, number] = [15, 133, 133];
const AMBER: [number, number, number] = [146, 64, 14];
const GRAY: [number, number, number] = [90, 105, 120];

export function buildPacketPdf(
  record: ProjectRecord,
  savedReferenceCount = 0,
): jsPDF {
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

  function labeledBlock(label: string, value: string) {
    text(label, { size: 10, color: NAVY, bold: true, gap: 1 });
    text(value, { size: 10, color: GRAY, gap: 6 });
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
  const missingStatus = buildMissingInfoStatus(record, savedReferenceCount);
  const readinessMetrics = buildReadinessMetrics(record, savedReferenceCount);
  const nextBestAction = buildNextBestAction(record, savedReferenceCount);
  const ideaLabel = getIdeaLabel(record.answers);

  // ---------------------------------------------------------------------------
  // 1. Cover page
  // ---------------------------------------------------------------------------
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(120, 220, 220);
  doc.text(BRAND.product.toUpperCase(), pageWidth / 2, 200, { align: "center" });

  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text("IP Readiness Packet", pageWidth / 2, 250, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(200, 215, 230);
  const labelLines = doc.splitTextToSize(ideaLabel, maxWidth - 40) as string[];
  let cy = 300;
  for (const line of labelLines) {
    doc.text(line, pageWidth / 2, cy, { align: "center" });
    cy += 20;
  }

  doc.setFontSize(10);
  doc.setTextColor(150, 170, 190);
  doc.text(
    `Generated ${new Date(record.createdAt).toLocaleDateString()}`,
    pageWidth / 2,
    cy + 16,
    { align: "center" },
  );

  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 40, cy + 36, pageWidth / 2 + 40, cy + 36);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(220, 230, 240);
  doc.text(
    "Educational readiness tool. Not legal advice.",
    pageWidth / 2,
    pageHeight - 80,
    { align: "center" },
  );

  // ---------------------------------------------------------------------------
  // Body
  // ---------------------------------------------------------------------------
  doc.addPage();
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`${BRAND.product}`, MARGIN, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(180, 200, 220);
  doc.text("IP Readiness Packet", MARGIN, 52);
  y = 96;

  text(
    `Generated ${new Date(record.createdAt).toLocaleString()} · ${
      profile.generator === "ai" ? "AI-assisted" : "Rule-based"
    } draft`,
    { size: 9, color: GRAY, gap: 8 },
  );

  // 2. Plain-language idea summary
  heading("Plain-language idea summary");
  text(profile.ideaSummary, { gap: 6 });
  for (const field of buildIdeaSummaryFields(record.answers)) {
    labeledBlock(field.label, field.value);
  }

  // 3. Readiness snapshot
  heading("Readiness snapshot");
  if (profile.signals.length > 0) {
    text("Possible IP signals", { size: 10, bold: true, gap: 1 });
    for (const s of profile.signals) {
      text(SIGNAL_LABELS[s], { bold: true, gap: 1 });
      text(SIGNAL_DESCRIPTIONS[s], { color: GRAY });
    }
  }
  for (const item of buildReadinessSnapshot(record)) {
    labeledBlock(
      item.label,
      item.value,
    );
  }

  // 4. Missing information checklist
  heading("Missing information checklist");
  text(missingStatus.statusMessage, { bold: true, gap: 4 });
  if (missingStatus.coreMissing.length > 0) {
    text("Core intake", { size: 10, bold: true, gap: 2 });
    bullets(missingStatus.coreMissing, "-");
  }
  if (missingStatus.optionalGaps.length > 0) {
    text("Optional prep areas", { size: 10, bold: true, gap: 2 });
    bullets(missingStatus.optionalGaps, "o");
  }

  // 5. Public sharing / disclosure note
  heading("Public sharing / disclosure note");
  text(
    profile.publicDisclosure
      ? "Possible public disclosure detected."
      : "No public disclosure indicated.",
    { bold: true, color: profile.publicDisclosure ? AMBER : NAVY },
  );
  text(profile.publicDisclosureNote, { color: GRAY });

  // 6. Expert conversation prep
  heading("Expert conversation prep — questions to bring to an expert");
  bullets(profile.expertQuestions, "?");

  // 7. Suggested next resources
  heading("Suggested next resources");
  for (const r of profile.recommendedResources) {
    text(RESOURCE_LABELS[r], { bold: true, gap: 1 });
    text(RESOURCE_DESCRIPTIONS[r], { color: GRAY });
  }

  // 8. 30/60/90 day follow-up plan
  heading("30 / 60 / 90 day follow-up plan");
  for (const step of buildFollowUpPlan()) {
    text(`${step.window} — ${step.title}`, { bold: true, color: TEAL, gap: 2 });
    bullets(step.actions, "•");
  }

  // ---------------------------------------------------------------------------
  // Patent Prep Mode
  // ---------------------------------------------------------------------------
  doc.addPage();
  y = MARGIN;
  text("Patent Prep Mode", { size: 14, color: NAVY, bold: true, gap: 2 });
  text(PATENT_PREP_INTRO, { size: 9, color: GRAY, gap: 6 });

  // Patent prep checklist
  heading("Patent prep checklist");
  for (const row of buildPatentPrepChecklist(record)) {
    text(`${row.complete ? "[x]" : "[ ]"} ${row.label}`, {
      size: 10,
      bold: true,
      gap: 1,
    });
    if (row.value) text(row.value, { size: 10, color: GRAY, gap: 6 });
  }

  // Development timeline (fillable)
  heading("Development timeline");
  text(TIMELINE_NOTE, { size: 9, color: GRAY, gap: 6 });
  for (const field of DEVELOPMENT_TIMELINE_FIELDS) {
    text(`${field}:`, { size: 10, bold: true, gap: 1 });
    text("________________________________", { size: 10, color: GRAY, gap: 6 });
  }

  // Possible difference map
  heading("Possible difference map");
  buildDifferenceMap(record).forEach((row, idx) => {
    text(`Row ${idx + 1}`, { size: 10, bold: true, color: TEAL, gap: 1 });
    labeledBlock("Existing option / current approach", row.existing);
    labeledBlock("What my idea does differently", row.difference);
    labeledBlock("Why that difference matters", row.whyItMatters);
  });
  text(DIFFERENCE_MAP_NOTE, { size: 9, color: AMBER, gap: 6 });

  // Drawings and materials checklist
  heading("Drawings and materials checklist");
  for (const item of buildMaterialsChecklist(record)) {
    text(`${item.available ? "[x]" : "[ ]"} ${item.label}`, {
      size: 10,
      gap: 2,
    });
  }

  // Expert handoff summary
  const handoff = buildExpertHandoff(record);
  heading("Expert handoff summary");
  text(
    "For review by a patent agent, patent attorney, clinic, mentor, or innovation partner.",
    { size: 9, color: GRAY, gap: 6 },
  );
  labeledBlock("Idea", handoff.idea);
  labeledBlock("Problem", handoff.problem);
  labeledBlock("How it works", handoff.howItWorks);
  labeledBlock("Main components", handoff.mainComponents);
  labeledBlock("User-described differences", handoff.differences);
  labeledBlock("Prototype status", handoff.prototypeStatus);
  labeledBlock("Public sharing timeline", handoff.publicSharingTimeline);
  labeledBlock("Materials available", handoff.materialsAvailable);
  text("Questions for expert review", { size: 10, bold: true, gap: 2 });
  bullets(handoff.expertQuestions, "?");

  // Similar Patent Discovery Prep
  const searchPrep = buildPatentSearchPrep(record);
  doc.addPage();
  y = MARGIN;
  text("Similar Patent Discovery Prep", { size: 14, color: NAVY, bold: true, gap: 2 });
  text(PATENT_SEARCH_PREP_INTRO, { size: 9, color: GRAY, gap: 6 });

  heading("Search keywords");
  text(searchPrep.searchKeywords.join(", ") || "Add more detail to your packet to generate keywords.", {
    size: 10,
    gap: 6,
  });

  heading("Suggested search queries");
  bullets(searchPrep.suggestedQueries, "•");

  heading("External search links");
  for (const link of searchPrep.externalSearchLinks) {
    text(`${link.label}: ${link.url}`, { size: 10, gap: 1 });
    text(`Suggested query: ${link.queryHint}`, { size: 9, color: GRAY, gap: 6 });
  }

  heading("Similar reference worksheet");
  searchPrep.worksheetRows.forEach((row, idx) => {
    text(`Reference ${idx + 1}`, { size: 10, bold: true, color: TEAL, gap: 1 });
    labeledBlock(WORKSHEET_HEADERS[0], row.searchQueryUsed);
    labeledBlock(WORKSHEET_HEADERS[1], row.referenceFound);
    labeledBlock(WORKSHEET_HEADERS[2], row.looksSimilar);
    labeledBlock(WORKSHEET_HEADERS[3], row.seemsDifferent);
    labeledBlock(WORKSHEET_HEADERS[4], row.questionsForExpert);
  });

  heading("Expert prep questions");
  bullets(searchPrep.expertPrepQuestions, "?");

  text(searchPrep.safeDisclaimer, { size: 9, color: AMBER, gap: 6 });

  // Optional clarity check
  if (record.postClarity) {
    heading("Clarity check");
    text(`Before: ${record.preClarity}/5   After: ${record.postClarity}/5`, {
      color: TEAL,
      bold: true,
    });
  }

  // Readiness metrics
  heading("Readiness Metrics");
  text("Preparation only — not legal outcomes.", { size: 9, color: GRAY, gap: 4 });
  for (const metric of readinessMetrics) {
    labeledBlock(metric.label, metric.value);
  }

  // Next best action
  heading("Next Best Action");
  text(nextBestAction, { gap: 6 });

  // Full legal disclaimer
  heading("Important — please read");
  for (const para of profile.disclaimer.split("\n\n")) {
    text(para, { size: 9, color: AMBER });
  }

  return doc;
}

export function downloadPacketPdf(record: ProjectRecord): void {
  const doc = buildPacketPdf(record);
  doc.save(`smartprobonoip-ip-readiness-packet-${record.id.slice(0, 8)}.pdf`);
}
