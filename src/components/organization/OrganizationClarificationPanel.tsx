"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  CANONICAL_INTAKE_FIELDS,
  canonicalFieldLabel,
} from "@/lib/handoff/canonicalFields";
import { ROUTES } from "@/lib/routes";

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
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

async function readError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error ?? "Request failed";
}

export function OrganizationClarificationPanel({
  referralId,
}: {
  referralId: string;
}) {
  const [items, setItems] = useState<Clarification[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [canonicalKey, setCanonicalKey] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch(
      `/api/organization/referrals/${referralId}/clarifications`,
    );
    if (res.status === 401 || res.status === 403) {
      window.location.href = ROUTES.organizationLogin;
      return;
    }
    if (!res.ok) throw new Error(await readError(res));
    const data = (await res.json()) as { clarifications: Clarification[] };
    setItems(data.clarifications ?? []);
  }

  useEffect(() => {
    let active = true;
    fetch(`/api/organization/referrals/${referralId}/clarifications`)
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = ROUTES.organizationLogin;
          return null;
        }
        if (!res.ok) throw new Error(await readError(res));
        return res.json();
      })
      .then((data: { clarifications?: Clarification[] } | null) => {
        if (active && data) setItems(data.clarifications ?? []);
      })
      .catch(() => {
        if (active) setMessage("Could not load clarification requests.");
      });
    return () => {
      active = false;
    };
  }, [referralId]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!questionText.trim()) return;
    setWorking(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/organization/referrals/${referralId}/clarifications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionText,
            contextNote: contextNote || null,
            canonicalKey: canonicalKey || null,
          }),
        },
      );
      if (!res.ok) throw new Error(await readError(res));
      setQuestionText("");
      setContextNote("");
      setCanonicalKey("");
      await refresh();
      setMessage("Clarification request sent to the inventor's SmartProBonoIP record.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Could not send clarification request.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function close(id: string) {
    setWorking(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/organization/referrals/${referralId}/clarifications`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "close", clarificationId: id }),
        },
      );
      if (!res.ok) throw new Error(await readError(res));
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not close request.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <Card className="border-teal-200">
      <CardHeader
        title="Request clarification"
        subtitle="Ask for a missing or unclear fact without editing the inventor's record. Their answer is preserved separately from professional notes and legal judgment."
      />

      <form onSubmit={send} className="space-y-3 rounded-xl border border-mist-200 bg-mist-50/50 p-4">
        <label className="block text-sm font-medium text-navy-800">
          What do you need clarified?
          <textarea
            rows={3}
            className="input-surface mt-1"
            maxLength={500}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Example: Who specifically contributed the sensor-calibration approach, and what did each person contribute?"
          />
        </label>

        <label className="block text-sm font-medium text-navy-800">
          Related factual area (optional)
          <select
            className="input-surface mt-1"
            value={canonicalKey}
            onChange={(e) => setCanonicalKey(e.target.value)}
          >
            <option value="">General clarification</option>
            {CANONICAL_INTAKE_FIELDS.map((field) => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-navy-800">
          Context for the inventor (optional)
          <textarea
            rows={2}
            className="input-surface mt-1"
            maxLength={2000}
            value={contextNote}
            onChange={(e) => setContextNote(e.target.value)}
            placeholder="Explain what detail would make the record easier to review."
          />
        </label>

        <button
          type="submit"
          className="btn-primary"
          disabled={working || !questionText.trim()}
        >
          {working ? "Sending…" : "Send clarification request"}
        </button>
      </form>

      {items.length > 0 ? (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-mist-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900">
                    {item.questionText}
                  </p>
                  <p className="mt-1 text-xs text-navy-500">
                    {new Date(item.createdAt).toLocaleString()}
                    {item.canonicalKey
                      ? " · " + canonicalFieldLabel(item.canonicalKey)
                      : ""}
                  </p>
                  {item.contextNote ? (
                    <p className="mt-2 text-sm text-navy-600">{item.contextNote}</p>
                  ) : null}
                  {item.answerText ? (
                    <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/60 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                        Inventor response
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-navy-800">
                        {item.answerText}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-mist-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-navy-500">
                    {item.status}
                  </span>
                  {item.status !== "closed" ? (
                    <button
                      type="button"
                      className="btn-ghost text-xs"
                      disabled={working}
                      onClick={() => void close(item.id)}
                    >
                      Close
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-navy-500">
          No clarification requests have been sent on this referral.
        </p>
      )}

      {message ? (
        <p className="mt-3 text-sm text-navy-600">{message}</p>
      ) : null}
    </Card>
  );
}
