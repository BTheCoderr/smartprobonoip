import { registerProtectionPath } from "@/lib/platform/registry";
import { SHARED_PATH_CAPABILITIES } from "@/lib/platform/services";
import type { ProtectionPathModule } from "@/lib/platform/types";
import { ROUTES } from "@/lib/routes";

/** Framework registration only — no copyright readiness workflow yet. */
export const COPYRIGHT_PATH: ProtectionPathModule = {
  definition: {
    id: "copyright",
    label: "Copyright",
    description:
      "Organize creative works and authorship notes before a copyright conversation. Coming in a future phase.",
    status: "coming_soon",
    entryHref: ROUTES.protectCopyright,
    interestHref: ROUTES.protectCopyright,
    capabilities: SHARED_PATH_CAPABILITIES,
    targetPhase: 2,
    badge: "Coming soon",
  },
  educationTopicIds: [],
  hasReadinessWorkflow: false,
};

registerProtectionPath(COPYRIGHT_PATH);
