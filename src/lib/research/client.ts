import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { pilotSessionHeaders } from "@/lib/pilotSession";
import { buildResearchPrepFromRecord } from "@/lib/research/buildLinks";
import {
  deleteLocalReference,
  mergeLocalResearch,
  readLocalResearch,
  saveLocalReference,
  updateLocalReference,
} from "@/lib/research/localResearch";
import type {
  CompareReferenceOutput,
  ResearchWorkspaceData,
  SaveReferenceInput,
  SavedReference,
  UpdateReferenceInput,
} from "@/lib/research/types";
import type { ProjectRecord } from "@/lib/types";

export function initLocalWorkspace(record: ProjectRecord): ResearchWorkspaceData {
  const prep = buildResearchPrepFromRecord(record);
  return mergeLocalResearch(record.id, {
    searchKeywords: prep.searchKeywords,
    suggestedQueries: prep.suggestedQueries,
  });
}

export async function loadWorkspace(
  record: ProjectRecord,
): Promise<ResearchWorkspaceData> {
  const prep = buildResearchPrepFromRecord(record);

  if (record.isDemo || !isSupabaseConfigured()) {
    const local = readLocalResearch(record.id);
    return {
      ...local,
      projectId: record.id,
      searchKeywords: prep.searchKeywords,
      suggestedQueries: prep.suggestedQueries,
    };
  }

  const res = await fetch(`/api/research/${record.id}`, {
    headers: pilotSessionHeaders(),
  });

  if (res.status === 503) {
    return initLocalWorkspace(record);
  }

  if (!res.ok) {
    throw new Error("Failed to load research workspace");
  }

  const data = (await res.json()) as { workspace: ResearchWorkspaceData };
  return data.workspace;
}

export async function saveReference(
  projectId: string,
  input: SaveReferenceInput,
  isDemo = false,
): Promise<SavedReference> {
  if (isDemo || !isSupabaseConfigured()) {
    return saveLocalReference(projectId, input);
  }

  const res = await fetch(`/api/research/${projectId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...pilotSessionHeaders(),
    },
    body: JSON.stringify({ action: "save", reference: input }),
  });

  if (!res.ok) throw new Error("Failed to save reference");
  const data = (await res.json()) as { reference: SavedReference };
  return data.reference;
}

export async function updateReference(
  projectId: string,
  input: UpdateReferenceInput,
  isDemo = false,
): Promise<SavedReference> {
  if (isDemo || !isSupabaseConfigured()) {
    const updated = updateLocalReference(projectId, input);
    if (!updated) throw new Error("Reference not found");
    return updated;
  }

  const res = await fetch(`/api/research/${projectId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...pilotSessionHeaders(),
    },
    body: JSON.stringify({ action: "update", update: input }),
  });

  if (!res.ok) throw new Error("Failed to update reference");
  const data = (await res.json()) as { reference: SavedReference };
  return data.reference;
}

export async function removeReference(
  projectId: string,
  refId: string,
  isDemo = false,
): Promise<void> {
  if (isDemo || !isSupabaseConfigured()) {
    deleteLocalReference(projectId, refId);
    return;
  }

  const res = await fetch(`/api/research/${projectId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...pilotSessionHeaders(),
    },
    body: JSON.stringify({ action: "delete", refId }),
  });

  if (!res.ok) throw new Error("Failed to delete reference");
}

export async function compareReference(input: {
  record: ProjectRecord;
  referenceTitle: string;
  referenceNotes: string;
  userDescribedDifferences: string;
}): Promise<CompareReferenceOutput> {
  const { record, referenceTitle, referenceNotes, userDescribedDifferences } =
    input;
  const res = await fetch("/api/compare-reference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      problemSolved: record.answers.problemSolved,
      howItWorks: record.answers.howItWorks,
      mainParts: record.answers.mainParts,
      userDescribedDifferences:
        userDescribedDifferences || record.answers.whatDifferent,
      referenceTitle,
      referenceAbstract: referenceNotes,
    }),
  });

  if (!res.ok) throw new Error("Comparison failed");
  const data = (await res.json()) as { comparison: CompareReferenceOutput };
  return data.comparison;
}

export function getLocalSavedReferences(projectId: string): SavedReference[] {
  return readLocalResearch(projectId).savedReferences;
}
