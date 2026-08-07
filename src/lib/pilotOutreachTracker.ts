export const PILOT_OUTREACH_TYPES = [
  "inventor",
  "founder",
  "attorney",
  "IP analyst",
  "org",
] as const;

export const PILOT_OUTREACH_SOURCES = [
  "Reddit",
  "warm_intro",
  "referral",
  "email",
  "local",
] as const;

export const PILOT_OUTREACH_STATUSES = [
  "contacted",
  "replied",
  "testing",
  "completed",
  "feedback received",
] as const;

export const YES_NO = ["yes", "no"] as const;

export type PilotOutreachType = (typeof PILOT_OUTREACH_TYPES)[number];
export type PilotOutreachSource = (typeof PILOT_OUTREACH_SOURCES)[number];
export type PilotOutreachStatus = (typeof PILOT_OUTREACH_STATUSES)[number];
export type YesNo = (typeof YES_NO)[number];

export interface PilotOutreachRow {
  id: string;
  name: string;
  type: PilotOutreachType;
  source: PilotOutreachSource;
  status: PilotOutreachStatus;
  packetCompleted: YesNo;
  pdfDownloaded: YesNo;
  mainFeedback: string;
  followUpNeeded: string;
  permissionToQuote: YesNo;
  updatedAt: string;
  createdAt: string;
}

export type PilotOutreachDraft = Omit<
  PilotOutreachRow,
  "id" | "createdAt" | "updatedAt"
>;

const STORAGE_KEY = "smartprobonoip-pilot-outreach-tracker-v1";

export const EMPTY_OUTREACH_DRAFT: PilotOutreachDraft = {
  name: "",
  type: "inventor",
  source: "local",
  status: "contacted",
  packetCompleted: "no",
  pdfDownloaded: "no",
  mainFeedback: "",
  followUpNeeded: "",
  permissionToQuote: "no",
};

function isYesNo(value: unknown): value is YesNo {
  return value === "yes" || value === "no";
}

function isType(value: unknown): value is PilotOutreachType {
  return (PILOT_OUTREACH_TYPES as readonly string[]).includes(String(value));
}

function isSource(value: unknown): value is PilotOutreachSource {
  return (PILOT_OUTREACH_SOURCES as readonly string[]).includes(String(value));
}

function isStatus(value: unknown): value is PilotOutreachStatus {
  return (PILOT_OUTREACH_STATUSES as readonly string[]).includes(String(value));
}

function normalizeRow(raw: unknown): PilotOutreachRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.name !== "string") return null;
  if (!isType(row.type) || !isSource(row.source) || !isStatus(row.status)) {
    return null;
  }
  if (
    !isYesNo(row.packetCompleted) ||
    !isYesNo(row.pdfDownloaded) ||
    !isYesNo(row.permissionToQuote)
  ) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    source: row.source,
    status: row.status,
    packetCompleted: row.packetCompleted,
    pdfDownloaded: row.pdfDownloaded,
    mainFeedback: typeof row.mainFeedback === "string" ? row.mainFeedback : "",
    followUpNeeded:
      typeof row.followUpNeeded === "string" ? row.followUpNeeded : "",
    permissionToQuote: row.permissionToQuote,
    createdAt:
      typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
    updatedAt:
      typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
  };
}

type Listener = () => void;

let cachedRows: PilotOutreachRow[] | null = null;
const listeners = new Set<Listener>();

function readRowsFromStorage(): PilotOutreachRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeRow)
      .filter((row): row is PilotOutreachRow => row !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

function writeRowsToStorage(rows: PilotOutreachRow[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* storage full or unavailable */
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function loadPilotOutreachRows(): PilotOutreachRow[] {
  if (cachedRows === null) {
    cachedRows = readRowsFromStorage();
  }
  return cachedRows;
}

export function savePilotOutreachRows(rows: PilotOutreachRow[]): void {
  cachedRows = rows;
  writeRowsToStorage(rows);
  emit();
}

export function subscribePilotOutreachRows(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPilotOutreachServerSnapshot(): PilotOutreachRow[] {
  return [];
}

export function createPilotOutreachRow(
  draft: PilotOutreachDraft,
): PilotOutreachRow {
  const now = new Date().toISOString();
  return {
    ...draft,
    name: draft.name.trim(),
    mainFeedback: draft.mainFeedback.trim(),
    followUpNeeded: draft.followUpNeeded.trim(),
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `outreach-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
}

export function updatePilotOutreachRow(
  existing: PilotOutreachRow,
  draft: PilotOutreachDraft,
): PilotOutreachRow {
  return {
    ...existing,
    ...draft,
    name: draft.name.trim(),
    mainFeedback: draft.mainFeedback.trim(),
    followUpNeeded: draft.followUpNeeded.trim(),
    updatedAt: new Date().toISOString(),
  };
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export const PILOT_OUTREACH_CSV_HEADERS = [
  "Name",
  "Type",
  "Source",
  "Status",
  "Packet completed",
  "PDF downloaded",
  "Main feedback",
  "Follow-up needed",
  "Permission to quote",
  "Updated at",
  "Created at",
] as const;

export function pilotOutreachRowsToCsv(rows: PilotOutreachRow[]): string {
  const lines = [
    PILOT_OUTREACH_CSV_HEADERS.join(","),
    ...rows.map((row) =>
      [
        row.name,
        row.type,
        row.source,
        row.status,
        row.packetCompleted,
        row.pdfDownloaded,
        row.mainFeedback,
        row.followUpNeeded,
        row.permissionToQuote,
        row.updatedAt,
        row.createdAt,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}

export function downloadPilotOutreachCsv(rows: PilotOutreachRow[]): void {
  const csv = pilotOutreachRowsToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `smartprobonoip-pilot-outreach-${stamp}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
