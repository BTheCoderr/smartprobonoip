import { registerProtectionPath } from "@/lib/platform/registry";
import { SHARED_PATH_CAPABILITIES } from "@/lib/platform/services";
import type { ProtectionPathModule } from "@/lib/platform/types";
import { ROUTES } from "@/lib/routes";

/**
 * Framework registration for inventors who are unsure which path fits.
 * No diagnostic logic yet — education + interest capture only when live.
 */
export const UNSURE_PATH: ProtectionPathModule = {
  definition: {
    id: "unsure",
    label: "Not sure?",
    description:
      "Learn how patents, trademarks, copyrights, and trade secrets differ — then choose a path. Guided routing is coming soon.",
    status: "coming_soon",
    entryHref: ROUTES.protectUnsure,
    interestHref: ROUTES.protectUnsure,
    capabilities: SHARED_PATH_CAPABILITIES,
    targetPhase: 2,
    badge: "Coming soon",
  },
  educationTopicIds: [],
  hasReadinessWorkflow: false,
};

registerProtectionPath(UNSURE_PATH);
