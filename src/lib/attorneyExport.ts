import {
  AI_ASSISTANCE_LABELS,
  CONTRIBUTOR_INVOLVEMENT_LABELS,
  RESOURCE_LABELS,
  SHARING_LABELS,
} from "./labels";
import { buildAttorneyExportDisclaimer } from "./disclaimer";
import { suggestCpcCodes } from "./cpcSuggestions";
import {
  buildDifferenceMap,
  buildMaterialsChecklist,
  buildMissingInfoStatus,
  buildPatentPrepChecklist,
  getIdeaLabel,
  getTimelineFieldValue,
} from "./packet";
import { buildPatentSearchPrep } from "./patentSearchPrep";
import { buildAiPreparationToolRecord } from "./paths/patent/preparationRecord";
import { resolveBrandName } from "./brandName";
import type { SavedReference } from "./research/types";
import type {
  DevelopmentTimelineField,
  ProjectRecord,
  SearchReadiness,
} from "./types";

export interface InventorshipEntry {
  role: string;
  involvement: string;
  help_types: string[];
  notes: string;
}

export interface AttorneyExportDisclaimer {
  paragraphs: string[];
  short: string;
  attorney_export_notice: string;
}

export interface AttorneyExportPacket {
  disclaimer: AttorneyExportDisclaimer;
  packet_id: string;
  created_at: string;
  /**
   * Legacy numeric field — Formula B (packet organization), unchanged for
   * consumers. See readiness_score_type.
   */
  readiness_score: number;
  /** Clarifies that readiness_score is Formula B, not the inventor UI score. */
  readiness_score_type: typeof PACKET_ORGANIZATION_SCORE_TYPE;
  inventor: {
    name: string;
    email: string;
    entity: string;
    inventorship_split: InventorshipEntry[];
  };
  invention: {
    title: string;
    summary: string;
    solution: string;
    problem_solved: string;
    how_it_works: string;
    key_components: string[];
    differences: string[];
    brand_name?: string;
    preferred_embodiment?: string;
    alternative_versions?: string;
    known_similar_work?: string;
    ai_assistance?: string;
    ai_assistance_notes?: string;
  };
  timeline: {
    conception_date: string | null;
    reduction_to_practice: string | null;
    public_disclosures: { date: string | null; description: string }[];
  };
  prior_art: {
    user_notes: string;
    suggested_search_terms: string[];
    cpc_suggestions: string[];
  };
  materials: {
    attachments: { name: string; url: string; type: string }[];
    prototype_status: string;
  };
  gaps_and_questions: string[];
  recommended_resources: string[];
  export_metadata: {
    exported_for: string;
    exported_at: string;
  };
  preparation_tool: {
    ai_assisted_packet: boolean;
    record: string | null;
  };
  search_readiness?: {
    key_features: string;
    what_feels_new: string;
    closest_products: string;
    customer_search_terms: string;
    technical_search_terms: string;
    possible_industries: string;
    materials_mechanisms_steps: string;
    sources_already_searched: string[];
    similar_references_found: string;
  };
  disclosure_events?: {
    kind: string;
    approximate_date: string;
    where_shown: string;
    who_saw_it: string;
    what_was_shown: string;
    nda_or_confidentiality: string;
    included_key_features: string;
  }[];
  readiness_score_breakdown?: {
    label: string;
    points: number;
    max: number;
  }[];
}

export interface AttorneyExportOptions {
  exportedFor: string;
  includePdf: boolean;
  includeJson: boolean;
  includeCsv: boolean;
}

