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
      "Compare the main IP protection types, organize the facts you already know, and prepare better questions for a professional.",
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
