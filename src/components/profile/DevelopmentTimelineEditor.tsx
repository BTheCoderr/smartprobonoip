"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { countFilledTimelineFields, DEVELOPMENT_TIMELINE_FIELDS, getTimelineFieldValue, sanitizeTimelineValue, TIMELINE_NOTE } from "@/lib/packet";
import { getStore } from "@/lib/store";
import { trackEvent } from "@/lib/analytics/client";
import type { DevelopmentTimeline, DevelopmentTimelineField, ProjectRecord } from "@/lib/types";

const PLACEHOLDER = 'e.g. March 2026, Summer 2025, Not yet, I don\u2019t remember';

function initialValues(record: ProjectRecord): DevelopmentTimeline {
  const out: DevelopmentTimeline = {};
  for (const field of DEVELOPMENT_TIMELINE_FIELDS) {
    const value = getTimelineFieldValue(record.developmentTimeline, field);
    if (value) out[field] = value;
  }
  return out;
}

export function DevelopmentTimelineEditor({
  record,
  onSaved,
}: {
  record: ProjectRecord;
  onSaved?: (record: ProjectRecord) => void;
}) {
  const [values, setValues] = useState<DevelopmentTimeline>(() => initialValues(record));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: DevelopmentTimelineField, value: string) {
    setSaved(false);
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const sanitized: DevelopmentTimeline = {};
      for (const field of DEVELOPMENT_TIMELINE_FIELDS) {
        const value = values[field];
        if (typeof value === "string" && value.trim()) {
          sanitized[field] = sanitizeTimelineValue(value);
        }
      }
      const updated = await getStore().updateDevelopmentTimeline(record.id, sanitized);
      setValues(initialValues(updated));
      setSaved(true);
      trackEvent("timeline_saved", {
        projectId: record.id,
        metadata: {
          demo: record.isDemo ?? false,
          filledTimelineFields: countFilledTimelineFields(updated.developmentTimeline),
        },
      });
      onSaved?.(updated);
    } catch {
      setError("Could not save timeline. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Development timeline" subtitle={TIMELINE_NOTE} />
      <p className="mb-4 text-xs leading-relaxed text-navy-500">
        Approximate dates are fine. This helps organize your development history for
        a professional conversation — not a legal conclusion.
      </p>
      <form onSubmit={onSave} className="space-y-3">
        {DEVELOPMENT_TIMELINE_FIELDS.map((field) => (
          <label key={field} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-navy-800">{field}</span>
            <input
              type="text"
              value={values[field] ?? ""}
              onChange={(e) => updateField(field, e.target.value)}
              placeholder={PLACEHOLDER}
              className="w-full rounded-lg border border-mist-300 bg-white px-3 py-2 text-sm text-navy-800"
            />
          </label>
        ))}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save timeline"}
          </button>
          {saved ? (
            <p className="text-sm font-medium text-teal-700">Timeline saved.</p>
          ) : null}
        </div>
        {error ? (
          <p className="text-sm text-amber-800">{error}</p>
        ) : null}
      </form>
    </Card>
  );
}
