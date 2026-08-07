/**
 * Shared service adapters — thin facades over existing platform code.
 * Path modules should depend on these contracts rather than importing
 * store/session/PDF internals directly when new paths ship.
 */

import { PLATFORM_SERVICES } from "./registry";
import type { PlatformCapability, PlatformServiceManifest } from "./types";

export function getPlatformServiceManifest(): PlatformServiceManifest {
  return PLATFORM_SERVICES;
}

export function isPlatformCapabilityLive(
  capability: PlatformCapability,
): boolean {
  switch (capability) {
    case "auth":
      return PLATFORM_SERVICES.auth.status === "live";
    case "dashboard":
      return PLATFORM_SERVICES.dashboard.status === "live";
    case "documents":
      return PLATFORM_SERVICES.documents.status === "live";
    case "ai_orchestration":
      return PLATFORM_SERVICES.aiOrchestration.status === "live";
    case "professional_handoff":
      return PLATFORM_SERVICES.professionalHandoff.status === "live";
    case "portfolio_tracking":
      return PLATFORM_SERVICES.portfolioTracking.status === "live";
    default:
      return false;
  }
}

/** Stable capability list every path is expected to eventually use. */
export const SHARED_PATH_CAPABILITIES = [
  "auth",
  "dashboard",
  "documents",
  "ai_orchestration",
  "professional_handoff",
  "portfolio_tracking",
] as const satisfies readonly PlatformCapability[];
