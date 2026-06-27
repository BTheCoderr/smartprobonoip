"use client";

import { useState } from "react";
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

  return (
    <form onSubmit={onSave} className="mt-4 space-y-3 rounded-lg border border-teal-100 bg-teal-50/30 p-4">
      <p className="text-sm font-semibold text-teal-900">Gap map for this reference</p>
      <p className="text-xs leading-relaxed text-navy-600">
        Compare what may look similar and what may differ — preparation only, not a legal
        conclusion.
      </p>
      {GAP_MAP_FIELD_LABELS.map(({ key, label }) => (
        <label key={key} className="block text-sm">
          <span className="font-medium text-navy-800">{label}</span>
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
      {reference.gapMap?.output ? (
        <div className="space-y-2 text-xs text-navy-700">
          {reference.gapMap.output.possibleSimilarity.length > 0 ? (
            <p>
              <span className="font-semibold">Possible similarity: </span>
              {reference.gapMap.output.possibleSimilarity.join(" ")}
            </p>
          ) : null}
          {reference.gapMap.output.possibleDifference.length > 0 ? (
            <p>
              <span className="font-semibold">Possible difference to clarify: </span>
              {reference.gapMap.output.possibleDifference.join(" ")}
            </p>
          ) : null}
          {reference.gapMap.output.documentNext.length > 0 ? (
            <p>
              <span className="font-semibold">What to document next: </span>
              {reference.gapMap.output.documentNext.join(" ")}
            </p>
          ) : null}
          {reference.gapMap.output.expertQuestions.length > 0 ? (
            <div>
              <p className="font-semibold">Questions to ask an expert:</p>
              <ul className="mt-1 list-disc pl-4">
                {reference.gapMap.output.expertQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="text-sm text-amber-800">{error}</p> : null}
    </form>
  );
}
