import { jsPDF } from "jspdf";
import {
  computeReadinessScore,
  computeReadinessScoreBreakdown,
} from "./attorneyExport";
import { BRAND } from "./brand";
import { PACKET_COPY } from "./copy";
import {
  PATENT_PATHWAY_INTRO,
  PATENT_PATHWAY_STAGES,
} from "./content/patentPathway";
import {
  RESOURCE_CATEGORIES_INTRO,
  RESOURCE_CATEGORY_TYPES,
} from "./content/resourceCategories";
import { stripUrlsFromText } from "./intakeValidation";
import {
  DISCLOSURE_KIND_LABELS,
  NDA_STATUS_LABELS,
  SEARCH_SOURCE_LABELS,
} from "./labels";
import {
  RESOURCE_DESCRIPTIONS,
  RESOURCE_LABELS,
} from "./labels";
import { SIGNAL_CATALOG } from "./signals";
import {
  buildDifferenceMap,
  buildExpertHandoff,
  buildFollowUpPlan,
  buildIdeaSummaryFields,
  buildMaterialsChecklist,
  buildMissingInfoStatus,
  buildNextBestSteps,
  buildPatentPrepChecklist,
  buildReadinessMetrics,
  buildReadinessSnapshot,
  DEVELOPMENT_TIMELINE_FIELDS,
  DIFFERENCE_MAP_NOTE,
  getIdeaLabel,
  getTimelineFieldValue,
  PATENT_PREP_INTRO,
  TIMELINE_NOTE,
} from "./packet";
import {
  buildPatentSearchPrep,
  buildSearchFirmQuestions,
  PATENT_SEARCH_PREP_INTRO,
  WORKSHEET_HEADERS,
} from "./patentSearchPrep";
import { getTriggeredMiniPrepSections } from "./miniPrepSections";
import { GAP_MAP_FIELD_LABELS } from "./research/gapMap";
import type { SavedReference } from "./research/types";
import type { ProjectRecord } from "./types";

export interface PdfExportOptions {
  attorneyExport?: {
    exportedFor: string;
    inventorName?: string;
    inventorEmail?: string;
  };
}

const MARGIN = 48;
const LINE = 15;

const NAVY: [number, number, number] = [11, 31, 58];
const TEAL: [number, number, number] = [15, 133, 133];
const CREAM: [number, number, number] = [250, 248, 244];
const MIST: [number, number, number] = [238, 242, 246];
const AMBER: [number, number, number] = [146, 64, 14];
const GRAY: [number, number, number] = [90, 105, 120];

function collectExpertReviewQuestions(savedReferences: SavedReference[]): string[] {
  const seen = new Set<string>();
  const questions: string[] = [];

  function addQuestion(raw: string) {
    raw
      .split(/\n+/)
      .map((line) => line.replace(/^[-•?\d.)\s]+/, "").trim())
      .filter(Boolean)
      .forEach((line) => {
        const key = line.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        questions.push(line);
      });
  }

  for (const ref of savedReferences) {
    if (ref.expertQuestions?.trim()) addQuestion(ref.expertQuestions);
    ref.gapMap?.output?.expertQuestions?.forEach((question) => addQuestion(question));
  }

  return questions.slice(0, 20);
}

