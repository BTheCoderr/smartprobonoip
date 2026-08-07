/**
 * SmartProBonoIP — IP Readiness Platform contracts.
 *
 * Each protection path (patent, trademark, …) is a module that plugs into
 * shared platform services. Phase 1 implements the patent path only.
 * Other paths are registered as coming_soon so the platform can grow
 * without placeholder product logic.
 */

export type ProtectionPathId =
  | "patent"
  | "trademark"
  | "copyright"
  | "trade_secret"
  | "unsure";

export type ProtectionPathStatus = "available" | "coming_soon";

/** Shared capabilities every path can use when it goes live. */
export type PlatformCapability =
  | "auth"
  | "dashboard"
  | "documents"
  | "ai_orchestration"
  | "professional_handoff"
  | "portfolio_tracking";

export interface ProtectionPathDefinition {
  id: ProtectionPathId;
  /** Short label for chooser cards */
  label: string;
  /** One-line description shown on the landing chooser */
  description: string;
  status: ProtectionPathStatus;
  /** App route for this path's entry experience */
  entryHref: string;
  /** Coming-soon / interest route when status is coming_soon */
  interestHref: string;
  /** Which shared platform services this path is designed to use */
  capabilities: readonly PlatformCapability[];
  /** Phase when this path is planned to ship (1 = current patent focus) */
  targetPhase: number;
  /** Optional badge for the chooser (e.g. "Phase 1") */
  badge?: string;
}

/**
 * Runtime module contract for a protection path.
 * Available paths provide a live entryHref into real product flows.
 * Coming-soon paths expose metadata only — no fake intake or packet logic.
 */
export interface ProtectionPathModule {
  definition: ProtectionPathDefinition;
  /**
   * Educational topics owned by this path (ids map to content registries).
   * Empty for coming-soon modules.
   */
  educationTopicIds: readonly string[];
  /**
   * Whether this module currently owns an inventor-facing readiness workflow.
   * Must be true only when real product surfaces exist.
   */
  hasReadinessWorkflow: boolean;
}

export interface PlatformServiceManifest {
  auth: {
    id: "session_consent";
    description: string;
    status: "live" | "planned";
  };
  dashboard: {
    id: "partner_metrics";
    description: string;
    status: "live" | "planned";
  };
  documents: {
    id: "packet_and_registry";
    description: string;
    status: "live" | "planned";
  };
  aiOrchestration: {
    id: "profile_and_coach";
    description: string;
    status: "live" | "planned";
  };
  professionalHandoff: {
    id: "pdf_json_brief";
    description: string;
    status: "live" | "planned";
  };
  portfolioTracking: {
    id: "project_records";
    description: string;
    status: "live" | "planned";
  };
}
