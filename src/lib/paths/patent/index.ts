import { registerProtectionPath } from "@/lib/platform/registry";
import { SHARED_PATH_CAPABILITIES } from "@/lib/platform/services";
import type { ProtectionPathModule } from "@/lib/platform/types";
import { ROUTES } from "@/lib/routes";

/**
 * Phase 1 — Patent readiness path (fully implemented).
 * Maps to the existing inventor disclosure → packet → handoff workflow.
 */
export const PATENT_PATH: ProtectionPathModule = {
  definition: {
    id: "patent",
    label: "Patent",
    description:
      "Prepare an invention disclosure, note public sharing history, and build a professional handoff packet before expert review.",
    status: "available",
    entryHref: ROUTES.disclaimer,
    interestHref: ROUTES.disclaimer,
    capabilities: SHARED_PATH_CAPABILITIES,
    targetPhase: 1,
    badge: "Available",
  },
  educationTopicIds: [
    "privacy_public_disclosure",
    "ai_inventorship",
    "inventorship_ownership",
    "prior_art",
    "idf_basics",
  ],
  hasReadinessWorkflow: true,
};

registerProtectionPath(PATENT_PATH);
