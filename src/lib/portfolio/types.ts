import type {
  GeneratedDocument,
  InventionStatus,
  InventionSummary,
} from "@/lib/ideas/types";
import type { ActivityEvent } from "@/lib/timeline/types";

export interface PortfolioSummary {
  total: number;
  active: number;
  archived: number;
  byStatus: Record<InventionStatus, number>;
  averageReadiness: number | null;
  strongest: InventionSummary | null;
  needsAttention: InventionSummary[];
  publicDisclosureCount: number;
  lastActivityAt: string | null;
}

/** Everything the workspace needs for a first paint, in one response. */
export interface PortfolioSnapshot {
  inventions: InventionSummary[];
  summary: PortfolioSummary;
  recentActivity: ActivityEvent[];
  recentDocuments: GeneratedDocument[];
}

export type InventionSortMode =
  | "recent"
  | "created"
  | "readiness"
  | "title"
  | "status";
