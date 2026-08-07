import {
  documentDisplayLabel,
  findDocumentDescriptor,
  sortDocumentsByNewest,
} from "../ideas/documents";
import { toInventionSummary } from "../ideas/summary";
import { resolveInventionTitle } from "../ideas/title";
import type {
  DocumentGeneration,
  DocumentRecord,
  GeneratedDocument,
  InventionUpdate,
} from "../ideas/types";
import { buildPortfolioSummary } from "../portfolio/aggregate";
import type { PortfolioSnapshot } from "../portfolio/types";
import {
  dismissRecommendationId,
  normalizeRoutingPreferences,
  restoreAllDismissals,
  restoreRecommendationId,
  type RoutingPreferences,
} from "../routing/dismissals";
import { DEFAULT_FOLLOW_UP } from "../records";
import { deriveTimelineEvents, sortEventsByNewest } from "../timeline/derive";
import { timelineEventLabel } from "../timeline/eventTypes";
import type { ActivityEvent, TimelineEvent } from "../timeline/types";
import type { DevelopmentTimeline, ProjectRecord, ReadinessProfile } from "../types";
import type { SaveInput, Store } from "./types";

const KEY = "smartprobonoip:records";
const DOCUMENTS_KEY = "smartprobonoip:documents";
const ROUTING_PREFS_KEY = "smartprobonoip:routing-preferences";

const RECENT_ACTIVITY_LIMIT = 12;
const RECENT_DOCUMENTS_LIMIT = 6;

/** Mirrors the smartprobonoip_documents row shape so both stores agree. */
type StoredDocument = DocumentRecord;

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

function readDocuments(): StoredDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DOCUMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredDocument[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDocuments(documents: StoredDocument[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
}

function readRoutingPreferencesMap(): Record<string, RoutingPreferences> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ROUTING_PREFS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, RoutingPreferences> = {};
    for (const [projectId, value] of Object.entries(parsed)) {
      out[projectId] = normalizeRoutingPreferences(value);
    }
    return out;
  } catch {
    return {};
  }
}

function writeRoutingPreferencesMap(
  map: Record<string, RoutingPreferences>,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROUTING_PREFS_KEY, JSON.stringify(map));
}

function getLocalRoutingPreferences(projectId: string): RoutingPreferences {
  const map = readRoutingPreferencesMap();
  return map[projectId] ?? { dismissedRecommendationIds: [] };
}

function setLocalRoutingPreferences(
  projectId: string,
  preferences: RoutingPreferences,
): RoutingPreferences {
  const map = readRoutingPreferencesMap();
  map[projectId] = preferences;
  writeRoutingPreferencesMap(map);
  return preferences;
}

function documentEvent(doc: StoredDocument): TimelineEvent {
  return {
    id: doc.id,
    inventionId: doc.inventionId,
    type: "document_generated",
    label: timelineEventLabel("document_generated"),
    detail: `${documentDisplayLabel(doc)} generated.`,
    occurredAt: doc.createdAt,
    source: "user",
  };
}

function eventsForRecord(
  record: ProjectRecord,
  documents: StoredDocument[],
): TimelineEvent[] {
  const docEvents = documents
    .filter((doc) => doc.inventionId === record.id)
    .map(documentEvent);
  return sortEventsByNewest([...deriveTimelineEvents(record), ...docEvents]);
}

function touch(record: ProjectRecord): ProjectRecord {
  return { ...record, updatedAt: new Date().toISOString() };
}

