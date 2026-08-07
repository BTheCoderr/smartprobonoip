/**
 * Invention entity for the Inventor Workspace.
 *
 * An invention is the existing `smartprobonoip_projects` row. This module adds a
 * portfolio-facing projection of it; it does not introduce a second source of truth.
 */

/** Lifecycle values accepted by the smartprobonoip_projects status constraint. */
export type InventionStatus =
  | "created"
  | "packet_generated"
  | "researching"
  | "professional_review"
  | "archived";

/** What a document is, independent of the file format it is written in. */
export type DocumentKind =
  | "readiness_packet"
  | "attorney_brief"
  | "attorney_export"
  | "intake_summary";

export type DocumentFormat = "pdf" | "json" | "csv" | "md";

/**
 * `generated` artifacts are produced on demand and never retained by the app.
 * `uploaded` is reserved for inventor-supplied files, which are not implemented.
 */
export type DocumentOrigin = "generated" | "uploaded";

/**
 * Portfolio list projection. Deliberately excludes `answers` and `profile` so a
 * portfolio response never carries every invention's full private text.
 */
export interface InventionSummary {
  id: string;
  title: string;
  status: InventionStatus;
  readinessScore: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  isDemo: boolean;
  hasPacket: boolean;
  publicDisclosure: boolean;
  signalCount: number;
  savedReferenceCount: number;
  documentCount: number;
  preClarity: number;
  postClarity: number | null;
}

export interface InventionUpdate {
  title?: string;
  status?: InventionStatus;
}

/** A document record. One row per artifact the inventor generated. */
export interface DocumentRecord {
  id: string;
  inventionId: string;
  title: string;
  kind: DocumentKind;
  format: DocumentFormat;
  origin: DocumentOrigin;
  createdAt: string;
  /**
   * Null while artifacts are regenerated on demand. Populated if the artifact is
   * ever persisted, at which point download serves the stored object instead.
   */
  storageUrl: string | null;
}

/** A document record shown in a portfolio-wide list, labelled with its invention. */
export interface GeneratedDocument extends DocumentRecord {
  inventionTitle: string;
}

/** Request to record a newly generated artifact. */
export interface DocumentGeneration {
  kind: DocumentKind;
  format: DocumentFormat;
}
