"use client";

import { useState } from "react";
import { RESEARCH_PREP_COPY } from "@/lib/copy";
import {
  buildGapMapOutput,
  EMPTY_GAP_MAP_FIELDS,
  GAP_MAP_FIELD_LABELS,
} from "@/lib/research/gapMap";
import { updateReference } from "@/lib/research/client";
import type { GapMapFields, SavedReference } from "@/lib/research/types";
import { trackEvent } from "@/lib/analytics/client";
import type { ProjectRecord } from "@/lib/types";

export function ReferenceGapMapForm({
  record,
  reference,
  onSaved,
}: {
  record: ProjectRecord;
  reference: SavedReference;
  onSaved: () => void;
}) {
  const [fields, setFields] = useState<GapMapFields>(
    reference.gapMap?.fields ?? EMPTY_GAP_MAP_FIELDS,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const output = buildGapMapOutput(fields);
      await updateReference(
        record.id,
        {
          id: reference.id,
          gapMap: { fields, output },
        },
        record.isDemo,
      );
      trackEvent("gap_map_saved", {
        projectId: record.id,
        metadata: { demo: record.isDemo ?? false, referenceType: reference.referenceType },
      });
      onSaved();
    } catch {
      setError("Could not save gap map.");
    } finally {
      setSaving(false);
    }
  }

  const preview = reference.gapMap?.output ?? null;

  return (
    <form
      onSubmit={onSave}
      className="mt-4 space-y-3 rounded-lg border border-teal-100 bg-teal-50/30 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-900">
            Gap map for this reference
          </p>
          <p className="mt-1 text-xs leading-relaxed text-navy-600">
            {RESEARCH_PREP_COPY.gapMapHelperBody}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="shrink-0 text-xs font-medium text-teal-700 hover:text-teal-900"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {expanded ? (
        <>
          <p className="rounded-lg border border-aqua-200/80 bg-aqua-50/80 px-3 py-2 text-[11px] leading-relaxed text-navy-900">
            {RESEARCH_PREP_COPY.helperNote}
          </p>
          {GAP_MAP_FIELD_LABELS.map(({ key, label, hint }) => (
            <label key={key} className="block text-sm">
              <span className="font-medium text-navy-800">{label}</span>
              <span className="mt-0.5 block text-xs text-navy-500">{hint}</span>
              <textarea
                value={fields[key] ?? ""}
                onChange={(e) =>
                  setFields((current) => ({ ...current, [key]: e.target.value }))
                }
                rows={2}
                className="mt-1 w-full rounded-lg border border-mist-300 bg-white px-3 py-2 text-sm"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save gap map"}
          </button>
        </>
      ) : null}

      {preview ? (
        <div className="space-y-3 rounded-lg border border-mist-200 bg-white p-3 text-xs text-navy-700">
          <p className="font-semibold text-navy-900">Saved gap map summary</p>
          {(preview.possibleSimilarity?.length ?? 0) > 0 ? (
            <div>
              <p className="font-semibold text-teal-800">Possible similarity</p>
              <ul className="mt-1 list-disc pl-4">
                {(preview.possibleSimilarity ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {(preview.possibleDifference?.length ?? 0) > 0 ? (
            <div>
              <p className="font-semibold text-teal-800">Possible difference to clarify</p>
              <ul className="mt-1 list-disc pl-4">
                {(preview.possibleDifference ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {(preview.documentNext?.length ?? 0) > 0 ? (
            <div>
              <p className="font-semibold text-teal-800">What to document next</p>
              <ul className="mt-1 list-disc pl-4">
                {(preview.documentNext ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {(preview.expertQuestions?.length ?? 0) > 0 ? (
            <div>
              <p className="font-semibold text-teal-800">Questions to ask an expert</p>
              <ul className="mt-1 list-disc pl-4">
                {(preview.expertQuestions ?? []).map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {preview.disclaimer ? (
            <p className="text-[11px] text-navy-500">{preview.disclaimer}</p>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="text-sm text-navy-800">{error}</p> : null}
    </form>
  );
}
