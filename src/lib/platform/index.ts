export type {
  PlatformCapability,
  PlatformServiceManifest,
  ProtectionPathDefinition,
  ProtectionPathId,
  ProtectionPathModule,
  ProtectionPathStatus,
} from "./types";

export {
  getAvailableProtectionPaths,
  getProtectionPath,
  listChooserPaths,
  listProtectionPaths,
  PLATFORM_SERVICES,
  registerProtectionPath,
} from "./registry";

export {
  getPlatformServiceManifest,
  isPlatformCapabilityLive,
  SHARED_PATH_CAPABILITIES,
} from "./services";

/** Ensure all path modules register when the platform is imported. */
import "@/lib/paths";
