"use client";

import { useMemo, useState } from "react";
import { RESEARCH_PREP_COPY } from "@/lib/copy";
import { SaveFeedback } from "@/components/ui/SaveFeedback";
import {
  buildGapMapOutput,
  EMPTY_GAP_MAP_FIELDS,
  GAP_MAP_FIELD_LABELS,
} from "@/lib/research/gapMap";
import { updateReference } from "@/lib/research/client";
import type { GapMapFields, SavedReference } from "@/lib/research/types";
import { trackEvent } from "@/lib/analytics/client";
import type { ProjectRecord } from "@/lib/types";

function countFilledFields(fields: GapMapFields): number {
  return GAP_MAP_FIELD_LABELS.filter(({ key }) => fields[key]?.trim()).length;
}

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
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(!reference.gapMap?.output);

  const filledCount = useMemo(() => countFilledFields(fields), [fields]);
  const totalFields = GAP_MAP_FIELD_LABELS.length;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(null);
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
      setSaveSuccess("Gap map saved — included in your PDF export.");
      window.setTimeout(() => setSaveSuccess(null), 4000);
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
      className="mt-4 overflow-hidden rounded-md border border-teal-200/70 bg-gradient-to-br from-teal-50/40 to-white"
    >
      <div className="flex items-start justify-between gap-3 border-b border-dashed border-teal-100 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-teal-900">Gap map</p>
          <p className="mt-0.5 text-xs leading-relaxed text-navy-600">
            {RESEARCH_PREP_COPY.gapMapHelperBody}
          </p>
          <p className="mt-2 text-[10px] font-mono uppercase tracking-wide text-teal-700">
            {filledCount} of {totalFields} fields · preparation only
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="shrink-0 rounded-md border border-teal-200 bg-white px-2.5 py-1 text-xs font-medium text-teal-800 hover:bg-teal-50"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {expanded ? (
        <div className="space-y-3 px-4 py-4">
          {GAP_MAP_FIELD_LABELS.map(({ key, label, hint }) => {
            const filled = Boolean(fields[key]?.trim());
            return (
              <label key={key} className="block text-sm">
                <span className="flex items-center gap-2 font-medium text-navy-800">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] ${
                      filled
                        ? "bg-teal-600 text-white"
                        : "border border-mist-300 bg-white text-transparent"
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  {label}
                </span>
                <span className="mt-0.5 block pl-6 text-xs text-navy-500">{hint}</span>
                <textarea
                  value={fields[key] ?? ""}
                  onChange={(e) =>
                    setFields((current) => ({ ...current, [key]: e.target.value }))
                  }
                  rows={2}
                  className="input-surface mt-2 ml-0 sm:ml-6"
                />
              </label>
            );
          })}
          <div className="flex flex-wrap gap-2 pl-0 sm:pl-6">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save gap map"}
            </button>
          </div>
          <SaveFeedback message={saveSuccess} />
        </div>
      ) : null}

      {preview ? (
        <div className="space-y-3 border-t border-dashed border-mist-200 bg-white/80 px-4 py-4 text-xs text-navy-700">
          <p className="font-semibold text-navy-900">Saved gap map summary</p>
          {(preview.possibleSimilarity?.length ?? 0) > 0 ? (
            <div className="rounded-md border border-mist-200 bg-cream/40 px-3 py-2">
              <p className="font-semibold text-teal-800">Possible similarity</p>
              <ul className="mt-1 list-disc pl-4">
                {(preview.possibleSimilarity ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {(preview.possibleDifference?.length ?? 0) > 0 ? (
            <div className="rounded-md border border-mist-200 bg-cream/40 px-3 py-2">
              <p className="font-semibold text-teal-800">Possible difference to clarify</p>
              <ul className="mt-1 list-disc pl-4">
                {(preview.possibleDifference ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {(preview.expertQuestions?.length ?? 0) > 0 ? (
            <div className="rounded-md border border-teal-100 bg-teal-50/40 px-3 py-2">
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
      {error ? <p className="px-4 pb-4 text-sm text-amber-800">{error}</p> : null}
    </form>
  );
}
