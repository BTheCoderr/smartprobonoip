"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  COACH_ACTIONS,
  COACH_INTRO,
  type CoachMode,
  type CoachResponse,
} from "@/lib/coach";
import type { ProjectRecord } from "@/lib/types";

interface CoachEntry {
  id: string;
  prompt: string;
  response: CoachResponse;
}

export function PacketCoach({ record }: { record: ProjectRecord }) {
  const [entries, setEntries] = useState<CoachEntry[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(mode: CoachMode | "custom", prompt: string, q?: string) {
    setLoading(prompt);
    setError(null);
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
      setEntries((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          prompt,
          response: data.response,
        },
        ...prev,
      ]);
    } catch {
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
    <Card className="border-teal-200 bg-teal-50/30">
      <CardHeader
        title="AI Packet Coach"
        subtitle={COACH_INTRO}
        icon={<span aria-hidden>✨</span>}
      />

      <div className="flex flex-wrap gap-2">
        {COACH_ACTIONS.map((action) => (
          <button
            key={action.mode}
            type="button"
            disabled={loading !== null}
            onClick={() => ask(action.mode, action.label)}
            className="rounded-full border border-teal-300 bg-white px-3.5 py-1.5 text-sm font-medium text-teal-800 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === action.label ? "Thinking…" : action.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Or type your own prep question…"
          maxLength={500}
          className="flex-1 rounded-lg border border-mist-300 bg-white px-3 py-2 text-sm text-navy-800 placeholder:text-navy-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
        <button
          type="submit"
          disabled={loading !== null || question.trim().length === 0}
          className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask coach
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-amber-700" role="alert">
          {error}
        </p>
      ) : null}

      {entries.length > 0 ? (
        <div className="mt-5 space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-mist-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
                  {entry.prompt}
                </p>
                <span className="shrink-0 rounded-full bg-mist-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-navy-500">
                  {entry.response.generator === "ai"
                    ? "AI-assisted"
                    : "Prep guide"}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-semibold text-navy-900">
                {entry.response.title}
              </h4>
              <p className="mt-1 text-sm text-navy-600">
                {entry.response.intro}
              </p>
              <ul className="mt-2 space-y-1.5">
                {entry.response.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm text-navy-700">
                    <span aria-hidden className="text-teal-500">
                      •
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-mist-100 pt-2 text-xs text-navy-400">
                {entry.response.note}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
