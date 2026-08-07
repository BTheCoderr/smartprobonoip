import type {
  PlatformServiceManifest,
  ProtectionPathId,
  ProtectionPathModule,
} from "./types";

/**
 * Shared platform services that every protection path plugs into.
 * These describe the real contracts — adapters live next to existing
 * implementations (pilot session, partner dashboard, packet PDF, etc.).
 */
export const PLATFORM_SERVICES: PlatformServiceManifest = {
  auth: {
    id: "session_consent",
    description:
      "Dual-consent disclaimer gate plus session-scoped record access (pilot session headers). Future account auth can replace or wrap this without changing path modules.",
    status: "live",
  },
  dashboard: {
    id: "partner_metrics",
    description:
      "Partner impact desk with secret-gated metrics, filters, and CSV export. Path-agnostic aggregations will filter by protection_path when multi-path records exist.",
    status: "live",
  },
  documents: {
    id: "packet_and_registry",
    description:
      "IP Readiness Packet PDF/JSON exports today; venture_documents registry reserved for uploaded supporting files across paths.",
    status: "live",
  },
  aiOrchestration: {
    id: "profile_and_coach",
    description:
      "Optional OpenAI profile generation and Packet Coach with rule-based fallbacks. Paths supply prompts and safety scopes; the orchestrator stays shared.",
    status: "live",
  },
  professionalHandoff: {
    id: "pdf_json_brief",
    description:
      "Expert handoff summary, attorney export schema, and bring-to-meeting checklist. Each path can extend the brief via its module without forking export plumbing.",
    status: "live",
  },
  portfolioTracking: {
    id: "project_records",
    description:
      "ProjectRecord persistence (localStorage or Supabase) with recovery tokens. Future portfolio views list records across protection paths for one inventor.",
    status: "live",
  },
} as const;

const modules = new Map<ProtectionPathId, ProtectionPathModule>();

export function registerProtectionPath(module: ProtectionPathModule): void {
  modules.set(module.definition.id, module);
}

export function getProtectionPath(
  id: ProtectionPathId,
): ProtectionPathModule | undefined {
  return modules.get(id);
}

export function listProtectionPaths(): ProtectionPathModule[] {
  return Array.from(modules.values());
}

export function listChooserPaths(): ProtectionPathModule[] {
  const order: ProtectionPathId[] = [
    "patent",
    "trademark",
    "copyright",
    "trade_secret",
    "unsure",
  ];
  return order
    .map((id) => modules.get(id))
    .filter((m): m is ProtectionPathModule => Boolean(m));
}

export function getAvailableProtectionPaths(): ProtectionPathModule[] {
  return listProtectionPaths().filter(
    (m) => m.definition.status === "available" && m.hasReadinessWorkflow,
  );
}
