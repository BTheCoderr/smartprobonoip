import { registerProtectionPath } from "@/lib/platform/registry";
import { SHARED_PATH_CAPABILITIES } from "@/lib/platform/services";
import type { ProtectionPathModule } from "@/lib/platform/types";
import { ROUTES } from "@/lib/routes";

/** Framework registration only — no trade-secret / NDA readiness workflow yet. */
export const TRADE_SECRET_PATH: ProtectionPathModule = {
  definition: {
    id: "trade_secret",
    label: "Trade Secret & NDA",
    description:
      "Organize confidential information, access controls, sharing history, and agreement records before a trade-secret or NDA conversation.",
    status: "coming_soon",
    entryHref: ROUTES.protectTradeSecret,
    interestHref: ROUTES.protectTradeSecret,
    capabilities: SHARED_PATH_CAPABILITIES,
    targetPhase: 3,
    badge: "Coming soon",
  },
  educationTopicIds: [],
  hasReadinessWorkflow: false,
};

registerProtectionPath(TRADE_SECRET_PATH);
