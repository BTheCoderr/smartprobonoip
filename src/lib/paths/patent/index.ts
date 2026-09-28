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
      "Build a reusable invention record with the technical disclosure, contributor history, disclosure timeline, supporting evidence, and professional handoff details in one place.",
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