function splitList(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Export-only organization score (Formula B).
 * Not the platform’s canonical inventor-facing readiness score.
 */
export const PACKET_ORGANIZATION_SCORE_TYPE = "packet_organization_v1" as const;

export interface PacketOrganizationScoreBreakdownEntry {
  label: string;
  points: number;
  max: number;
}

/** @deprecated Use PacketOrganizationScoreBreakdownEntry */
export type ReadinessScoreBreakdownEntry = PacketOrganizationScoreBreakdownEntry;

export function computePacketOrganizationScoreBreakdown(
  record: ProjectRecord,
  savedReferenceCount = 0,
): PacketOrganizationScoreBreakdownEntry[] {
  const prep = buildPatentPrepChecklist(record);
  const materials = buildMaterialsChecklist(record);
  const prepComplete = prep.filter((row) => row.complete).length;
  const materialsAvailable = materials.filter((item) => item.available).length;
  const corePrepPoints = (prepComplete / prep.length) * 0.65 * 100;
  const materialsPoints =
    (materialsAvailable / materials.length) * 0.35 * 100;
  const timelineBonus = Math.min(
    10,
    [
      "Date idea started",
      "Date first prototype built",
      "Date first shared publicly",
    ].filter((field) =>
      getTimelineFieldValue(
        record.developmentTimeline,
        field as DevelopmentTimelineField,
      ),
    ).length * 3,
  );
  const referenceBonus = savedReferenceCount > 0 ? 5 : 0;

  return [
    { label: "Core preparation details", points: corePrepPoints, max: 65 },
    { label: "Supporting materials", points: materialsPoints, max: 35 },
    { label: "Timeline dates bonus", points: timelineBonus, max: 9 },
    { label: "Saved reference bonus", points: referenceBonus, max: 5 },
  ];
}

export function computePacketOrganizationScore(
  record: ProjectRecord,
  savedReferenceCount = 0,
): number {
  const breakdown = computePacketOrganizationScoreBreakdown(
    record,
    savedReferenceCount,
  );
  const total = breakdown.reduce((sum, entry) => sum + entry.points, 0);
  return Math.min(100, Math.max(0, Math.round(total)));
}

function buildInventorshipSplit(record: ProjectRecord): InventorshipEntry[] {
  const { answers } = record;
  const involvement = answers.contributorsInvolved;
  const involvementLabel = involvement
    ? (CONTRIBUTOR_INVOLVEMENT_LABELS[involvement] ??
      involvement.replace(/_/g, " "))
    : "Not specified";
  const entry: InventorshipEntry = {
    role:
      involvement === "solo" || !involvement
        ? "primary_inventor"
        : "inventor_team",
    involvement: involvementLabel,
    help_types: (answers.contributorHelpTypes ?? []).map((type) =>
      type.replace(/_/g, " "),
    ),
    notes: answers.ownershipNotes?.trim() ?? "",
  };
  return [entry];
}

function buildPublicDisclosures(record: ProjectRecord) {
  const events: { date: string | null; description: string }[] = [];
  const timeline = record.developmentTimeline;
  const publicDate = getTimelineFieldValue(timeline, "Date first shared publicly");
  if (publicDate) {
    events.push({
      date: publicDate,
      description: "First shared publicly (user-reported date)",
    });
  }
  const pitchedDate = getTimelineFieldValue(
    timeline,
    "Date first pitched, sold, or demoed",
  );
  if (pitchedDate) {
    events.push({
      date: pitchedDate,
      description: "First pitched, sold, or demoed (user-reported date)",
    });
  }
  for (const channel of record.answers.sharedChannels) {
    if (channel === "none") continue;
    events.push({
      date: null,
      description: `Sharing channel indicated: ${SHARING_LABELS[channel] ?? channel}`,
    });
  }
  if (record.profile.publicDisclosure && record.profile.publicDisclosureNote.trim()) {
    events.push({
      date: null,
      description: record.profile.publicDisclosureNote.trim(),
    });
  }
  return events;
}

function hasSearchReadinessContent(readiness?: SearchReadiness): boolean {
  if (!readiness) return false;
  return (
    Boolean(
      readiness.keyFeatures?.trim() ||
        readiness.whatFeelsNew?.trim() ||
        readiness.closestProducts?.trim() ||
        readiness.customerSearchTerms?.trim() ||
        readiness.technicalSearchTerms?.trim() ||
        readiness.possibleIndustries?.trim() ||
        readiness.materialsMechanismsSteps?.trim() ||
        readiness.similarReferencesFound?.trim(),
    ) || (readiness.sourcesAlreadySearched ?? []).length > 0
  );
}

function buildSearchReadinessExport(
  readiness: SearchReadiness,
): NonNullable<AttorneyExportPacket["search_readiness"]> {
  return {
    key_features: readiness.keyFeatures?.trim() ?? "",
    what_feels_new: readiness.whatFeelsNew?.trim() ?? "",
    closest_products: readiness.closestProducts?.trim() ?? "",
    customer_search_terms: readiness.customerSearchTerms?.trim() ?? "",
    technical_search_terms: readiness.technicalSearchTerms?.trim() ?? "",
    possible_industries: readiness.possibleIndustries?.trim() ?? "",
    materials_mechanisms_steps:
      readiness.materialsMechanismsSteps?.trim() ?? "",
    sources_already_searched: readiness.sourcesAlreadySearched ?? [],
    similar_references_found: readiness.similarReferencesFound?.trim() ?? "",
  };
}

function buildDisclosureEventsExport(
  record: ProjectRecord,
): NonNullable<AttorneyExportPacket["disclosure_events"]> {
  return (record.answers.disclosureEvents ?? []).map((event) => ({
    kind: event.kind ?? "",
    approximate_date: event.approximateDate?.trim() ?? "",
    where_shown: event.whereShown?.trim() ?? "",
    who_saw_it: event.whoSawIt?.trim() ?? "",
    what_was_shown: event.whatWasShown?.trim() ?? "",
    nda_or_confidentiality: event.ndaOrConfidentiality ?? "",
    included_key_features: event.includedKeyFeatures ?? "",
  }));
}

function buildPriorArtNotes(savedReferences: SavedReference[]): string {
  if (savedReferences.length === 0) return "";
  return savedReferences
    .map((ref) => {
      const parts = [
        ref.title.trim(),
        ref.notes.trim(),
        ref.looksSimilar.trim() ? `Similar: ${ref.looksSimilar.trim()}` : "",
        ref.seemsDifferent.trim()
          ? `Different: ${ref.seemsDifferent.trim()}`
          : "",
      ].filter(Boolean);
      return parts.join(" · ");
    })
    .join("\n");
}

export function buildAttorneyExportPacket(
  record: ProjectRecord,
  savedReferences: SavedReference[],
  exportedFor: string,
  inventor?: { name?: string; email?: string },
): AttorneyExportPacket {
  const handoffAnswers = record.answers;
  const searchPrep = buildPatentSearchPrep(record);
  const differenceMap = buildDifferenceMap(record);
  const missingStatus = buildMissingInfoStatus(
    record,
    savedReferences.length,
  );
  const components = splitList(handoffAnswers.mainParts);
  const differences = [
    handoffAnswers.whatDifferent.trim(),
    ...differenceMap
      .map((row) => row.difference.trim())
      .filter((value) => value && !value.startsWith("(")),
  ].filter(Boolean);

  const gapsAndQuestions = [
    ...missingStatus.coreMissing,
    ...missingStatus.optionalGaps,
    ...record.profile.expertQuestions,
  ];

  const attachments: { name: string; url: string; type: string }[] =
    record.answers.assets.map((asset) => ({
      name: asset.replace(/_/g, " "),
      url: "",
      type: asset,
    }));

  for (const ref of savedReferences) {
    if (ref.url.trim()) {
      attachments.push({
        name: ref.title.trim() || "Saved reference",
        url: ref.url.trim(),
        type: String(ref.referenceType),
      });
    }
  }

  return {
    disclaimer: buildAttorneyExportDisclaimer(),
    packet_id: record.id,
    created_at: record.createdAt,
    readiness_score: computePacketOrganizationScore(
      record,
      savedReferences.length,
    ),
    readiness_score_type: PACKET_ORGANIZATION_SCORE_TYPE,
    inventor: {
      name: inventor?.name?.trim() ?? "",
      email: inventor?.email?.trim() ?? "",
      entity: handoffAnswers.location.trim(),
      inventorship_split: buildInventorshipSplit(record),
    },
    invention: {
      title:
        handoffAnswers.inventionTitle?.trim() ||
        getIdeaLabel(handoffAnswers),
      summary: record.profile.ideaSummary,
      solution: handoffAnswers.whatCreated.trim(),
      problem_solved: handoffAnswers.problemSolved.trim(),
      how_it_works: handoffAnswers.howItWorks.trim(),
      key_components: components.length > 0 ? components : [handoffAnswers.mainParts.trim()].filter(Boolean),
      differences,
      brand_name: resolveBrandName(handoffAnswers) ?? undefined,
      preferred_embodiment:
        handoffAnswers.preferredEmbodiment?.trim() || undefined,
      alternative_versions:
        handoffAnswers.alternativeVersions?.trim() || undefined,
      known_similar_work:
        handoffAnswers.knownSimilarWork?.trim() || undefined,
      ai_assistance: handoffAnswers.aiAssistance
        ? AI_ASSISTANCE_LABELS[handoffAnswers.aiAssistance]
        : undefined,
      ai_assistance_notes:
        handoffAnswers.aiAssistanceNotes?.trim() || undefined,
    },
    timeline: {
      conception_date:
        getTimelineFieldValue(record.developmentTimeline, "Date idea started") ||
        getTimelineFieldValue(
          record.developmentTimeline,
          "Date first written down or sketched",
        ) ||
        null,
      reduction_to_practice:
        getTimelineFieldValue(
          record.developmentTimeline,
          "Date first prototype built",
        ) || null,
      public_disclosures: buildPublicDisclosures(record),
    },
    prior_art: {
      user_notes: buildPriorArtNotes(savedReferences),
      suggested_search_terms: [
        ...searchPrep.searchKeywords,
        ...searchPrep.suggestedQueries,
      ],
      cpc_suggestions: suggestCpcCodes(record).map((item) => item.code),
    },
    materials: {
      attachments,
      prototype_status: handoffAnswers.hasPrototype
        ? "Prototype or working demonstration reported"
        : "No prototype reported",
    },
    gaps_and_questions: [...new Set(gapsAndQuestions.filter(Boolean))],
    recommended_resources: record.profile.recommendedResources.map(
      (resource) => RESOURCE_LABELS[resource] ?? resource,
    ),
    export_metadata: {
      exported_for: exportedFor.trim(),
      exported_at: new Date().toISOString(),
    },
    preparation_tool: {
      ai_assisted_packet: record.profile.generator === "ai",
      record: buildAiPreparationToolRecord(record),
    },
    search_readiness: hasSearchReadinessContent(
      record.answers.searchReadiness,
    )
      ? buildSearchReadinessExport(record.answers.searchReadiness!)
      : undefined,
    disclosure_events:
      (record.answers.disclosureEvents ?? []).length > 0
        ? buildDisclosureEventsExport(record)
        : undefined,
    readiness_score_breakdown: computePacketOrganizationScoreBreakdown(
      record,
      savedReferences.length,
    ).map((entry) => ({ ...entry, points: Math.round(entry.points) })),
  };
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildAttorneyExportCsv(packet: AttorneyExportPacket): string {
  const rows: [string, string][] = [
    ["disclaimer_short", packet.disclaimer.short],
    ["disclaimer_notice", packet.disclaimer.attorney_export_notice],
    ["disclaimer_full", packet.disclaimer.paragraphs.join(" ")],
    ["packet_id", packet.packet_id],
    ["created_at", packet.created_at],
    ["readiness_score", String(packet.readiness_score)],
    ["readiness_score_type", packet.readiness_score_type],
    ["inventor_name", packet.inventor.name],
    ["inventor_email", packet.inventor.email],
    ["inventor_entity", packet.inventor.entity],
    ["invention_title", packet.invention.title],
    ["invention_summary", packet.invention.summary],
    ["problem_solved", packet.invention.problem_solved],
    ["how_it_works", packet.invention.how_it_works],
    ["key_components", packet.invention.key_components.join("; ")],
    ["differences", packet.invention.differences.join("; ")],
    ["conception_date", packet.timeline.conception_date ?? ""],
    ["reduction_to_practice", packet.timeline.reduction_to_practice ?? ""],
    [
      "public_disclosures",
      packet.timeline.public_disclosures
        .map((event) =>
          event.date
            ? `${event.date}: ${event.description}`
            : event.description,
        )
        .join(" | "),
    ],
    ["prior_art_notes", packet.prior_art.user_notes],
    [
      "suggested_search_terms",
      packet.prior_art.suggested_search_terms.join("; "),
    ],
    ["cpc_suggestions", packet.prior_art.cpc_suggestions.join("; ")],
    ["prototype_status", packet.materials.prototype_status],
    [
      "attachments",
      packet.materials.attachments
        .map((item) =>
          item.url ? `${item.name} (${item.url})` : item.name,
        )
        .join("; "),
    ],
    ["gaps_and_questions", packet.gaps_and_questions.join(" | ")],
    ["recommended_resources", packet.recommended_resources.join("; ")],
    ["exported_for", packet.export_metadata.exported_for],
    ["exported_at", packet.export_metadata.exported_at],
    [
      "inventorship_split",
      JSON.stringify(packet.inventor.inventorship_split),
    ],
    ["invention_brand_name", packet.invention.brand_name ?? ""],
    [
      "search_readiness",
      packet.search_readiness ? JSON.stringify(packet.search_readiness) : "",
    ],
    [
      "disclosure_events",
      packet.disclosure_events
        ? JSON.stringify(packet.disclosure_events)
        : "",
    ],
    [
      "readiness_score_breakdown",
      packet.readiness_score_breakdown
        ? packet.readiness_score_breakdown
            .map((entry) => `${entry.label}: ${entry.points}/${entry.max}`)
            .join("; ")
        : "",
    ],
  ];

  const lines = ["field,value", ...rows.map(([field, value]) => `${escapeCsv(field)},${escapeCsv(value)}`)];
  return lines.join("\n");
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function attorneyExportBaseName(packetId: string): string {
  return `smartprobonoip-attorney-export-${packetId.slice(0, 8)}`;
}
