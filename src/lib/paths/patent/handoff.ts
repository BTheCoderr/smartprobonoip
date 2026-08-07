import { buildExpertHandoff, getTimelineFieldValue, type ExpertHandoff } from "@/lib/packet";
import { normalizeAnswersForPacket } from "@/lib/intakeValidation";
import {
  AI_ASSISTANCE_LABELS,
  CONTRIBUTOR_INVOLVEMENT_LABELS,
} from "@/lib/labels";
import type { ProjectRecord } from "@/lib/types";
import { buildAiPreparationToolRecord } from "./preparationRecord";

/**
 * Professional handoff brief for the patent path.
 * Field order aligned with common invention disclosure form conventions.
 */
export interface PatentProfessionalBrief extends ExpertHandoff {
  inventionTitle: string;
  preferredEmbodiment: string;
  alternativeVersions: string;
  knownSimilarWork: string;
  aiAssistanceSummary: string;
  preparationToolRecord: string | null;
  disclosurePrepNote: string;
  inventorshipPrepNote: string;
  idfSections: { heading: string; body: string }[];
}

function buildInventorsSummary(record: ProjectRecord): string {
  const { answers } = record;
  const involvement = answers.contributorsInvolved;
  const involvementLabel = involvement
    ? (CONTRIBUTOR_INVOLVEMENT_LABELS[involvement] ?? involvement.replace(/_/g, " "))
    : "Not specified";
  const helpTypes = (answers.contributorHelpTypes ?? [])
    .map((type) => type.replace(/_/g, " "))
    .join(", ");
  const agreement = answers.agreementStatus?.replace(/_/g, " ") ?? "not specified";
  const institution = answers.institutionRelationship?.replace(/_/g, " ") ?? "not specified";
  const notes = answers.ownershipNotes?.trim();

  const parts = [
    `Contributor involvement: ${involvementLabel}.`,
    helpTypes ? `Help types noted: ${helpTypes}.` : null,
    `Written agreements: ${agreement}.`,
    `Employer / school / grant context: ${institution}.`,
    notes ? `Timeline / ownership notes: ${notes}` : null,
  ].filter(Boolean);

  return parts.join(" ");
}

function buildKeyDatesSummary(record: ProjectRecord): string {
  const timeline = record.developmentTimeline;
  const rows = [
    ["Conception / idea started", "Date idea started"],
    ["First written or sketched", "Date first written down or sketched"],
    ["First prototype", "Date first prototype built"],
    ["First shared publicly", "Date first shared publicly"],
    ["First pitched or demoed", "Date first pitched, sold, or demoed"],
  ] as const;

  const filled = rows
    .map(([label, field]) => {
      const value = getTimelineFieldValue(timeline, field);
      return value ? `${label}: ${value}` : null;
    })
    .filter(Boolean);

  return filled.length > 0 ? filled.join("; ") : "No development dates recorded yet.";
}

export function buildPatentProfessionalBrief(
  record: ProjectRecord,
): PatentProfessionalBrief {
  const base = buildExpertHandoff(record);
  const answers = normalizeAnswersForPacket(record.answers);
  const title =
    answers.inventionTitle?.trim() ||
    answers.brandName?.trim() ||
    "Untitled invention (title not provided)";

  const aiLabel = answers.aiAssistance
    ? AI_ASSISTANCE_LABELS[answers.aiAssistance]
    : "Not answered";
  const aiNotes = answers.aiAssistanceNotes?.trim();
  const aiAssistanceSummary = aiNotes
    ? `${aiLabel}. Notes: ${aiNotes}`
    : aiLabel;

  const preferred =
    answers.preferredEmbodiment?.trim() || "Not yet described.";
  const alternatives =
    answers.alternativeVersions?.trim() || "Not yet described.";
  const similar =
    answers.knownSimilarWork?.trim() ||
    answers.searchReadiness?.closestProducts?.trim() ||
    "Not yet described.";

  const disclosurePrepNote = record.profile.publicDisclosure
    ? "Public or uncertain sharing was noted. Review disclosure events and dates with a professional before broader sharing or filing decisions."
    : "No public sharing channels were flagged in intake. Still confirm private demos and approximate dates with a professional.";

  const inventorshipPrepNote =
    "Inventorship and ownership are separate topics. Use contributor, agreement, institution, and AI-assistance notes as discussion material only — not determinations.";

  const inventorsSummary = buildInventorsSummary(record);
  const keyDates = buildKeyDatesSummary(record);
  const preparationToolRecord = buildAiPreparationToolRecord(record);

  const idfSections = [
    { heading: "Title", body: title },
    { heading: "Inventors / contributors", body: inventorsSummary },
    { heading: "Problem", body: base.problem },
    { heading: "Solution", body: base.idea },
    { heading: "How it works", body: base.howItWorks },
    { heading: "Key features / components", body: base.mainComponents },
    { heading: "Alternatives and variations", body: alternatives },
    {
      heading: "User-described differences vs similar work",
      body: base.differences,
    },
    { heading: "Similar work already known", body: similar },
    { heading: "Preferred / best-described version", body: preferred },
    { heading: "Prior disclosures (sharing timeline)", body: base.publicSharingTimeline },
    { heading: "Materials and prototype", body: `${base.prototypeStatus}. ${base.materialsAvailable}` },
    { heading: "Key dates", body: keyDates },
    {
      heading: "Generative AI use while creating the invention (inventor notes)",
      body: aiAssistanceSummary,
    },
  ];

  return {
    ...base,
    inventionTitle: title,
    preferredEmbodiment: preferred,
    alternativeVersions: alternatives,
    knownSimilarWork: similar,
    aiAssistanceSummary,
    preparationToolRecord,
    disclosurePrepNote,
    inventorshipPrepNote,
    idfSections,
  };
}
