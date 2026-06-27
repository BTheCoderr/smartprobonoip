import type {
  ResearchWorkspaceData,
  SaveReferenceInput,
  SavedReference,
  UpdateReferenceInput,
} from "./types";

const PREFIX = "smartprobonoip:research:";

function key(projectId: string): string {
  return `${PREFIX}${projectId}`;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ref-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyWorkspace(projectId: string): ResearchWorkspaceData {
  return {
    projectId,
    searchKeywords: [],
    suggestedQueries: [],
    queryGroups: [],
    savedReferences: [],
  };
}

export function readLocalResearch(projectId: string): ResearchWorkspaceData {
  if (typeof window === "undefined") return emptyWorkspace(projectId);
  try {
    const raw = window.localStorage.getItem(key(projectId));
    if (!raw) return emptyWorkspace(projectId);
    const parsed = JSON.parse(raw) as Partial<ResearchWorkspaceData>;
    return {
      ...emptyWorkspace(projectId),
      ...parsed,
      projectId,
      savedReferences: (parsed.savedReferences ?? []).map(normalizeLocalReference),
    };
  } catch {
    return emptyWorkspace(projectId);
  }
}

function normalizeLocalReference(ref: SavedReference): SavedReference {
  return {
    id: ref.id,
    title: ref.title ?? "",
    url: ref.url ?? "",
    referenceType: ref.referenceType ?? "",
    searchQueryUsed: ref.searchQueryUsed ?? "",
    looksSimilar: ref.looksSimilar ?? "",
    seemsDifferent: ref.seemsDifferent ?? "",
    expertQuestions: ref.expertQuestions ?? "",
    notes: ref.notes ?? "",
    comparison: ref.comparison,
    gapMap: ref.gapMap,
    createdAt: ref.createdAt ?? new Date().toISOString(),
    updatedAt: ref.updatedAt,
  };
}

export function writeLocalResearch(data: ResearchWorkspaceData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(data.projectId), JSON.stringify(data));
}

export function mergeLocalResearch(
  projectId: string,
  patch: Partial<ResearchWorkspaceData>,
): ResearchWorkspaceData {
  const current = readLocalResearch(projectId);
  const merged = { ...current, ...patch, projectId };
  writeLocalResearch(merged);
  return merged;
}

export function saveLocalReference(
  projectId: string,
  input: SaveReferenceInput,
): SavedReference {
  const data = readLocalResearch(projectId);
  const ref: SavedReference = {
    id: newId(),
    title: input.title,
    url: input.url ?? "",
    referenceType: input.referenceType ?? "",
    searchQueryUsed: input.searchQueryUsed ?? "",
    looksSimilar: input.looksSimilar ?? "",
    seemsDifferent: input.seemsDifferent ?? "",
    expertQuestions: input.expertQuestions ?? "",
    notes: input.notes ?? "",
    createdAt: new Date().toISOString(),
  };
  data.savedReferences = [ref, ...data.savedReferences];
  writeLocalResearch(data);
  return ref;
}

export function updateLocalReference(
  projectId: string,
  input: UpdateReferenceInput,
): SavedReference | null {
  const data = readLocalResearch(projectId);
  const idx = data.savedReferences.findIndex((r) => r.id === input.id);
  if (idx < 0) return null;
  const updated: SavedReference = {
    ...data.savedReferences[idx],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  data.savedReferences[idx] = updated;
  writeLocalResearch(data);
  return updated;
}

export function deleteLocalReference(
  projectId: string,
  refId: string,
): void {
  const data = readLocalResearch(projectId);
  data.savedReferences = data.savedReferences.filter((r) => r.id !== refId);
  writeLocalResearch(data);
}
