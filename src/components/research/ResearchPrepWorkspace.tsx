"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics/client";
import { PACKET_COPY } from "@/lib/copy";
import {
  buildGooglePatentsUrl,
  buildUsptoSearchUrl,
  buildWebSearchUrl,
} from "@/lib/research/buildLinks";
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
  const viewedTracked = useRef<string | null>(null);

  const syncReferences = useCallback(
    (refs: SavedReference[]) => {
      setWorkspace((current) => ({ ...current, savedReferences: refs }));
      onReferencesChange?.(refs);
    },
    [onReferencesChange],
  );

  const fetchSavedReferences = useCallback(async () => {
    try {
      const data = await loadWorkspace(record);
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

  function trackExternalSearch(label: string, queryIndex: number) {
    trackEvent("external_search_opened", {
      projectId: record.id,
      metadata: { label, demo: record.isDemo ?? false, queryIndex },
    });
  }

  async function onSaveReference(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
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
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
        {PACKET_COPY.researchPrepDisclaimer}
      </p>

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

      <Card>
        <CardHeader
          title="Suggested query cards"
          subtitle="Search terms to try — possible similar references only."
        />
        <ul className="space-y-4">
          {workspace.suggestedQueries.map((item, queryIndex) => (
            <li
              key={item.query}
              className="rounded-xl border border-mist-200 bg-mist-50/60 p-4"
            >
              <p className="text-sm font-medium text-navy-900">{item.query}</p>
              <p className="mt-1 text-xs leading-relaxed text-navy-600">
                {item.whyItMayHelp}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={buildGooglePatentsUrl(item.query)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackExternalSearch("Google Patents", queryIndex)}
                  className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                >
                  Open in Google Patents
                </a>
                <a
                  href={buildUsptoSearchUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackExternalSearch("USPTO Patent Public Search", queryIndex)
                  }
                  className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                >
                  Open in USPTO Patent Public Search
                </a>
                <a
                  href={buildWebSearchUrl(item.query)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackExternalSearch("Web search", queryIndex)}
                  className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                >
                  Open web search
                </a>
                <button
                  type="button"
                  onClick={() => void copyQuery(item.query, queryIndex)}
                  className="rounded-lg border border-mist-300 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-white"
                >
                  Copy query
                </button>
                <button
                  type="button"
                  onClick={() => prefillFromQuery(item.query)}
                  className="rounded-lg border border-mist-300 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-white"
                >
                  Save as research note
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title={editingId ? "Edit saved reference" : "Save a possible similar reference"}
          subtitle="Optional fields — add what you know."
        />
        <form onSubmit={onSaveReference} className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-navy-800">Reference title</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-navy-800">Reference link</span>
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-navy-800">Reference type</span>
            <select
              value={form.referenceType}
              onChange={(e) =>
                setForm((f) => ({ ...f, referenceType: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
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
              className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
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
              className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
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
              className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
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
              className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-navy-800">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
            />
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
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
          <p className="text-sm text-navy-500">
            No saved references yet. Try a query card or save one manually.
          </p>
        ) : (
          <ul className="space-y-4">
            {workspace.savedReferences.map((ref) => (
              <li
                key={ref.id}
                className="rounded-lg border border-mist-200 p-4 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy-900">{ref.title}</p>
                    {ref.referenceType ? (
                      <p className="text-xs text-navy-500">Type: {ref.referenceType}</p>
                    ) : null}
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 underline"
                      >
                        Open link
                      </a>
                    ) : null}
                    <p className="mt-1 text-xs text-navy-400">
                      Saved {new Date(ref.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={comparingId === ref.id}
                      onClick={() => void onCompare(ref)}
                      className="rounded border border-teal-300 px-2 py-1 text-xs font-medium text-teal-800"
                    >
                      {comparingId === ref.id
                        ? "Organizing…"
                        : "Help me compare this reference"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(ref)}
                      className="rounded border border-mist-300 px-2 py-1 text-xs text-navy-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(ref.id)}
                      className="rounded border border-mist-300 px-2 py-1 text-xs text-navy-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {ref.searchQueryUsed ? (
                  <p className="mt-2">
                    <span className="font-medium">Search query: </span>
                    {ref.searchQueryUsed}
                  </p>
                ) : null}
                {ref.looksSimilar ? (
                  <p className="mt-1">
                    <span className="font-medium">Looks similar: </span>
                    {ref.looksSimilar}
                  </p>
                ) : null}
                {ref.seemsDifferent ? (
                  <p className="mt-1">
                    <span className="font-medium">Seems different: </span>
                    {ref.seemsDifferent}
                  </p>
                ) : null}
                {ref.expertQuestions ? (
                  <p className="mt-1 whitespace-pre-wrap">
                    <span className="font-medium">Questions for an expert: </span>
                    {ref.expertQuestions}
                  </p>
                ) : null}
                {ref.comparison ? (
                  <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/40 p-3 text-xs text-navy-700">
                    <p className="font-semibold text-teal-800">Comparison helper</p>
                    {ref.comparison.whatAppearsRelated.length > 0 ? (
                      <p className="mt-2">
                        <span className="font-medium">What appears related: </span>
                        {ref.comparison.whatAppearsRelated.join(" ")}
                      </p>
                    ) : null}
                    {ref.comparison.clarifyFurther.length > 0 ? (
                      <p className="mt-1">
                        <span className="font-medium">What you may want to clarify: </span>
                        {ref.comparison.clarifyFurther.join(" ")}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
