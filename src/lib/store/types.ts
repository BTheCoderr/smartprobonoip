import type { DevelopmentTimeline, IntakeAnswers, ProjectRecord, ReadinessProfile } from "../types";
import type { PilotTracking } from "../partnerTracking";
import type {
  DocumentGeneration,
  DocumentRecord,
  InventionUpdate,
} from "../ideas/types";
import type { PortfolioSnapshot } from "../portfolio/types";
import type { RoutingPreferences } from "../routing/dismissals";
import type { TimelineEvent } from "../timeline/types";

export interface SaveInput {
  answers: IntakeAnswers;
  profile: ReadinessProfile;
  preClarity: number;
  isDemo?: boolean;
  tracking?: PilotTracking | null;
}

export type StoreBackend = "supabase" | "local";

export interface Store {
  backend: StoreBackend;
  saveRecord(input: SaveInput): Promise<ProjectRecord>;
  /** Update an existing invention from resumed intake (answers + profile). */
  updateRecord(id: string, input: SaveInput): Promise<ProjectRecord>;
  getRecord(id: string): Promise<ProjectRecord | null>;
  listRecords(): Promise<ProjectRecord[]>;
  updatePostClarity(id: string, postClarity: number): Promise<void>;
  updateProfile(id: string, profile: ReadinessProfile): Promise<void>;
  updateDevelopmentTimeline(
    id: string,
    timeline: DevelopmentTimeline,
  ): Promise<ProjectRecord>;

  /** Inventor Workspace: every invention owned by this session, plus rollups. */
  getPortfolio(): Promise<PortfolioSnapshot>;
  getTimeline(id: string): Promise<TimelineEvent[]>;
  updateInvention(id: string, update: InventionUpdate): Promise<ProjectRecord>;
  listDocuments(id: string): Promise<DocumentRecord[]>;
  recordDocumentGenerated(
    id: string,
    generation: DocumentGeneration,
  ): Promise<void>;

  getRoutingPreferences(projectId: string): Promise<RoutingPreferences>;
  dismissRecommendation(
    projectId: string,
    recommendationId: string,
  ): Promise<RoutingPreferences>;
  restoreRecommendation(
    projectId: string,
    recommendationId: string,
  ): Promise<RoutingPreferences>;
  restoreAllRecommendations(projectId: string): Promise<RoutingPreferences>;
}
