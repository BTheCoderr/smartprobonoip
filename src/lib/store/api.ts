import { pilotSessionHeaders } from "../pilotSession";
import { isSupabaseConfigured } from "../supabaseClient";
import type { DevelopmentTimeline, ProjectRecord, ReadinessProfile } from "../types";
import type { SaveInput, Store } from "./types";

async function parseRecord(res: Response): Promise<ProjectRecord> {
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Request failed");
  }
  const data = (await res.json()) as { record: ProjectRecord };
  return data.record;
}

export const apiStore: Store = {
  backend: "supabase",

  async saveRecord(input: SaveInput): Promise<ProjectRecord> {
    const res = await fetch("/api/records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
      },
      body: JSON.stringify(input),
    });
    return parseRecord(res);
  },

  async getRecord(id: string): Promise<ProjectRecord | null> {
    const res = await fetch(`/api/records/${id}`, {
      headers: pilotSessionHeaders(),
    });
    if (res.status === 404) return null;
    return parseRecord(res);
  },

  async listRecords(): Promise<ProjectRecord[]> {
    return [];
  },

  async updatePostClarity(id: string, postClarity: number): Promise<void> {
    const res = await fetch(`/api/records/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
      },
      body: JSON.stringify({ postClarity }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? "Update failed");
    }
  },

  async updateProfile(id: string, profile: ReadinessProfile): Promise<void> {
    const res = await fetch(`/api/records/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
      },
      body: JSON.stringify({ profile }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? "Update failed");
    }
  },

  async updateDevelopmentTimeline(
    id: string,
    timeline: DevelopmentTimeline,
  ): Promise<ProjectRecord> {
    const res = await fetch(`/api/records/${id}/timeline`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
      },
      body: JSON.stringify({ developmentTimeline: timeline }),
    });
    return parseRecord(res);
  },
};

export function isApiStoreAvailable(): boolean {
  return isSupabaseConfigured();
}