export const localStore: Store = {
  backend: "local",

  async saveRecord(input: SaveInput): Promise<ProjectRecord> {
    const createdAt = new Date().toISOString();
    const record: ProjectRecord = {
      id: newId(),
      createdAt,
      updatedAt: createdAt,
      title: resolveInventionTitle(input.answers),
      status: "packet_generated",
      archivedAt: null,
      answers: input.answers,
      profile: input.profile,
      preClarity: input.preClarity,
      postClarity: null,
      isDemo: input.isDemo ?? false,
      followUpStatus: DEFAULT_FOLLOW_UP,
      partnerSlug: input.isDemo ? null : (input.tracking?.partnerSlug ?? null),
      partnerName: input.isDemo ? null : (input.tracking?.partnerName ?? null),
      source: input.isDemo ? null : (input.tracking?.source ?? null),
      campaign: input.isDemo ? null : (input.tracking?.campaign ?? null),
      developmentTimeline: {},
    };
    const all = readAll();
    all.unshift(record);
    writeAll(all);
    return record;
  },

  async updateRecord(id: string, input: SaveInput): Promise<ProjectRecord> {
    const all = readAll();
    let updated: ProjectRecord | null = null;
    const next = all.map((r) => {
      if (r.id !== id) return r;
      updated = touch({
        ...r,
        title: resolveInventionTitle(input.answers, r.title),
        answers: input.answers,
        profile: input.profile,
        preClarity: input.preClarity,
        isDemo: input.isDemo ?? r.isDemo,
      });
      return updated;
    });
    if (!updated) throw new Error("Record not found");
    writeAll(next);
    return updated;
  },

  async getRecord(id: string): Promise<ProjectRecord | null> {
    return readAll().find((r) => r.id === id) ?? null;
  },

  async listRecords(): Promise<ProjectRecord[]> {
    return readAll();
  },

  async updatePostClarity(id: string, postClarity: number): Promise<void> {
    const all = readAll();
    const next = all.map((r) => (r.id === id ? touch({ ...r, postClarity }) : r));
    writeAll(next);
  },

  async updateProfile(id: string, profile: ReadinessProfile): Promise<void> {
    const all = readAll();
    const next = all.map((r) => (r.id === id ? touch({ ...r, profile }) : r));
    writeAll(next);
  },

  async updateDevelopmentTimeline(
    id: string,
    timeline: DevelopmentTimeline,
  ): Promise<ProjectRecord> {
    const all = readAll();
    let updated: ProjectRecord | null = null;
    const next = all.map((r) => {
      if (r.id !== id) return r;
      updated = touch({ ...r, developmentTimeline: timeline });
      return updated;
    });
    if (!updated) throw new Error("Record not found");
    writeAll(next);
    return updated;
  },

  async getPortfolio(): Promise<PortfolioSnapshot> {
    const records = readAll().filter((record) => !record.isDemo);
    const documents = readDocuments();

    const inventions = records.map((record) => {
      const events = eventsForRecord(record, documents);
      return toInventionSummary({
        record,
        documentCount: events.filter((e) => e.type === "document_generated")
          .length,
        lastEventAt: events[0]?.occurredAt ?? null,
      });
    });

    const titleById = new Map(inventions.map((i) => [i.id, i.title]));

    const recentActivity: ActivityEvent[] = sortEventsByNewest(
      records.flatMap((record) => eventsForRecord(record, documents)),
    )
      .slice(0, RECENT_ACTIVITY_LIMIT)
      .map((event) => ({
        ...event,
        inventionTitle: titleById.get(event.inventionId) ?? "Invention",
      }));

    const recentDocuments: GeneratedDocument[] = sortDocumentsByNewest(
      documents
        .filter((doc) => titleById.has(doc.inventionId))
        .map((doc) => ({
          ...doc,
          inventionTitle: titleById.get(doc.inventionId) ?? "Invention",
        })),
    ).slice(0, RECENT_DOCUMENTS_LIMIT);

    return {
      inventions,
      summary: buildPortfolioSummary(inventions),
      recentActivity,
      recentDocuments,
    };
  },

  async getTimeline(id: string): Promise<TimelineEvent[]> {
    const record = readAll().find((r) => r.id === id);
    if (!record) return [];
    return eventsForRecord(record, readDocuments());
  },

  async updateInvention(
    id: string,
    update: InventionUpdate,
  ): Promise<ProjectRecord> {
    const all = readAll();
    let updated: ProjectRecord | null = null;
    const next = all.map((r) => {
      if (r.id !== id) return r;
      updated = touch({
        ...r,
        title: update.title?.trim() ? update.title.trim() : r.title,
        status: update.status ?? r.status,
        archivedAt:
          update.status === "archived" ? new Date().toISOString() : null,
      });
      return updated;
    });
    if (!updated) throw new Error("Record not found");
    writeAll(next);
    return updated;
  },

  async listDocuments(id: string): Promise<DocumentRecord[]> {
    return sortDocumentsByNewest(
      readDocuments().filter((doc) => doc.inventionId === id),
    );
  },

  async recordDocumentGenerated(
    id: string,
    generation: DocumentGeneration,
  ): Promise<void> {
    const descriptor = findDocumentDescriptor(
      generation.kind,
      generation.format,
    );
    if (!descriptor) return;

    const documents = readDocuments();
    documents.unshift({
      id: newId(),
      inventionId: id,
      title: descriptor.title,
      kind: descriptor.kind,
      format: descriptor.format,
      origin: "generated",
      createdAt: new Date().toISOString(),
      storageUrl: null,
    });
    writeDocuments(documents.slice(0, 200));
  },

  async getRoutingPreferences(projectId: string): Promise<RoutingPreferences> {
    return getLocalRoutingPreferences(projectId);
  },

  async dismissRecommendation(
    projectId: string,
    recommendationId: string,
  ): Promise<RoutingPreferences> {
    const current = getLocalRoutingPreferences(projectId);
    return setLocalRoutingPreferences(
      projectId,
      dismissRecommendationId(current, recommendationId),
    );
  },

  async restoreRecommendation(
    projectId: string,
    recommendationId: string,
  ): Promise<RoutingPreferences> {
    const current = getLocalRoutingPreferences(projectId);
    return setLocalRoutingPreferences(
      projectId,
      restoreRecommendationId(current, recommendationId),
    );
  },

  async restoreAllRecommendations(projectId: string): Promise<RoutingPreferences> {
    return setLocalRoutingPreferences(projectId, restoreAllDismissals());
  },
};
