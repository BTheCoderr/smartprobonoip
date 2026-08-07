import { resolveInventionTitle } from "@/lib/ideas/title";
import type { DocumentRecord } from "@/lib/ideas/types";
import { buildReadinessEvaluation } from "@/lib/readiness";
import { SIGNAL_CATALOG } from "@/lib/signals";
import type { ProjectRecord } from "@/lib/types";
import {
  SHARE_FIELD_KEYS,
  type SharedArtifactRef,
  type SharedSnapshotPayload,
  type ShareFieldKey,
} from "./types";

function findReadinessPacketPdf(
  documents: DocumentRecord[],
): SharedArtifactRef | null {
  const pdf = documents.find(
    (doc) => doc.kind === "readiness_packet" && doc.format === "pdf",
  );
  if (!pdf) return null;
  return {
    id: pdf.id,
    kind: pdf.kind,
    format: pdf.format,
    title: pdf.title,
    createdAt: pdf.createdAt,
  };
}

export interface BuildSharedSnapshotInput {
  record: ProjectRecord;
  selectedFields: ShareFieldKey[];
  referralReason?: string | null;
  documents?: DocumentRecord[];
  savedReferenceCount?: number;
}

/**
 * Builds an immutable org-facing snapshot at consent time.
 * Only includes explicitly allowlisted field keys.
 */
export function buildSharedSnapshot(
  input: BuildSharedSnapshotInput,
): SharedSnapshotPayload {
  const {
    record,
    selectedFields,
    referralReason,
    documents = [],
    savedReferenceCount = 0,
  } = input;
  const selected = new Set(selectedFields);
  const evaluation = buildReadinessEvaluation(record, savedReferenceCount);
  const snapshot: SharedSnapshotPayload = {
    sharedFieldKeys: [...selectedFields],
  };

  if (selected.has(SHARE_FIELD_KEYS.READINESS_OVERALL_SCORE)) {
    snapshot.readiness = {
      ...snapshot.readiness,
      overallScore: evaluation.overallScore,
    };
  }

  if (selected.has(SHARE_FIELD_KEYS.READINESS_CATEGORY_BREAKDOWN)) {
    snapshot.readiness = {
      ...snapshot.readiness,
      categoryBreakdown: evaluation.categories.map((category) => ({
        id: category.id,
        label: category.label,
        score: category.score,
        max: category.max,
      })),
    };
  }

  if (selected.has(SHARE_FIELD_KEYS.READINESS_PREPARATION_SIGNALS)) {
    const signals = record.profile.signals ?? [];
    snapshot.readiness = {
      ...snapshot.readiness,
      preparationSignals: signals.map((signal) => ({
        id: signal,
        label: SIGNAL_CATALOG[signal]?.label ?? signal.replace(/_/g, " "),
      })),
    };
  }

  if (selected.has(SHARE_FIELD_KEYS.READINESS_MISSING_INFORMATION)) {
    snapshot.readiness = {
      ...snapshot.readiness,
      missingInformationCategories: evaluation.actions.map((action) => ({
        categoryId: action.categoryId,
        label: action.label,
      })),
    };
  }

  if (selected.has(SHARE_FIELD_KEYS.REFERRAL_REASON) && referralReason?.trim()) {
    snapshot.referral = { reason: referralReason.trim() };
  }

  if (selected.has(SHARE_FIELD_KEYS.PACKET_EXPORT_METADATA)) {
    snapshot.packet = {
      exportMetadata: {
        documentCount: documents.length,
        documents: documents.map((doc) => ({
          kind: doc.kind,
          format: doc.format,
          title: doc.title,
          createdAt: doc.createdAt,
        })),
        profileGenerator: record.profile.generator,
        packetGeneratedAt: record.updatedAt ?? record.createdAt,
      },
    };
  }

  if (selected.has(SHARE_FIELD_KEYS.INVENTION_TITLE)) {
    snapshot.invention = {
      ...snapshot.invention,
      title: resolveInventionTitle(record.answers, record.title),
    };
  }

  if (selected.has(SHARE_FIELD_KEYS.INVENTION_PLAIN_SUMMARY)) {
    snapshot.invention = {
      ...snapshot.invention,
      plainSummary: record.profile.ideaSummary?.trim() || undefined,
    };
  }

  if (selected.has(SHARE_FIELD_KEYS.ARTIFACT_READINESS_PACKET_PDF)) {
    const pdfRef = findReadinessPacketPdf(documents);
    snapshot.artifacts = { readinessPacketPdf: pdfRef };
  }

  return snapshot;
}

/** Org API responses must never include fields outside the frozen snapshot. */
export function sanitizeReferralForOrgView(
  snapshot: SharedSnapshotPayload,
): SharedSnapshotPayload {
  const allowed = new Set(snapshot.sharedFieldKeys);
  const out: SharedSnapshotPayload = {
    sharedFieldKeys: [...snapshot.sharedFieldKeys],
  };

  if (allowed.has(SHARE_FIELD_KEYS.READINESS_OVERALL_SCORE)) {
    out.readiness = { ...out.readiness, overallScore: snapshot.readiness?.overallScore };
  }
  if (allowed.has(SHARE_FIELD_KEYS.READINESS_CATEGORY_BREAKDOWN)) {
    out.readiness = {
      ...out.readiness,
      categoryBreakdown: snapshot.readiness?.categoryBreakdown,
    };
  }
  if (allowed.has(SHARE_FIELD_KEYS.READINESS_PREPARATION_SIGNALS)) {
    out.readiness = {
      ...out.readiness,
      preparationSignals: snapshot.readiness?.preparationSignals,
    };
  }
  if (allowed.has(SHARE_FIELD_KEYS.READINESS_MISSING_INFORMATION)) {
    out.readiness = {
      ...out.readiness,
      missingInformationCategories: snapshot.readiness?.missingInformationCategories,
    };
  }
  if (allowed.has(SHARE_FIELD_KEYS.REFERRAL_REASON)) {
    out.referral = snapshot.referral;
  }
  if (allowed.has(SHARE_FIELD_KEYS.PACKET_EXPORT_METADATA)) {
    out.packet = snapshot.packet;
  }
  if (allowed.has(SHARE_FIELD_KEYS.INVENTION_TITLE)) {
    out.invention = { ...out.invention, title: snapshot.invention?.title };
  }
  if (allowed.has(SHARE_FIELD_KEYS.INVENTION_PLAIN_SUMMARY)) {
    out.invention = {
      ...out.invention,
      plainSummary: snapshot.invention?.plainSummary,
    };
  }
  if (allowed.has(SHARE_FIELD_KEYS.ARTIFACT_READINESS_PACKET_PDF)) {
    out.artifacts = snapshot.artifacts;
  }

  return out;
}

/** Detect narrative fields that must never appear in org responses. */
export function snapshotContainsForbiddenNarrative(
  payload: Record<string, unknown>,
): boolean {
  const json = JSON.stringify(payload).toLowerCase();
  const forbiddenKeys = [
    "whatcreated",
    "problemsolved",
    "howitworks",
    "ownershipnotes",
    "disclosureevents",
    "searchreadiness",
    "feedback",
    "analytics",
    "intake",
    "location",
    "contact_email",
  ];
  return forbiddenKeys.some((key) => json.includes(`"${key}"`));
}
