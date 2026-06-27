import type { IntakeAnswers, ProjectRecord, ReadinessProfile } from "../types";
import type { PilotTracking } from "../partnerTracking";

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
  getRecord(id: string): Promise<ProjectRecord | null>;
  listRecords(): Promise<ProjectRecord[]>;
  updatePostClarity(id: string, postClarity: number): Promise<void>;
  updateProfile(id: string, profile: ReadinessProfile): Promise<void>;
}
