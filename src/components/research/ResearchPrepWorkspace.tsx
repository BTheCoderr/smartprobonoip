"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { SaveFeedback } from "@/components/ui/SaveFeedback";
import { trackEvent } from "@/lib/analytics/client";
import { RESEARCH_PREP_COPY } from "@/lib/copy";
import { QuerySearchLauncher } from "@/components/research/QuerySearchLauncher";
import { ReferenceGapMapForm } from "@/components/research/ReferenceGapMapForm";
import {
  buildInitialWorkspace,
  compareReference,
  loadWorkspace,
  removeReference,
  saveReference,
  updateReference,
} from "@/lib/research/client";
import {
  REFERENCE_TYPE_OPTIONS,
  type ResearchWorkspaceData,
  type SavedReference,
} from "@/lib/research/types";
import { normalizeSavedReferences } from "@/lib/research/normalizeReference";
import type { ProjectRecord } from "@/lib/types";

const EMPTY_FORM = {
  title: "",
  url: "",
  referenceType: "patent",
  searchQueryUsed: "",
  looksSimilar: "",
  seemsDifferent: "",
  expertQuestions: "",
  notes: "",
};

export function ResearchPrepWorkspace({
  record,
  onReferencesChange,
  routeName = "packet",
}: {
  record: ProjectRecord;
  onReferencesChange?: (refs: SavedReference[]) => void;
  routeName?: string;
}) {
  const [workspace, setWorkspace] = useState<ResearchWorkspaceData>(() =>
    buildInitialWorkspace(record),
  );
  const [refsLoading, setRefsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [comparingId, setComparingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const viewedTracked = useRef<string | null>(null);

  const syncReferences = useCallback(
    (refs: SavedReference[]) => {
      const normalized = normalizeSavedReferences(refs);
      setWorkspace((current) => ({ ...current, savedReferences: normalized }));
      onReferencesChange?.(normalized);
    },
    [onReferencesChange],
  );

  const fetchSavedReferences = useCallback(async () => {
    try {
      const data = await loadWorkspace(record);
      setWorkspace((current) => ({
        ...current,
        queryGroups: data.queryGroups,
        searchKeywords: data.searchKeywords,
        suggestedQueries: data.suggestedQueries,
      }));
      syncReferences(data.savedReferences);
      setLoadError(data.loadError ?? null);
    } catch {
      setLoadError("Could not load saved references. You can still save new ones.");
      syncReferences([]);
    }
  }, [record, syncReferences]);

  const refreshSavedReferences = useCallback(async () => {
    setRefsLoading(true);
    setLoadError(null);
    await fetchSavedReferences();
    setRefsLoading(false);
  }, [fetchSavedReferences]);

  useEffect(() => {
    if (viewedTracked.current !== record.id) {
      viewedTracked.current = record.id;
      trackEvent("research_workspace_viewed", {
        projectId: record.id,
        metadata: { demo: record.isDemo ?? false, routeName },
      });
    }

    let active = true;
    void (async () => {
      try {
        const data = await loadWorkspace(record);
        if (!active) return;
        syncReferences(data.savedReferences);
        setLoadError(data.loadError ?? null);
      } catch {
        if (!active) return;
        setLoadError("Could not load saved references. You can still save new ones.");
        syncReferences([]);
      } finally {
        if (active) setRefsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [record, routeName, syncReferences]);

  function prefillFromQuery(query: string) {
    setForm((current) => ({
      ...current,
      searchQueryUsed: query,
      title: current.title || `Research note: ${query.slice(0, 48)}`,
    }));
    setEditingId(null);
  }

  async function copyQuery(query: string, queryIndex: number) {
    try {
      await navigator.clipboard.writeText(query);
      trackEvent("query_copied", {
        projectId: record.id,
        metadata: { demo: record.isDemo ?? false, queryIndex },
      });
    } catch {
      setError("Could not copy query.");
    }
  }

  async function onSaveReference(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(null);
    try {
      const payload = {
        title: form.title.trim(),
        url: form.url.trim(),
        referenceType: form.referenceType,
        searchQueryUsed: form.searchQueryUsed.trim(),
        looksSimilar: form.looksSimilar.trim(),
        seemsDifferent: form.seemsDifferent.trim(),
        expertQuestions: form.expertQuestions.trim(),
        notes: form.notes.trim(),
      };

      if (editingId) {
        await updateReference(record.id, { id: editingId, ...payload }, record.isDemo);
        trackEvent("reference_updated", {
          projectId: record.id,
          metadata: { demo: record.isDemo ?? false },
        });
      } else {
        await saveReference(record.id, payload, record.isDemo);
        trackEvent("reference_saved", {
          projectId: record.id,
          metadata: {
            demo: record.isDemo ?? false,
            referenceType: form.referenceType,
          },
        });
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      setSaveSuccess(
        editingId ? "Reference updated." : "Reference saved — it will appear in your PDF.",
      );
      window.setTimeout(() => setSaveSuccess(null), 4000);
      await refreshSavedReferences();
    } catch {
      setError("Could not save reference.");
    } finally {
      setSaving(false);
    }
  }

  async function onCompare(ref: SavedReference) {
    setComparingId(ref.id);
    setError(null);
    try {
      const comparison = await compareReference({
        record,
        referenceTitle: ref.title,
        referenceNotes: ref.notes,
        userDescribedDifferences: ref.seemsDifferent,
      });
      await updateReference(
        record.id,
        {
          id: ref.id,
          looksSimilar: comparison.whatAppearsRelated.join("\n"),
          seemsDifferent: comparison.userDescribedDifferences.join("\n"),
          expertQuestions: comparison.expertQuestions.join("\n"),
          notes: [
            ref.notes,
            comparison.clarifyFurther.length
              ? `What you may want to clarify:\n${comparison.clarifyFurther.join("\n")}`
              : "",
            comparison.materialsToGather.length
              ? `Materials to gather:\n${comparison.materialsToGather.join("\n")}`
              : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
          comparison,
        },
        record.isDemo,
      );
      trackEvent("comparison_helper_used", {
        projectId: record.id,
        metadata: { demo: record.isDemo ?? false },
      });
      await refreshSavedReferences();
    } catch {
      setError("Comparison could not complete.");
    } finally {
      setComparingId(null);
    }
  }

  async function onDelete(refId: string) {
    try {
      await removeReference(record.id, refId, record.isDemo);
      trackEvent("reference_deleted", {
        projectId: record.id,
        metadata: { demo: record.isDemo ?? false },
      });
      await refreshSavedReferences();
    } catch {
      setError("Could not delete reference.");
    }
  }

  function startEdit(ref: SavedReference) {
    setEditingId(ref.id);
    setForm({
      title: ref.title,
      url: ref.url,
      referenceType: ref.referenceType || "other",
      searchQueryUsed: ref.searchQueryUsed,
      looksSimilar: ref.looksSimilar,
      seemsDifferent: ref.seemsDifferent,
      expertQuestions: ref.expertQuestions,
      notes: ref.notes,
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-teal-200/80 bg-gradient-to-br from-teal-50/40 to-white px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm font-semibold text-navy-900">
          {RESEARCH_PREP_COPY.helperTitle}
        </p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {RESEARCH_PREP_COPY.helperSteps.map((step, i) => (
            <li
              key={step}
              className="flex gap-2 rounded-md border border-mist-200/80 bg-white/70 px-3 py-2.5 text-sm leading-relaxed text-navy-700"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="inline-disclaimer w-full">
        <span className="shrink-0 text-warm-600" aria-hidden>
          ⓘ
        </span>
        <span>{RESEARCH_PREP_COPY.helperNote}</span>
      </p>

      <SaveFeedback message={saveSuccess} />

      {loadError ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => void refreshSavedReferences()}
            className="rounded border border-amber-300 px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      <QuerySearchLauncher
        record={record}
        queryGroups={workspace.queryGroups ?? []}
        onCopyQuery={(query, queryIndex) => void copyQuery(query, queryIndex)}
        onPrefillQuery={prefillFromQuery}
      />

      <Card>
        <CardHeader
          title={editingId ? "Edit saved reference" : "Save a possible similar reference"}
          subtitle={RESEARCH_PREP_COPY.saveReferenceHelper}
        />
        <form onSubmit={onSaveReference} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-navy-800">Reference title</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input-surface mt-1"
              placeholder="e.g. US patent for portable filter bottle"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-navy-800">Reference URL</span>
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="input-surface mt-1"
              placeholder="https://"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-navy-800">Reference type</span>
            <select
              value={form.referenceType}
              onChange={(e) =>
                setForm((f) => ({ ...f, referenceType: e.target.value }))
              }
              className="input-surface mt-1"
            >
              {REFERENCE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-navy-800">Search query used</span>
            <input
              value={form.searchQueryUsed}
              onChange={(e) =>
                setForm((f) => ({ ...f, searchQueryUsed: e.target.value }))
              }
              className="input-surface mt-1"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-navy-800">What looks similar</span>
            <textarea
              value={form.looksSimilar}
              onChange={(e) =>
                setForm((f) => ({ ...f, looksSimilar: e.target.value }))
              }
              rows={2}
              className="input-surface mt-1"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-navy-800">What seems different</span>
            <textarea
              value={form.seemsDifferent}
              onChange={(e) =>
                setForm((f) => ({ ...f, seemsDifferent: e.target.value }))
              }
              rows={2}
              className="input-surface mt-1"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-navy-800">
              Questions to ask an expert
            </span>
            <textarea
              value={form.expertQuestions}
              onChange={(e) =>
                setForm((f) => ({ ...f, expertQuestions: e.target.value }))
              }
              rows={2}
              className="input-surface mt-1"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-navy-800">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="input-surface mt-1"
            />
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId ? "Update reference" : "Save reference"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
                className="rounded-lg border border-mist-300 px-4 py-2 text-sm text-navy-700"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Saved references"
          subtitle={
            refsLoading
              ? "Loading saved references…"
              : `${workspace.savedReferences.length} saved — included in your PDF when you download.`
          }
        />
        {refsLoading ? (
          <p className="text-sm text-navy-500">Loading saved references…</p>
        ) : workspace.savedReferences.length === 0 ? (
          <div className="rounded-md border border-dashed border-mist-300 bg-cream/40 px-4 py-6 sm:px-5">
            <p className="text-sm font-medium text-navy-800">
              No saved references yet — start here
            </p>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-navy-700">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800">
                  1
                </span>
                <span>Copy a starter query from the cards above.</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800">
                  2
                </span>
                <span>Open Google Patents (recommended first stop).</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800">
                  3
                </span>
                <span>
                  Save 1–3 possible similar references with what looks similar or
                  different.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800">
                  4
                </span>
                <span>
                  Bring them to your next expert conversation — preparation only.
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <ul className="space-y-4">
            {workspace.savedReferences.map((ref) => (
              <li key={ref.id} className="dossier-card overflow-hidden">
                <div className="border-b border-dashed border-mist-200 bg-cream/50 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-navy-900">{ref.title}</p>
                      {ref.referenceType ? (
                        <span className="mt-1 inline-flex rounded-full bg-mist-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-600">
                          {ref.referenceType}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={comparingId === ref.id}
                        onClick={() => void onCompare(ref)}
                        className="btn-secondary px-2.5 py-1 text-xs"
                      >
                        {comparingId === ref.id ? "Organizing…" : "Compare helper"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(ref)}
                        className="btn-ghost px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(ref.id)}
                        className="btn-ghost px-2 py-1 text-xs text-navy-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 px-4 py-4 text-sm text-navy-700">
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 underline"
                    >
                      Open link →
                    </a>
                  ) : null}
                  {ref.searchQueryUsed ? (
                    <p>
                      <span className="text-xs font-mono uppercase tracking-wide text-navy-400">
                        Query
                      </span>
                      <span className="mt-0.5 block">{ref.searchQueryUsed}</span>
                    </p>
                  ) : null}
                  {ref.looksSimilar ? (
                    <p>
                      <span className="font-medium text-navy-900">Looks similar: </span>
                      {ref.looksSimilar}
                    </p>
                  ) : null}
                  {ref.seemsDifferent ? (
                    <p>
                      <span className="font-medium text-navy-900">Seems different: </span>
                      {ref.seemsDifferent}
                    </p>
                  ) : null}
                  {ref.expertQuestions ? (
                    <p className="whitespace-pre-wrap">
                      <span className="font-medium text-navy-900">Expert questions: </span>
                      {ref.expertQuestions}
                    </p>
                  ) : null}
                  {ref.comparison ? (
                    <div className="rounded-md border border-teal-100 bg-teal-50/40 p-3 text-xs">
                      <p className="font-semibold text-teal-800">Comparison helper</p>
                      {(ref.comparison.whatAppearsRelated?.length ?? 0) > 0 ? (
                        <p className="mt-2">
                          {(ref.comparison.whatAppearsRelated ?? []).join(" ")}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {editingId !== ref.id ? (
                    <ReferenceGapMapForm
                      key={`${ref.id}-${ref.updatedAt ?? ref.createdAt}`}
                      record={record}
                      reference={ref}
                      onSaved={() => void refreshSavedReferences()}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
