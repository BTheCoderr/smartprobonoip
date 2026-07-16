"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  CalloutCard,
  DossierPageHeader,
  EmptyStateCard,
  PaperShell,
  Section,
  SectionHeader,
  StampLabel,
} from "@/components/ui/design";
import {
  createPilotOutreachRow,
  downloadPilotOutreachCsv,
  EMPTY_OUTREACH_DRAFT,
  getPilotOutreachServerSnapshot,
  loadPilotOutreachRows,
  PILOT_OUTREACH_SOURCES,
  PILOT_OUTREACH_STATUSES,
  PILOT_OUTREACH_TYPES,
  type PilotOutreachDraft,
  type PilotOutreachRow,
  type PilotOutreachSource,
  type PilotOutreachStatus,
  type PilotOutreachType,
  savePilotOutreachRows,
  subscribePilotOutreachRows,
  updatePilotOutreachRow,
  YES_NO,
  type YesNo,
} from "@/lib/pilotOutreachTracker";
import { useIsClient } from "@/lib/useIsClient";

type FilterValue = "all" | string;

function draftFromRow(row: PilotOutreachRow): PilotOutreachDraft {
  return {
    name: row.name,
    type: row.type,
    source: row.source,
    status: row.status,
    packetCompleted: row.packetCompleted,
    pdfDownloaded: row.pdfDownloaded,
    mainFeedback: row.mainFeedback,
    followUpNeeded: row.followUpNeeded,
    permissionToQuote: row.permissionToQuote,
  };
}

function SelectControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="input-surface mt-1.5"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: FilterValue;
  options: readonly string[];
  onChange: (value: FilterValue) => void;
}) {
  return (
    <label className="block min-w-[140px] flex-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-surface mt-1.5"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function PilotTrackerClient() {
  const isClient = useIsClient();
  const rows = useSyncExternalStore(
    subscribePilotOutreachRows,
    loadPilotOutreachRows,
    getPilotOutreachServerSnapshot,
  );
  const [draft, setDraft] = useState<PilotOutreachDraft>(EMPTY_OUTREACH_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [typeFilter, setTypeFilter] = useState<FilterValue>("all");
  const [sourceFilter, setSourceFilter] = useState<FilterValue>("all");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!savedFlash) return;
    const timer = window.setTimeout(() => setSavedFlash(false), 1800);
    return () => window.clearTimeout(timer);
  }, [savedFlash]);

  function setRows(next: PilotOutreachRow[] | ((prev: PilotOutreachRow[]) => PilotOutreachRow[])) {
    const resolved = typeof next === "function" ? next(rows) : next;
    savePilotOutreachRows(resolved);
  }

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (sourceFilter !== "all" && row.source !== sourceFilter) return false;
      return true;
    });
  }, [rows, statusFilter, typeFilter, sourceFilter]);

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(
      PILOT_OUTREACH_STATUSES.map((status) => [status, 0]),
    ) as Record<PilotOutreachStatus, number>;
    for (const row of rows) {
      byStatus[row.status] += 1;
    }
    return {
      total: rows.length,
      packetDone: rows.filter((r) => r.packetCompleted === "yes").length,
      pdfDone: rows.filter((r) => r.pdfDownloaded === "yes").length,
      quoteOk: rows.filter((r) => r.permissionToQuote === "yes").length,
      byStatus,
    };
  }, [rows]);

  function resetForm() {
    setDraft(EMPTY_OUTREACH_DRAFT);
    setEditingId(null);
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;

    if (editingId) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === editingId ? updatePilotOutreachRow(row, draft) : row,
        ),
      );
    } else {
      setRows((prev) => [createPilotOutreachRow(draft), ...prev]);
    }
    setSavedFlash(true);
    resetForm();
  }

  function startEdit(row: PilotOutreachRow) {
    setEditingId(row.id);
    setDraft(draftFromRow(row));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this outreach row from local storage?")) return;
    setRows((prev) => prev.filter((row) => row.id !== id));
    if (editingId === id) resetForm();
  }

  function handleExport() {
    downloadPilotOutreachCsv(filtered.length > 0 ? filtered : rows);
  }

  function handleClearAll() {
    if (rows.length === 0) return;
    if (
      !window.confirm(
        "Clear all outreach rows from this browser? Export CSV first if you need a backup.",
      )
    ) {
      return;
    }
    setRows([]);
    resetForm();
  }

  return (
    <div>
      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">PILOT OPS</StampLabel>
            <StampLabel tone="warm">LOCAL ONLY</StampLabel>
          </>
        }
        kicker="Rhode Island pilot"
        title="Pilot outreach tracker"
        lead="Track people you contacted before sending more testers. Stored in this browser only — not shared across devices unless you export CSV."
        aside={
          <div className="flex w-full flex-col gap-3 lg:max-w-xs">
            <button
              type="button"
              onClick={handleExport}
              disabled={!isClient || rows.length === 0}
              className="btn-primary-lg w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
            <Link href="/smartprobonoip/pilot" className="btn-secondary w-full">
              Back to pilot kit
            </Link>
            <a
              href="/ri-pilot-outreach-tracker.md"
              className="btn-ghost w-full justify-center px-0"
              download
            >
              Markdown template →
            </a>
          </div>
        }
      />

      <Section soft>
        <PaperShell>
          <CalloutCard
            tone="warm"
            title="Local-only ops tool"
            body="Rows live in localStorage on this device. Clearing browser data removes them. Export CSV (or copy the markdown template into Notion/Sheets) before switching computers."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="paper-card px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                Contacts
              </p>
              <p className="mt-1 text-2xl font-semibold text-navy-900">
                {counts.total}
              </p>
            </div>
            <div className="paper-card px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                Packet completed
              </p>
              <p className="mt-1 text-2xl font-semibold text-navy-900">
                {counts.packetDone}
              </p>
            </div>
            <div className="paper-card px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                PDF downloaded
              </p>
              <p className="mt-1 text-2xl font-semibold text-navy-900">
                {counts.pdfDone}
              </p>
            </div>
            <div className="paper-card px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                Quote OK
              </p>
              <p className="mt-1 text-2xl font-semibold text-navy-900">
                {counts.quoteOk}
              </p>
            </div>
          </div>
          {savedFlash ? (
            <p className="mt-4 text-sm font-medium text-teal-700" role="status">
              Saved locally.
            </p>
          ) : null}
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker={editingId ? "Edit row" : "Add contact"}
            title={editingId ? "Update outreach row" : "Log a pilot contact"}
            lead="Capture type, source, status, and whether they finished a packet or PDF."
          />
          <form onSubmit={handleSave} className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block sm:col-span-2 lg:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  Name
                </span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="Name or short handle"
                  className="input-surface mt-1.5"
                />
              </label>
              <SelectControl
                label="Type"
                value={draft.type}
                options={PILOT_OUTREACH_TYPES}
                onChange={(type: PilotOutreachType) =>
                  setDraft((prev) => ({ ...prev, type }))
                }
              />
              <SelectControl
                label="Source"
                value={draft.source}
                options={PILOT_OUTREACH_SOURCES}
                onChange={(source: PilotOutreachSource) =>
                  setDraft((prev) => ({ ...prev, source }))
                }
              />
              <SelectControl
                label="Status"
                value={draft.status}
                options={PILOT_OUTREACH_STATUSES}
                onChange={(status: PilotOutreachStatus) =>
                  setDraft((prev) => ({ ...prev, status }))
                }
              />
              <SelectControl
                label="Packet completed"
                value={draft.packetCompleted}
                options={YES_NO}
                onChange={(packetCompleted: YesNo) =>
                  setDraft((prev) => ({ ...prev, packetCompleted }))
                }
              />
              <SelectControl
                label="PDF downloaded"
                value={draft.pdfDownloaded}
                options={YES_NO}
                onChange={(pdfDownloaded: YesNo) =>
                  setDraft((prev) => ({ ...prev, pdfDownloaded }))
                }
              />
              <SelectControl
                label="Permission to quote"
                value={draft.permissionToQuote}
                options={YES_NO}
                onChange={(permissionToQuote: YesNo) =>
                  setDraft((prev) => ({ ...prev, permissionToQuote }))
                }
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  Main feedback
                </span>
                <textarea
                  value={draft.mainFeedback}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      mainFeedback: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="What they said about the flow, packet, or PDF"
                  className="input-surface mt-1.5"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  Follow-up needed
                </span>
                <textarea
                  value={draft.followUpNeeded}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      followUpNeeded: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Next ask, reminder date, or open question"
                  className="input-surface mt-1.5"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-primary">
                {editingId ? "Save changes" : "Add row"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Roster"
            title="Outreach rows"
            lead="Filter by status, type, or source. CSV export uses the current filter when rows match."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <FilterSelect
              label="Status"
              value={statusFilter}
              options={PILOT_OUTREACH_STATUSES}
              onChange={setStatusFilter}
            />
            <FilterSelect
              label="Type"
              value={typeFilter}
              options={PILOT_OUTREACH_TYPES}
              onChange={setTypeFilter}
            />
            <FilterSelect
              label="Source"
              value={sourceFilter}
              options={PILOT_OUTREACH_SOURCES}
              onChange={setSourceFilter}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={rows.length === 0}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export {filtered.length !== rows.length ? "filtered " : ""}CSV
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={rows.length === 0}
              className="btn-ghost text-warm-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear all local rows
            </button>
          </div>

          {!isClient ? (
            <p className="mt-8 text-sm text-navy-500">Loading local rows…</p>
          ) : filtered.length === 0 ? (
            <div className="mt-8">
              <EmptyStateCard
                title={rows.length === 0 ? "No contacts yet" : "No matches"}
                body={
                  rows.length === 0
                    ? "Add the first pilot contact above. Keep notes here before you invite more testers."
                    : "Try clearing a filter — rows exist, but none match the current combination."
                }
              />
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-mist-200 text-xs uppercase tracking-wide text-navy-500">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Packet</th>
                    <th className="px-3 py-2 font-medium">PDF</th>
                    <th className="px-3 py-2 font-medium">Feedback</th>
                    <th className="px-3 py-2 font-medium">Follow-up</th>
                    <th className="px-3 py-2 font-medium">Quote</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-mist-100 align-top text-navy-700"
                    >
                      <td className="px-3 py-3 font-semibold text-navy-900">
                        {row.name}
                      </td>
                      <td className="px-3 py-3">{row.type}</td>
                      <td className="px-3 py-3">{row.source}</td>
                      <td className="px-3 py-3">{row.status}</td>
                      <td className="px-3 py-3">{row.packetCompleted}</td>
                      <td className="px-3 py-3">{row.pdfDownloaded}</td>
                      <td className="max-w-[14rem] whitespace-pre-wrap px-3 py-3">
                        {row.mainFeedback || "—"}
                      </td>
                      <td className="max-w-[12rem] whitespace-pre-wrap px-3 py-3">
                        {row.followUpNeeded || "—"}
                      </td>
                      <td className="px-3 py-3">{row.permissionToQuote}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            className="text-left text-sm font-medium text-teal-700 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="text-left text-sm font-medium text-warm-700 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PaperShell>
      </Section>

      <Section>
        <PaperShell className="pb-8">
          <p className="text-sm text-navy-500">
            Separate from{" "}
            <Link
              href="/smartprobonoip/leads"
              className="font-medium text-teal-700 hover:underline"
            >
              Interest leads
            </Link>{" "}
            (partner-secret API). This tracker is for founder/pilot outreach
            notes only.
          </p>
        </PaperShell>
      </Section>
    </div>
  );
}
