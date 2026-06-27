"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics/client";
import {
  FEEDBACK_LIKERT_OPTIONS,
  SUPPORT_NEED_OPTIONS,
  type FeedbackLikert,
  type PilotFeedbackInput,
  type SupportNeed,
} from "@/lib/feedback";
import { FEEDBACK_COPY } from "@/lib/copy";
import { pilotSessionHeaders } from "@/lib/pilotSession";
import { isApiStoreAvailable } from "@/lib/store/api";
import type { ProjectRecord } from "@/lib/types";

function toggleNeed(list: SupportNeed[], value: SupportNeed): SupportNeed[] {
  if (value === "not_sure") {
    return list.includes("not_sure") ? [] : ["not_sure"];
  }
  const without = list.filter((item) => item !== "not_sure");
  return without.includes(value)
    ? without.filter((item) => item !== value)
    : [...without, value];
}

export function PilotFeedbackCard({
  record,
  onSubmitted,
}: {
  record: ProjectRecord;
  onSubmitted: (input: PilotFeedbackInput) => void;
}) {
  const [clarityHelped, setClarityHelped] = useState<FeedbackLikert | "">("");
  const [wouldBringToExpert, setWouldBringToExpert] = useState<FeedbackLikert | "">("");
  const [supportNeeded, setSupportNeeded] = useState<SupportNeed[]>([]);
  const [confusionNote, setConfusionNote] = useState("");
  const [followUpRequested, setFollowUpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackEvent("feedback_viewed", {
      projectId: record.id,
      metadata: { demo: record.isDemo ?? false },
    });
  }, [record.id, record.isDemo]);

  useEffect(() => {
    if (!isApiStoreAvailable() || record.isDemo) return;
    let active = true;
    fetch(`/api/feedback?projectId=${encodeURIComponent(record.id)}`, {
      headers: pilotSessionHeaders(),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.feedback) return;
        const existing = data.feedback as PilotFeedbackInput;
        setClarityHelped(existing.clarityHelped);
        setWouldBringToExpert(existing.wouldBringToExpert);
        setSupportNeeded(existing.supportNeeded ?? []);
        setConfusionNote(existing.confusionNote ?? "");
        setFollowUpRequested(existing.followUpRequested ?? false);
        setSaved(true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [record.id, record.isDemo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clarityHelped || !wouldBringToExpert) {
      setError("Please answer the yes / no / not sure questions.");
      return;
    }

    const payload: PilotFeedbackInput = {
      clarityHelped,
      wouldBringToExpert,
      supportNeeded,
      confusionNote: confusionNote.trim() || undefined,
      followUpRequested,
    };

    if (record.isDemo || !isApiStoreAvailable()) {
      setSaved(true);
      setError(null);
      onSubmitted(payload);
      trackEvent("feedback_submitted", {
        projectId: record.id,
        metadata: { demo: true, clarityHelped },
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...pilotSessionHeaders(),
        },
        body: JSON.stringify({
          projectId: record.id,
          ...payload,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not save feedback");
      setSaved(true);
      onSubmitted(payload);
      trackEvent("feedback_submitted", {
        projectId: record.id,
        metadata: { clarityHelped, demo: false },
      });
      if (followUpRequested) {
        trackEvent("followup_requested", { projectId: record.id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save feedback");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card variant="soft">
      <CardHeader
        title={FEEDBACK_COPY.title}
        subtitle={FEEDBACK_COPY.subtitle}
      />
      {record.isDemo ? (
        <p className="mb-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {FEEDBACK_COPY.demoNote}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <LikertQuestion
          label={FEEDBACK_COPY.clarityQuestion}
          value={clarityHelped}
          onChange={setClarityHelped}
        />
        <LikertQuestion
          label={FEEDBACK_COPY.expertQuestion}
          value={wouldBringToExpert}
          onChange={setWouldBringToExpert}
        />

        <div>
          <p className="text-sm font-semibold text-navy-900">
            {FEEDBACK_COPY.supportQuestion}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUPPORT_NEED_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSupportNeeded((prev) => toggleNeed(prev, option.value));
                  trackEvent("resource_type_selected", {
                    projectId: record.id,
                    metadata: { resourceKey: option.value },
                  });
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  supportNeeded.includes(option.value)
                    ? "border-teal-500 bg-teal-50 text-teal-800"
                    : "border-mist-200 text-navy-600 hover:border-teal-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-navy-900">
            {FEEDBACK_COPY.confusionQuestion}
          </span>
          <textarea
            value={confusionNote}
            onChange={(e) => setConfusionNote(e.target.value.slice(0, 500))}
            rows={3}
            className="input-surface mt-3"
            placeholder="Optional — keep it brief"
          />
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-mist-200 bg-white px-4 py-4">
          <input
            type="checkbox"
            checked={followUpRequested}
            onChange={(e) => setFollowUpRequested(e.target.checked)}
            className="mt-1 h-4 w-4 accent-teal-600"
          />
          <span className="text-sm leading-relaxed text-navy-700">
            {FEEDBACK_COPY.followUpQuestion}
          </span>
        </label>

        {error ? (
          <p className="text-sm text-amber-800" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="text-sm font-medium text-teal-700">{FEEDBACK_COPY.thanks}</p>
        ) : null}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : FEEDBACK_COPY.submit}
        </button>
      </form>
    </Card>
  );
}

function LikertQuestion({
  label,
  value,
  onChange,
}: {
  label: string;
  value: FeedbackLikert | "";
  onChange: (value: FeedbackLikert) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-navy-900">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {FEEDBACK_LIKERT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              value === option.value
                ? "border-teal-500 bg-teal-50 text-teal-800"
                : "border-mist-200 text-navy-600 hover:border-teal-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
