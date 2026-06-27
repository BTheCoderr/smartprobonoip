"use client";

import { useState } from "react";
import { PacketSection } from "@/components/ui/design";
import { trackEvent } from "@/lib/analytics/client";
import {
  COACH_ACTIONS,
  COACH_INTRO,
  COACH_SAFETY_NOTE,
  type CoachMode,
  type CoachResponse,
} from "@/lib/coach";
import type { ProjectRecord } from "@/lib/types";

interface CoachEntry {
  id: string;
  prompt: string;
  response: CoachResponse;
}

const PRIMARY_ACTIONS = COACH_ACTIONS.slice(0, 8);

export function PacketCoach({ record }: { record: ProjectRecord }) {
  const [entries, setEntries] = useState<CoachEntry[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);

  function markOpened() {
    if (!opened) {
      setOpened(true);
      trackEvent("coach_opened", {
        projectId: record.id,
        metadata: { demo: record.isDemo ?? false },
      });
    }
  }

  async function ask(mode: CoachMode | "custom", prompt: string, q?: string) {
    markOpened();
    setLoading(prompt);
    setError(null);
    if (mode === "custom") {
      trackEvent("coach_message_sent", {
        projectId: record.id,
        metadata: { mode: "custom" },
      });
    } else {
      trackEvent("coach_quick_action_clicked", {
        projectId: record.id,
        metadata: { quickAction: mode, action: prompt },
      });
    }
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record, mode, question: q }),
      });
      if (!res.ok) {
        throw new Error("Request failed");
      }
      const data = (await res.json()) as { response: CoachResponse };
      trackEvent("coach_response_generated", {
        projectId: record.id,
        metadata: { mode: mode === "custom" ? "custom" : mode },
      });
      setEntries((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          prompt,
          response: data.response,
        },
        ...prev,
      ]);
    } catch {
      trackEvent("coach_error", {
        projectId: record.id,
        metadata: { errorCode: "coach_request_failed" },
      });
      setError(
        "Sorry — the coach could not respond right now. Please try again.",
      );
    } finally {
      setLoading(null);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length === 0 || loading) return;
    void ask("custom", q, q);
    setQuestion("");
  }

  return (
    <PacketSection
      kicker="Preparation coach"
      title="AI Packet Coach"
      subtitle={COACH_INTRO}
      accent="teal"
    >
      <p className="text-xs leading-relaxed text-navy-500">{COACH_SAFETY_NOTE}</p>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {PRIMARY_ACTIONS.map((action) => (
          <button
            key={action.mode}
            type="button"
            disabled={loading !== null}
            onClick={() => ask(action.mode, action.label)}
            className="rounded-2xl border border-teal-200/80 bg-white px-4 py-3.5 text-left text-sm font-medium leading-snug text-navy-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === action.label ? "Thinking…" : action.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Or type your own prep question…"
          maxLength={500}
          className="input-surface flex-1"
        />
        <button
          type="submit"
          disabled={loading !== null || question.trim().length === 0}
          className="btn-primary shrink-0 disabled:cursor-not-allowed disabled:bg-mist-300 disabled:shadow-none"
        >
          Ask coach
        </button>
      </form>

      {error ? (
        <p
          className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {entries.length > 0 ? (
        <div className="mt-6 space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-mist-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  {entry.prompt}
                </p>
                <span className="rounded-full bg-mist-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-500">
                  {entry.response.generator === "ai"
                    ? "AI-assisted"
                    : "Prep guide"}
                </span>
              </div>
              <h4 className="mt-3 text-base font-semibold text-navy-900">
                {entry.response.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                {entry.response.intro}
              </p>
              <ul className="mt-3 space-y-2">
                {entry.response.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed text-navy-700"
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800"
                    >
                      {i + 1}
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-mist-100 pt-3 text-xs leading-relaxed text-navy-400">
                {entry.response.note}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </PacketSection>
  );
}