function drawBrandMarkPdf(doc: jsPDF, cx: number, cy: number, scale = 1) {
  const s = scale;
  doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setLineWidth(1.5 * s);

  doc.setFillColor(MIST[0], MIST[1], MIST[2]);
  doc.roundedRect(cx + 10 * s, cy + 14 * s, 30 * s, 30 * s, 1.5 * s, 1.5 * s, "FD");

  doc.setFillColor(CREAM[0], CREAM[1], CREAM[2]);
  doc.roundedRect(cx + 6 * s, cy + 10 * s, 30 * s, 30 * s, 1.5 * s, 1.5 * s, "FD");

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cx + 2 * s, cy + 6 * s, 30 * s, 30 * s, 1.5 * s, 1.5 * s, "FD");

  doc.setFillColor(CREAM[0], CREAM[1], CREAM[2]);
  doc.rect(cx + 2 * s, cy + 6 * s, 10 * s, 5 * s, "F");
  doc.rect(cx + 2 * s, cy + 6 * s, 10 * s, 5 * s, "S");

  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(1.25 * s);
  doc.setFillColor(230, 246, 246);
  doc.roundedRect(cx + 7 * s, cy + 17 * s, 17 * s, 11 * s, 1 * s, 1 * s, "FD");

  doc.setFillColor(217, 119, 6);
  doc.circle(cx + 21.5 * s, cy + 19.5 * s, 1.25 * s, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5 * s);
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text("IP", cx + 15.5 * s, cy + 25.5 * s, { align: "center" });

  doc.setDrawColor(20, 163, 163);
  doc.setLineWidth(2 * s);
  doc.line(cx + 2 * s, cy + 34 * s, cx + 32 * s, cy + 34 * s);
}

