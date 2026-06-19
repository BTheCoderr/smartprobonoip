import { DEFAULT_FOLLOW_UP } from "../records";
import type { ProjectRecord, ReadinessProfile } from "../types";
import type { SaveInput, Store } from "./types";

const KEY = "smartprobonoip:records";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readAll(): ProjectRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProjectRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: ProjectRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(records));
}

export const localStore: Store = {
  backend: "local",

  async saveRecord(input: SaveInput): Promise<ProjectRecord> {
    const record: ProjectRecord = {
      id: newId(),
      createdAt: new Date().toISOString(),
      answers: input.answers,
      profile: input.profile,
      preClarity: input.preClarity,
      postClarity: null,
      isDemo: input.isDemo ?? false,
      followUpStatus: DEFAULT_FOLLOW_UP,
    };
    const all = readAll();
    all.unshift(record);
    writeAll(all);
    return record;
  },

  async getRecord(id: string): Promise<ProjectRecord | null> {
    return readAll().find((r) => r.id === id) ?? null;
  },

  async listRecords(): Promise<ProjectRecord[]> {
    return readAll();
  },

  async updatePostClarity(id: string, postClarity: number): Promise<void> {
    const all = readAll();
    const next = all.map((r) => (r.id === id ? { ...r, postClarity } : r));
    writeAll(next);
  },

  async updateProfile(id: string, profile: ReadinessProfile): Promise<void> {
    const all = readAll();
    const next = all.map((r) => (r.id === id ? { ...r, profile } : r));
    writeAll(next);
  },
};
