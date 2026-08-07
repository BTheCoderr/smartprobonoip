import {
  ALL_SHARE_FIELD_KEYS,
  DEFAULT_SELECTED_SHARE_FIELDS,
  OPTIONAL_SHARE_FIELDS,
  type ShareFieldKey,
} from "./types";

export const ORGANIZATION_CONSENT_COPY_VERSION = "org_share_consent_v1";
export const ORGANIZATION_CONSENT_DISCLAIMER_VERSION = "org_share_disclaimer_v1";

export interface ShareFieldDefinition {
  key: ShareFieldKey;
  label: string;
  description: string;
  defaultSelected: boolean;
}

export const SHARE_FIELD_DEFINITIONS: readonly ShareFieldDefinition[] = [
  {
    key: "readiness.overall_score",
    label: "Overall readiness score",
    description: "A preparation score (0–100) based on packet completeness — not a legal conclusion.",
    defaultSelected: true,
  },
  {
    key: "readiness.category_breakdown",
    label: "Readiness category breakdown",
    description: "Scores by preparation category (core idea, timeline, disclosure, etc.).",
    defaultSelected: true,
  },
  {
    key: "readiness.preparation_signals",
    label: "Preparation signal categories",
    description: "High-level IP topic labels (e.g., patent, trademark) — not intake narratives.",
    defaultSelected: true,
  },
  {
    key: "readiness.missing_information_categories",
    label: "Missing-information categories",
    description: "Which preparation areas still need attention — category labels only.",
    defaultSelected: true,
  },
  {
    key: "referral.reason",
    label: "Referral reason",
    description: "Why SmartProBonoIP suggested this organization may help.",
    defaultSelected: true,
  },
  {
    key: "packet.export_metadata",
    label: "Packet / export metadata",
    description: "Document types, counts, and generation dates — not document contents.",
    defaultSelected: true,
  },
  {
    key: "invention.title",
    label: "Invention title",
    description: "Optional short title the inventor entered or generated.",
    defaultSelected: false,
  },
  {
    key: "invention.plain_summary",
    label: "Plain-language summary",
    description: "Optional packet summary text — unchecked by default.",
    defaultSelected: false,
  },
  {
    key: "artifact.readiness_packet_pdf",
    label: "Generated packet PDF (if available)",
    description: "Reference to a generated PDF artifact — not uploaded unless inventor selects it.",
    defaultSelected: false,
  },
];

const FIELD_SET = new Set<string>(ALL_SHARE_FIELD_KEYS);

export function isShareFieldKey(value: string): value is ShareFieldKey {
  return FIELD_SET.has(value);
}

export function normalizeSelectedShareFields(
  input: string[] | undefined | null,
): ShareFieldKey[] {
  if (!input?.length) return [...DEFAULT_SELECTED_SHARE_FIELDS];
  const seen = new Set<ShareFieldKey>();
  const normalized: ShareFieldKey[] = [];
  for (const key of input) {
    if (!isShareFieldKey(key) || seen.has(key)) continue;
    seen.add(key);
    normalized.push(key);
  }
  if (normalized.length === 0) return [...DEFAULT_SELECTED_SHARE_FIELDS];
  return normalized;
}

export function defaultShareFieldSelection(): ShareFieldKey[] {
  return [...DEFAULT_SELECTED_SHARE_FIELDS];
}

export function optionalShareFields(): ShareFieldKey[] {
  return [...OPTIONAL_SHARE_FIELDS];
}

export const ORGANIZATION_CONSENT_DISCLAIMER =
  "SmartProBonoIP does not provide legal advice. Sharing creates a one-time snapshot for the organization you select. You control which fields are included. The organization sees only what you check below — not your full intake answers, ownership notes, or research workspace.";

export const ORGANIZATION_CONSENT_SUBMIT_LABEL =
  "Share selected snapshot with organization";
