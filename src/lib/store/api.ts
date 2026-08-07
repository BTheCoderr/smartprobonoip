import { pilotSessionHeaders } from "../pilotSession";
import { isSupabaseConfigured } from "../supabaseClient";
import type { DevelopmentTimeline, ProjectRecord, ReadinessProfile } from "../types";
import type {
  DocumentGeneration,
  DocumentRecord,
  InventionUpdate,
} from "../ideas/types";
import type { PortfolioSnapshot } from "../portfolio/types";
import type { TimelineEvent } from "../timeline/types";
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

  async updateRecord(id: string, input: SaveInput): Promise<ProjectRecord> {
    const res = await fetch(`/api/records/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
      },
      body: JSON.stringify({
        answers: input.answers,
        profile: input.profile,
        preClarity: input.preClarity,
      }),
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

  async getPortfolio(): Promise<PortfolioSnapshot> {
    const res = await fetch("/api/portfolio", {
      headers: pilotSessionHeaders(),
    });
    if (!res.ok) {
      throw new Error("Could not load your workspace");
    }
    const data = (await res.json()) as { snapshot: PortfolioSnapshot };
    return data.snapshot;
  },

  async getTimeline(id: string): Promise<TimelineEvent[]> {
    const res = await fetch(`/api/records/${id}/events`, {
      headers: pilotSessionHeaders(),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { events: TimelineEvent[] };
    return data.events;
  },

  async updateInvention(
    id: string,
    update: InventionUpdate,
  ): Promise<ProjectRecord> {
    const res = await fetch(`/api/records/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
      },
      body: JSON.stringify(update),
    });
    return parseRecord(res);
  },

  async listDocuments(id: string): Promise<DocumentRecord[]> {
    const res = await fetch(`/api/records/${id}/documents`, {
      headers: pilotSessionHeaders(),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { documents: DocumentRecord[] };
    return data.documents;
  },

  async recordDocumentGenerated(
    id: string,
    generation: DocumentGeneration,
  ): Promise<void> {
    // Best effort: a missing document row must never block an export the user
    // has already received.
    try {
      await fetch(`/api/records/${id}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...pilotSessionHeaders(),
        },
        body: JSON.stringify(generation),
      });
    } catch {
      // Ignored on purpose.
    }
  },

  async getRoutingPreferences(projectId: string): Promise<import("../routing/dismissals").RoutingPreferences> {
    const res = await fetch(`/api/records/${projectId}/recommendations`, {
      headers: pilotSessionHeaders(),
    });
    if (!res.ok) {
      return { dismissedRecommendationIds: [] };
    }
    const data = (await res.json()) as {
      preferences: import("../routing/dismissals").RoutingPreferences;
    };
    return data.preferences;
  },

  async dismissRecommendation(
    projectId: string,
    recommendationId: string,
  ): Promise<import("../routing/dismissals").RoutingPreferences> {
    const res = await fetch(`/api/records/${projectId}/recommendations`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
      },
      body: JSON.stringify({ action: "dismiss", recommendationId }),
    });
    if (!res.ok) throw new Error("Could not dismiss recommendation");
    const data = (await res.json()) as {
      preferences: import("../routing/dismissals").RoutingPreferences;
    };
    return data.preferences;
  },

  async restoreRecommendation(
    projectId: string,
    recommendationId: string,
  ): Promise<import("../routing/dismissals").RoutingPreferences> {
    const res = await fetch(`/api/records/${projectId}/recommendations`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
      },
      body: JSON.stringify({ action: "restore", recommendationId }),
    });
    if (!res.ok) throw new Error("Could not restore recommendation");
    const data = (await res.json()) as {
      preferences: import("../routing/dismissals").RoutingPreferences;
    };
    return data.preferences;
  },

  async restoreAllRecommendations(
    projectId: string,
  ): Promise<import("../routing/dismissals").RoutingPreferences> {
    const res = await fetch(`/api/records/${projectId}/recommendations`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
      },
      body: JSON.stringify({ action: "restore_all" }),
    });
    if (!res.ok) throw new Error("Could not restore recommendations");
    const data = (await res.json()) as {
      preferences: import("../routing/dismissals").RoutingPreferences;
    };
    return data.preferences;
  },
};

export function isApiStoreAvailable(): boolean {
  return isSupabaseConfigured();
}
