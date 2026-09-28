import { registerProtectionPath } from "@/lib/platform/registry";
import { SHARED_PATH_CAPABILITIES } from "@/lib/platform/services";
import type { ProtectionPathModule } from "@/lib/platform/types";
import { ROUTES } from "@/lib/routes";

/** Framework registration only — no trademark readiness workflow yet. */
export const TRADEMARK_PATH: ProtectionPathModule = {
  definition: {
    id: "trademark",
    label: "Trademark",
    description:
      "Organize brand names, logos, goods and services, use history, and supporting materials before a trademark conversation.",
    status: "coming_soon",
    entryHref: ROUTES.protectTrademark,
    interestHref: ROUTES.protectTrademark,
    capabilities: SHARED_PATH_CAPABILITIES,
    targetPhase: 2,
    badge: "Coming soon",
  },
  educationTopicIds: [],
  hasReadinessWorkflow: false,
};

registerProtectionPath(TRADEMARK_PATH);
