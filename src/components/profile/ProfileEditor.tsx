"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { RESOURCE_LABELS, SIGNAL_LABELS } from "@/lib/labels";
import { normalizeProfileSignals, SIGNAL_KEYS } from "@/lib/signals";
import type {
  ReadinessProfile,
  ResourceCategory,
} from "@/lib/types";

const RESOURCE_KEYS = Object.keys(RESOURCE_LABELS) as ResourceCategory[];

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

const fieldClass =
  "mt-2 w-full rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

export function ProfileEditor({
  profile,
  onSave,
  onCancel,
  saving,
}: {
  profile: ReadinessProfile;
  onSave: (next: ReadinessProfile) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<ReadinessProfile>(() => ({
    ...profile,
    signals: normalizeProfileSignals(profile.signals),
  }));
  const [complete, setComplete] = useState(profile.completeInfo.join("\n"));
  const [missing, setMissing] = useState(profile.missingInfo.join("\n"));
  const [questions, setQuestions] = useState(
    profile.expertQuestions.join("\n"),
  );

  function handleSave() {
    onSave({
      ...draft,
      completeInfo: linesToList(complete),
      missingInfo: linesToList(missing),
      expertQuestions: linesToList(questions),
      disclaimer: profile.disclaimer,
    });
  }

  return (
    <Card>
      <CardHeader
        title="Edit your profile"
        subtitle="Refine the wording and selections. The disclaimer always stays attached. Do not add legal conclusions."
      />
      <div className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-navy-800">
            Plain-language summary
          </span>
          <textarea
            value={draft.ideaSummary}
            onChange={(e) => setDraft({ ...draft, ideaSummary: e.target.value })}
            rows={3}
            className={fieldClass}
          />
        </label>

        <div>
          <span className="text-sm font-medium text-navy-800">
            IP category signals
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIGNAL_KEYS.map((s) => {
              const active = draft.signals.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setDraft({ ...draft, signals: toggle(draft.signals, s) })
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-mist-200 bg-white text-navy-500"
                  }`}
                >
                  {SIGNAL_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-navy-800">
            What information is complete (one per line)
          </span>
          <textarea
            value={complete}
            onChange={(e) => setComplete(e.target.value)}
            rows={4}
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-navy-800">
            What information is missing (one per line)
          </span>
          <textarea
            value={missing}
            onChange={(e) => setMissing(e.target.value)}
            rows={4}
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-navy-800">
            Suggested next step
          </span>
          <textarea
            value={draft.suggestedNextStep}
            onChange={(e) =>
              setDraft({ ...draft, suggestedNextStep: e.target.value })
            }
            rows={3}
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-navy-800">
            Questions to bring to an expert (one per line)
          </span>
          <textarea
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            rows={4}
            className={fieldClass}
          />
        </label>

        <div>
          <span className="text-sm font-medium text-navy-800">
            Recommended resources
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {RESOURCE_KEYS.map((r) => {
              const active = draft.recommendedResources.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      recommendedResources: toggle(
                        draft.recommendedResources,
                        r,
                      ),
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-mist-200 bg-white text-navy-500"
                  }`}
                >
                  {RESOURCE_LABELS[r]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-mist-300"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-navy-600 transition hover:bg-mist-100"
        >
          Cancel
        </button>
      </div>
    </Card>
  );
}
