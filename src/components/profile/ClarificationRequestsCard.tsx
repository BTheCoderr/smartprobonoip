"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { canonicalFieldLabel } from "@/lib/handoff/canonicalFields";
import { pilotSessionHeaders } from "@/lib/pilotSession";

type Status = "open" | "answered" | "closed";

interface Clarification {
  id: string;
  organizationId: string;
  organizationName: string | null;
  referralId: string;
  projectId: string;
  canonicalKey: string | null;
  questionText: string;
  contextNote: string | null;
  status: Status;
  answerText: string | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

async function readError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error ?? "Request failed";
}

export function ClarificationRequestsCard({
  projectId,
}: {
  projectId: string;
}) {
  const [items, setItems] = useState<Clarification[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch(`/api/records/${projectId}/clarifications`, {
      headers: pilotSessionHeaders(),
    });
    if (!res.ok) throw new Error(await readError(res));
    const data = (await res.json()) as { clarifications: Clarification[] };
    setItems(data.clarifications ?? []);
  }

  useEffect(() => {
    let active = true;
    fetch(`/api/records/${projectId}/clarifications`, {
      headers: pilotSessionHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res));
        return res.json();
      })
      .then((data: { clarifications?: Clarification[] }) => {
        if (active) setItems(data.clarifications ?? []);
      })
      .catch(() => {
        if (active) setError("Could not load professional clarification requests.");
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  async function answer(item: Clarification) {
    const answerText = drafts[item.id]?.trim();
    if (!answerText) {
      setError("Enter your factual answer before saving.");
      return;
    }
    setWorkingId(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/records/${projectId}/clarifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...pilotSessionHeaders(),
        },
        body: JSON.stringify({
          action: "answer",
          clarificationId: item.id,
          answerText,
        }),
      });
      if (!res.ok) throw new Error(await readError(res));
      setDrafts((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save answer.");
    } finally {
      setWorkingId(null);
    }
  }

  if (items.length === 0 && !error) return null;

  return (
    <Card className="border-aqua-200">
      <CardHeader
        title="Questions from a professional"
        subtitle="A professional reviewing a referral can ask you to clarify facts. Their question does not change your invention record, and your response does not become a legal conclusion."
      />

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-mist-200 bg-white p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
              {item.organizationName ?? "Professional organization"}
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-navy-900">
              {item.questionText}
            </p>
            {item.canonicalKey ? (
              <p className="mt-1 text-xs text-navy-500">
                Related area: {canonicalFieldLabel(item.canonicalKey)}
              </p>
            ) : null}
            {item.contextNote ? (
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                {item.contextNote}
              </p>
            ) : null}

            {item.status === "open" ? (
              <div className="mt-3 space-y-2">
                <textarea
                  rows={4}
                  className="input-surface"
                  placeholder="Answer with the facts you know. If you are unsure, say that rather than guessing."
                  value={drafts[item.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((current) => ({
                      ...current,
                      [item.id]: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  className="btn-primary text-sm"
                  disabled={workingId === item.id}
                  onClick={() => void answer(item)}
                >
                  {workingId === item.id ? "Saving…" : "Send factual response"}
                </button>
              </div>
            ) : item.answerText ? (
              <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                  Your response
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-navy-800">
                  {item.answerText}
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-navy-500">
        If your response reveals that the underlying invention record is outdated,
        update that record separately. SmartProBonoIP does not silently overwrite
        inventor facts from a professional question.
      </p>

      {error ? <p className="mt-3 text-sm text-amber-800">{error}</p> : null}
    </Card>
  );
}
