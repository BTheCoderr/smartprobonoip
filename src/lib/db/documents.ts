import "server-only";
import { findDocumentDescriptor } from "@/lib/ideas/documents";
import type {
  DocumentFormat,
  DocumentKind,
  DocumentRecord,
} from "@/lib/ideas/types";
import { getSupabaseService } from "@/lib/supabaseServer";

const TABLE = "smartprobonoip_documents";

const SELECT =
  "id, project_id, title, document_type, file_format, origin, created_at, public_url";

interface DocumentRow {
  id: string;
  project_id: string;
  title: string;
  document_type: string;
  file_format: string;
  origin: string;
  created_at: string;
  public_url: string | null;
}

function rowToDocument(row: DocumentRow): DocumentRecord | null {
  const descriptor = findDocumentDescriptor(row.document_type, row.file_format);
  if (!descriptor) return null;

  return {
    id: row.id,
    inventionId: row.project_id,
    title: row.title,
    kind: descriptor.kind,
    format: descriptor.format,
    origin: row.origin === "uploaded" ? "uploaded" : "generated",
    createdAt: row.created_at,
    storageUrl: row.public_url,
  };
}

function mapRows(rows: unknown): DocumentRecord[] {
  return (rows as DocumentRow[])
    .map(rowToDocument)
    .filter((doc): doc is DocumentRecord => doc !== null);
}

export interface CreateDocumentInput {
  projectId: string;
  pilotSessionId: string | null;
  kind: DocumentKind;
  format: DocumentFormat;
}

/**
 * Records an artifact the inventor just generated. The artifact itself is never
 * uploaded — only the fact that it was produced, so it can be listed later and
 * regenerated on demand.
 */
export async function createDocument(
  input: CreateDocumentInput,
): Promise<DocumentRecord | null> {
  const descriptor = findDocumentDescriptor(input.kind, input.format);
  if (!descriptor) return null;

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from(TABLE)
    .insert({
      project_id: input.projectId,
      pilot_session_id: input.pilotSessionId,
      title: descriptor.title,
      document_type: descriptor.kind,
      file_format: descriptor.format,
      origin: "generated",
    })
    .select(SELECT)
    .single();

  if (error || !data) return null;
  return rowToDocument(data as DocumentRow);
}

export async function listDocumentsForProject(
  projectId: string,
  limit = 25,
): Promise<DocumentRecord[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from(TABLE)
    .select(SELECT)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return mapRows(data);
}

/** Newest documents across every invention owned by a session. */
export async function listDocumentsForProjects(
  projectIds: string[],
  limit = 6,
): Promise<DocumentRecord[]> {
  if (projectIds.length === 0) return [];

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from(TABLE)
    .select(SELECT)
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return mapRows(data);
}

export async function countDocumentsByProject(
  projectIds: string[],
): Promise<Record<string, number>> {
  if (projectIds.length === 0) return {};

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from(TABLE)
    .select("project_id")
    .in("project_id", projectIds);

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data as { project_id: string }[]) {
    counts[row.project_id] = (counts[row.project_id] ?? 0) + 1;
  }
  return counts;
}
