/** Organization referral workflow statuses — no legal-outcome language. */
export const ORGANIZATION_REFERRAL_STATUSES = [
  "received",
  "reviewing",
  "needs_information",
  "completed",
  "declined",
  "referred_elsewhere",
] as const;

export type OrganizationReferralStatus =
  (typeof ORGANIZATION_REFERRAL_STATUSES)[number];

export const ORGANIZATION_MEMBER_ROLES = ["admin", "reviewer"] as const;
export type OrganizationMemberRole = (typeof ORGANIZATION_MEMBER_ROLES)[number];

export const ORGANIZATION_MEMBER_STATUSES = ["active", "revoked"] as const;
export type OrganizationMemberStatus =
  (typeof ORGANIZATION_MEMBER_STATUSES)[number];

export const ORGANIZATION_REFERRAL_EVENT_TYPES = [
  "referral_created",
  "status_changed",
  "snapshot_shared",
  "snapshot_updated",
  "member_access_revoked",
] as const;

export type OrganizationReferralEventType =
  (typeof ORGANIZATION_REFERRAL_EVENT_TYPES)[number];

export type OrganizationReferralActorType =
  | "inventor"
  | "org_member"
  | "system";

/** Stable snapshot field identifiers — never use UI checkbox labels in storage. */
export const SHARE_FIELD_KEYS = {
  READINESS_OVERALL_SCORE: "readiness.overall_score",
  READINESS_CATEGORY_BREAKDOWN: "readiness.category_breakdown",
  READINESS_PREPARATION_SIGNALS: "readiness.preparation_signals",
  READINESS_MISSING_INFORMATION: "readiness.missing_information_categories",
  REFERRAL_REASON: "referral.reason",
  PACKET_EXPORT_METADATA: "packet.export_metadata",
  INVENTION_TITLE: "invention.title",
  INVENTION_PLAIN_SUMMARY: "invention.plain_summary",
  ARTIFACT_READINESS_PACKET_PDF: "artifact.readiness_packet_pdf",
} as const;

export type ShareFieldKey =
  (typeof SHARE_FIELD_KEYS)[keyof typeof SHARE_FIELD_KEYS];

export const DEFAULT_SELECTED_SHARE_FIELDS: readonly ShareFieldKey[] = [
  SHARE_FIELD_KEYS.READINESS_OVERALL_SCORE,
  SHARE_FIELD_KEYS.READINESS_CATEGORY_BREAKDOWN,
  SHARE_FIELD_KEYS.READINESS_PREPARATION_SIGNALS,
  SHARE_FIELD_KEYS.READINESS_MISSING_INFORMATION,
  SHARE_FIELD_KEYS.REFERRAL_REASON,
  SHARE_FIELD_KEYS.PACKET_EXPORT_METADATA,
] as const;

export const OPTIONAL_SHARE_FIELDS: readonly ShareFieldKey[] = [
  SHARE_FIELD_KEYS.INVENTION_TITLE,
  SHARE_FIELD_KEYS.INVENTION_PLAIN_SUMMARY,
  SHARE_FIELD_KEYS.ARTIFACT_READINESS_PACKET_PDF,
] as const;

export const ALL_SHARE_FIELD_KEYS: readonly ShareFieldKey[] = [
  ...DEFAULT_SELECTED_SHARE_FIELDS,
  ...OPTIONAL_SHARE_FIELDS,
];

export interface SharedArtifactRef {
  id: string;
  kind: string;
  format: string;
  title: string;
  createdAt: string;
}

export interface SharedSnapshotPayload {
  sharedFieldKeys: ShareFieldKey[];
  readiness?: {
    overallScore?: number;
    categoryBreakdown?: {
      id: string;
      label: string;
      score: number;
      max: number;
    }[];
    preparationSignals?: { id: string; label: string }[];
    missingInformationCategories?: { categoryId: string; label: string }[];
  };
  referral?: { reason?: string };
  packet?: {
    exportMetadata?: {
      documentCount: number;
      documents: { kind: string; format: string; title: string; createdAt: string }[];
      profileGenerator?: string;
      packetGeneratedAt?: string;
    };
  };
  invention?: {
    title?: string;
    plainSummary?: string;
  };
  artifacts?: {
    readinessPacketPdf?: SharedArtifactRef | null;
  };
}

export interface OrganizationConsentRecord {
  organizationId: string;
  projectId: string;
  sharedFieldKeys: ShareFieldKey[];
  sharedArtifactIds: string[];
  consentAt: string;
  consentCopyVersion: string;
  consentDisclaimerVersion: string;
  recommendationId?: string | null;
  registryPartnerId?: string | null;
}

export interface OrganizationMemberRecord {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
  invitedAt: string;
  joinedAt: string | null;
}

export interface OrganizationReferralRecord {
  id: string;
  organizationId: string;
  projectId: string;
  status: OrganizationReferralStatus;
  sharedSnapshot: SharedSnapshotPayload;
  consentRecord: OrganizationConsentRecord;
  referralReason: string | null;
  registryPartnerId: string | null;
  recommendationId: string | null;
  firstStatusAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationReferralListItem {
  id: string;
  organizationId: string;
  status: OrganizationReferralStatus;
  createdAt: string;
  updatedAt: string;
  firstStatusAt: string | null;
  readinessScore: number | null;
  referralReason: string | null;
  hasTitle: boolean;
  hasSummary: boolean;
}

export interface OrganizationMetricsSummary {
  referralsReceived: number;
  byStatus: Record<OrganizationReferralStatus, number>;
  averageReadinessScore: number | null;
  averageTimeToFirstStatusUpdateHours: number | null;
  completedCount: number;
}