export function buildPacketPdf(
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
    ensureSpace(LINE + 14);
    y += 8;
    doc.setFillColor(MIST[0], MIST[1], MIST[2]);
    doc.rect(MARGIN, y - 12, maxWidth, 1, "F");
    doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.setLineWidth(2);
    doc.line(MARGIN, y - 8, MARGIN + 28, y - 8);
    text(value, { size: 13, color: TEAL, bold: true, gap: 8 });
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
    const drawOpenCircle = marker === "o";
    for (const item of items) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      const lines = doc.splitTextToSize(item, maxWidth - 16) as string[];
      lines.forEach((line, idx) => {
        ensureSpace(LINE);
        if (idx === 0) {
          if (drawOpenCircle) {
            doc.setDrawColor(GRAY[0], GRAY[1], GRAY[2]);
            doc.setLineWidth(0.75);
            doc.circle(MARGIN + 3, y - 3, 2.4, "S");
          } else {
            doc.text(marker, MARGIN, y);
          }
        }
        doc.text(line, MARGIN + 16, y);
        y += LINE;
      });
    }
    y += 4;
  }

  function numberedList(items: string[]) {
    items.forEach((item, idx) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      const lines = doc.splitTextToSize(item, maxWidth - 20) as string[];
      lines.forEach((line, lineIdx) => {
        ensureSpace(LINE);
        if (lineIdx === 0) {
          doc.setFont("helvetica", "bold");
          doc.text(`${idx + 1}.`, MARGIN, y);
          doc.setFont("helvetica", "normal");
        }
        doc.text(line, MARGIN + 20, y);
        y += LINE;
      });
    });
    y += 4;
  }

  function drawChecklistRow(
    label: string,
    complete: boolean,
    opts: { bold?: boolean; gap?: number } = {},
  ) {
    const { bold = false, gap = 2 } = opts;
    const boxSize = 8;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(10);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    const lines = doc.splitTextToSize(label, maxWidth - 18) as string[];
    lines.forEach((line, idx) => {
      ensureSpace(LINE);
      if (idx === 0) {
        const boxTop = y - boxSize + 1;
        doc.setDrawColor(
          complete ? TEAL[0] : GRAY[0],
          complete ? TEAL[1] : GRAY[1],
          complete ? TEAL[2] : GRAY[2],
        );
        doc.setLineWidth(1);
        doc.rect(MARGIN, boxTop, boxSize, boxSize, "S");
        if (complete) {
          doc.setLineWidth(1.2);
          doc.line(
            MARGIN + 1.8,
            boxTop + 4.2,
            MARGIN + 3.4,
            boxTop + 6.2,
          );
          doc.line(
            MARGIN + 3.4,
            boxTop + 6.2,
            MARGIN + 6.4,
            boxTop + 1.8,
          );
        }
      }
      doc.text(line, MARGIN + 16, y);
      y += LINE;
    });
    y += gap;
  }

  const profile = record.profile;
  const missingStatus = buildMissingInfoStatus(record, savedReferenceCount);
  const readinessMetrics = buildReadinessMetrics(record, savedReferenceCount);
  const nextBestSteps = buildNextBestSteps(record, savedReferenceCount);
  const scoreBreakdown = computeReadinessScoreBreakdown(
    record,
    savedReferenceCount,
  );
  const disclosureEvents = record.answers.disclosureEvents ?? [];
  const ideaLabel = stripUrlsFromText(getIdeaLabel(record.answers));

  // ---------------------------------------------------------------------------
  // 1. Cover page
  // ---------------------------------------------------------------------------
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  drawBrandMarkPdf(doc, pageWidth / 2 - 37, 130, 2.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const wordmarkLeft = "SmartProBono";
  const wordmarkRight = "IP";
  const leftWidth = doc.getTextWidth(wordmarkLeft);
  const wordmarkX = pageWidth / 2 - (leftWidth + doc.getTextWidth(wordmarkRight)) / 2;
  doc.setTextColor(255, 255, 255);
  doc.text(wordmarkLeft, wordmarkX, 228);
  doc.setTextColor(120, 220, 220);
  doc.text(wordmarkRight, wordmarkX + leftWidth, 228);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 215);
  doc.text(BRAND.feature.toUpperCase(), pageWidth / 2, 246, { align: "center" });

  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text("IP Readiness Packet", pageWidth / 2, 286, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(200, 215, 230);
  const labelLines = doc.splitTextToSize(ideaLabel, maxWidth - 40) as string[];
  let cy = 336;
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

  if (options?.attorneyExport) {
    const bannerLines = [
      "ATTORNEY EXPORT — PREPARATION ONLY. NOT LEGAL ADVICE.",
      `Prepared for: ${options.attorneyExport.exportedFor}`,
      options.attorneyExport.inventorName
        ? `Inventor name (user-provided): ${options.attorneyExport.inventorName}`
        : null,
      options.attorneyExport.inventorEmail
        ? `Inventor email (user-provided): ${options.attorneyExport.inventorEmail}`
        : null,
      "CPC suggestions and readiness scores are conversation starters only — not legal conclusions.",
    ].filter(Boolean) as string[];

    ensureSpace(bannerLines.length * 14 + 24);
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(AMBER[0], AMBER[1], AMBER[2]);
    const bannerHeight = bannerLines.length * 13 + 16;
    doc.roundedRect(MARGIN - 4, y - 6, maxWidth + 8, bannerHeight, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(AMBER[0], AMBER[1], AMBER[2]);
    let bannerY = y + 6;
    for (const line of bannerLines) {
      doc.text(line, MARGIN + 4, bannerY);
      bannerY += 13;
    }
    y = bannerY + 10;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  }

  // 2. Plain-language idea summary
  heading("Plain-language idea summary");
  text(profile.ideaSummary, { gap: 6 });
  for (const field of buildIdeaSummaryFields(record.answers)) {
    labeledBlock(field.label, field.value);
  }

  // 3. Readiness snapshot
  heading(PACKET_COPY.readinessSnapshotTitle);
  const organizationScore = computeReadinessScore(record, savedReferenceCount);
  text(`Organization score: ${organizationScore} / 100`, {
    size: 11,
    bold: true,
    color: TEAL,
    gap: 2,
  });
  text(
    "Measures packet organization only — not legal merit, patentability, or clearance.",
    { size: 9, color: GRAY, gap: 2 },
  );
  for (const entry of scoreBreakdown) {
    text(
      `${entry.label}: ${Math.round(entry.points)} of ${
        entry.max <= 9 ? `+${entry.max}` : entry.max
      }`,
      { size: 9, color: GRAY, gap: 1 },
    );
  }
  y += 5;
  if (profile.signals.length > 0) {
    text(PACKET_COPY.signalsSection, { size: 10, bold: true, gap: 1 });
    for (const s of profile.signals) {
      const guide = SIGNAL_CATALOG[s];
      text(guide.label, { bold: true, gap: 1 });
      text(`Why it may matter: ${guide.whyItMatters}`, { color: GRAY, gap: 1 });
      text(`What to prepare: ${guide.whatToPrepare}`, { color: GRAY, gap: 1 });
      text(`Suggested resource type: ${guide.suggestedResourceType}`, {
        color: GRAY,
        gap: 4,
      });
    }
  }
  for (const item of buildReadinessSnapshot(record)) {
    labeledBlock(
      item.label,
      item.value,
    );
  }

  // 4. Missing information checklist
  heading(PACKET_COPY.missingInfoTitle);
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

  if (disclosureEvents.length > 0) {
    text("Sharing events you recorded", { size: 10, bold: true, gap: 4 });
    disclosureEvents.forEach((event, idx) => {
      const kindLabel = event.kind
        ? DISCLOSURE_KIND_LABELS[event.kind]
        : "Not specified";
      text(`Event ${idx + 1} — ${kindLabel}`, {
        size: 10,
        bold: true,
        color: TEAL,
        gap: 1,
      });
      const rows: [string, string | undefined][] = [
        ["Approximate date", event.approximateDate],
        ["Where shown", event.whereShown],
        ["Who saw it", event.whoSawIt],
        ["What was shown", event.whatWasShown],
        [
          "NDA or confidentiality",
          event.ndaOrConfidentiality
            ? NDA_STATUS_LABELS[event.ndaOrConfidentiality]
            : undefined,
        ],
        [
          "Included key features",
          event.includedKeyFeatures
            ? NDA_STATUS_LABELS[event.includedKeyFeatures]
            : undefined,
        ],
      ];
      for (const [label, value] of rows) {
        text(`${label}: ${value?.trim() || "Not recorded"}`, {
          size: 9,
          color: GRAY,
          gap: 1,
        });
      }
      y += 4;
    });
    text(PACKET_COPY.disclosureGuidance, { size: 9, color: AMBER, gap: 6 });
  }

  // 6. Expert conversation prep
  heading(PACKET_COPY.expertPrepTitle);
  bullets(profile.expertQuestions, "?");

  for (const section of getTriggeredMiniPrepSections(record)) {
    heading(section.title);
    text(section.subtitle, { size: 9, color: GRAY, gap: 4 });
    labeledBlock("Why this may matter", section.whyItMatters);
    text("What to gather", { size: 10, bold: true, gap: 2 });
    bullets(section.whatToGather, "•");
    if (section.personalizedNotes) {
      for (const note of section.personalizedNotes) {
        labeledBlock(note.label, note.value);
      }
    }
    text("Questions to ask", { size: 10, bold: true, gap: 2 });
    bullets(section.questionsToAsk, "?");
    labeledBlock("Suggested resource type", section.suggestedResourceType);
    text(section.disclaimer, { size: 9, color: GRAY, gap: 6 });
  }

  // 7. Suggested next resources
  heading(PACKET_COPY.resourcesTitle);
  for (const r of profile.recommendedResources) {
    text(RESOURCE_LABELS[r], { bold: true, gap: 1 });
    text(RESOURCE_DESCRIPTIONS[r], { color: GRAY });
  }

  text("Other resource types that exist", { size: 10, bold: true, gap: 2 });
  text(RESOURCE_CATEGORIES_INTRO, { size: 9, color: GRAY, gap: 4 });
  for (const category of RESOURCE_CATEGORY_TYPES) {
    text(category.title, { size: 10, bold: true, gap: 1 });
    text(category.description, { size: 9, color: GRAY, gap: 3 });
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
  text(PACKET_COPY.patentPrepTitle, { size: 14, color: NAVY, bold: true, gap: 2 });
  text(PATENT_PREP_INTRO, { size: 9, color: GRAY, gap: 6 });

  // Patent prep checklist
  heading("Patent prep checklist");
  for (const row of buildPatentPrepChecklist(record)) {
    drawChecklistRow(row.label, row.complete, { bold: true, gap: 1 });
    if (row.value) text(row.value, { size: 10, color: GRAY, gap: 6 });
  }

  // Development timeline (fillable)
  heading("Development timeline");
  text(TIMELINE_NOTE, { size: 9, color: GRAY, gap: 6 });
  for (const field of DEVELOPMENT_TIMELINE_FIELDS) {
    text(`${field}:`, { size: 10, bold: true, gap: 1 });
    const value = getTimelineFieldValue(record.developmentTimeline, field);
    text(value || "Not recorded yet", { size: 10, color: GRAY, gap: 6 });
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
    drawChecklistRow(item.label, item.available, { gap: 2 });
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
  text(PACKET_COPY.similarRefPrepTitle, { size: 14, color: NAVY, bold: true, gap: 2 });
  text(PATENT_SEARCH_PREP_INTRO, { size: 9, color: GRAY, gap: 6 });

  const searchReadiness = record.answers.searchReadiness;
  const searchReadinessRows: [string, string][] = [];
  if (searchReadiness) {
    const textEntries: [string, string | undefined][] = [
      ["Key features", searchReadiness.keyFeatures],
      ["What feels new", searchReadiness.whatFeelsNew],
      ["Closest existing products", searchReadiness.closestProducts],
      ["Customer search terms", searchReadiness.customerSearchTerms],
      ["Technical or industry terms", searchReadiness.technicalSearchTerms],
      ["Possible industries", searchReadiness.possibleIndustries],
      [
        "Materials, mechanisms, steps, or workflows",
        searchReadiness.materialsMechanismsSteps,
      ],
      [
        "Similar references already found",
        searchReadiness.similarReferencesFound,
      ],
    ];
    for (const [label, value] of textEntries) {
      if (value?.trim()) searchReadinessRows.push([label, value.trim()]);
    }
    const sources = searchReadiness.sourcesAlreadySearched ?? [];
    if (sources.length > 0) {
      searchReadinessRows.push([
        "Sources already searched",
        sources.map((source) => SEARCH_SOURCE_LABELS[source] ?? source).join(", "),
      ]);
    }
  }

  if (searchReadinessRows.length > 0) {
    heading(PACKET_COPY.searchReadinessTitle);
    text(PACKET_COPY.searchReadinessSubtitle, { size: 9, color: GRAY, gap: 4 });
    for (const [label, value] of searchReadinessRows) {
      labeledBlock(label, value);
    }
  }

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

  heading(PACKET_COPY.searchFirmQuestionsTitle);
  text(PACKET_COPY.searchFirmQuestionsSubtitle, {
    size: 9,
    color: GRAY,
    gap: 4,
  });
  bullets(buildSearchFirmQuestions(record), "?");

  text(searchPrep.safeDisclaimer, { size: 9, color: AMBER, gap: 6 });

  if (savedReferences.length > 0) {
    heading(PACKET_COPY.savedSimilarReferencesTitle);
    text(
      "User-saved possible similar references — not a legal conclusion about patentability, novelty, clearance, or infringement.",
      { size: 9, color: GRAY, gap: 4 },
    );
    savedReferences.forEach((ref, idx) => {
      text(`Reference ${idx + 1}: ${ref.title}`, { size: 10, bold: true, gap: 2 });
      if (ref.referenceType) {
        text(`Type: ${ref.referenceType}`, { size: 9, color: GRAY, gap: 1 });
      }
      if (ref.url) text(`Link: ${ref.url}`, { size: 9, gap: 1 });
      if (ref.searchQueryUsed) {
        labeledBlock("Search query used", ref.searchQueryUsed);
      }
      if (ref.looksSimilar) labeledBlock("What looks similar", ref.looksSimilar);
      if (ref.seemsDifferent) {
        labeledBlock("What seems different", ref.seemsDifferent);
      }
      if (ref.expertQuestions) {
        labeledBlock("Questions to ask an expert", ref.expertQuestions);
      }
      if (ref.notes) labeledBlock("Notes", ref.notes);
    });
  }

  const refsWithGapMap = savedReferences.filter((ref) => {
    const fields = ref.gapMap?.fields;
    if (!fields) return false;
    return Object.values(fields).some((value) => value?.trim());
  });

  if (refsWithGapMap.length > 0) {
    heading("Gap Map");
    text(
      "User-completed gap map prep — preparation only, not a legal conclusion about patentability, clearance, or infringement.",
      { size: 9, color: GRAY, gap: 4 },
    );
    refsWithGapMap.forEach((ref, idx) => {
      text(`Reference ${idx + 1}: ${ref.title}`, { size: 10, bold: true, gap: 2 });
      for (const { key, label } of GAP_MAP_FIELD_LABELS) {
        const value = ref.gapMap?.fields?.[key]?.trim();
        if (value) labeledBlock(label, value);
      }
      const output = ref.gapMap?.output;
      if (output) {
        if (output.possibleSimilarity.length > 0) {
          text("Possible similarity", { size: 10, bold: true, gap: 1 });
          bullets(output.possibleSimilarity, "~");
        }
        if (output.possibleDifference.length > 0) {
          text("Possible difference to clarify", { size: 10, bold: true, gap: 1 });
          bullets(output.possibleDifference, "~");
        }
        if (output.documentNext.length > 0) {
          text("What to document next", { size: 10, bold: true, gap: 1 });
          bullets(output.documentNext, "~");
        }
      }
    });
  }

  const expertReviewQuestions = collectExpertReviewQuestions(savedReferences);
  if (expertReviewQuestions.length > 0) {
    heading("Questions for Expert Review");
    text(
      "Questions you wrote while preparing — bring these to a patent professional, clinic, or mentor.",
      { size: 9, color: GRAY, gap: 4 },
    );
    bullets(expertReviewQuestions, "?");
  }

  // Optional clarity check
  if (record.postClarity) {
    heading("Clarity check");
    text(`Before: ${record.preClarity}/5   After: ${record.postClarity}/5`, {
      color: TEAL,
      bold: true,
    });
  }

  // Readiness metrics
  heading(PACKET_COPY.readinessSnapshotTitle);
  for (const metric of readinessMetrics) {
    labeledBlock(metric.label, metric.value);
  }

  // Common preparation pathway
  heading(PACKET_COPY.pathwayTitle);
  text(PATENT_PATHWAY_INTRO, { size: 9, color: GRAY, gap: 4 });
  numberedList(
    PATENT_PATHWAY_STAGES.map(
      (stage) => `${stage.title} — ${stage.description}`,
    ),
  );

  // Next best steps
  heading(PACKET_COPY.nextBestStepTitle);
  numberedList(nextBestSteps);

  // Full legal disclaimer
  heading("Important — please read");
  for (const para of profile.disclaimer.split("\n\n")) {
    text(para, { size: 9, color: AMBER });
  }

  // Single subtle footer per page — keeps extracted text clean (one line per
  // page instead of repeated inline disclaimer marks).
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    if (page === 1) {
      // Cover page has a navy background; use a lighter tone.
      doc.setTextColor(150, 170, 190);
    } else {
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    }
    doc.text(
      `Preparation only — not legal advice · SmartProBonoIP · page ${page} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 24,
      { align: "center" },
    );
  }

  return doc;
}

export function downloadPacketPdf(
  record: ProjectRecord,
  savedReferences: SavedReference[] = [],
  options?: PdfExportOptions,
): void {
  const doc = buildPacketPdf(record, savedReferences, options);
  doc.save(`smartprobonoip-ip-readiness-packet-${record.id.slice(0, 8)}.pdf`);
}
