"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { InventionStatusBadge } from "@/components/portfolio/InventionStatusBadge";
import { ReadinessMeter } from "@/components/portfolio/ReadinessMeter";
import { isInventionStatus, selectableInventionStatuses, inventionStatusLabel } from "@/lib/ideas/status";
import type { InventionStatus, InventionSummary } from "@/lib/ideas/types";
import { ROUTES } from "@/lib/routes";
import { formatEventRelative } from "@/lib/timeline/format";

export function InventionCard({
  invention,
  onStatusChange,
}: {
  invention: InventionSummary;
  onStatusChange?: (id: string, status: InventionStatus) => Promise<void>;
}) {
  const statusFieldId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(value: string) {
    if (!onStatusChange || !isInventionStatus(value)) return;
    setPending(true);
    setError(null);
    try {
      await onStatusChange(invention.id, value);
    } catch {
      setError("Could not update status. Try again.");
    } finally {
      setPending(false);
    }
  }

  const facts = [
    invention.savedReferenceCount > 0
      ? `${invention.savedReferenceCount} reference${invention.savedReferenceCount === 1 ? "" : "s"}`
      : null,
    invention.documentCount > 0
      ? `${invention.documentCount} document${invention.documentCount === 1 ? "" : "s"}`
      : null,
    invention.publicDisclosure ? "Public sharing noted" : null,
  ].filter((fact): fact is string => fact !== null);

  return (
    <article className="rounded-2xl border border-mist-200/80 bg-white p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-navy-900">
            <Link
              href={ROUTES.profile(invention.id)}
              className="rounded outline-offset-2 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-600"
            >
              {invention.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-navy-400">
            Updated {formatEventRelative(invention.lastActivityAt)}
          </p>
        </div>
        <InventionStatusBadge status={invention.status} />
      </div>

      <div className="mt-4">
        <p className="mb-1 text-[10px] font-mono uppercase tracking-wide text-navy-400">
          Packet preparation
        </p>
        <ReadinessMeter score={invention.readinessScore} />
      </div>

      {facts.length > 0 ? (
        <p className="mt-3 text-xs text-navy-500">{facts.join(" · ")}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-mist-200/70 pt-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor={statusFieldId}
            className="text-xs font-medium text-navy-500"
          >
            Status
          </label>
          <select
            id={statusFieldId}
            value={invention.status}
            disabled={pending || !onStatusChange}
            onChange={(event) => void handleStatusChange(event.target.value)}
            className="rounded-md border border-mist-200 bg-white px-2 py-1 text-xs font-medium text-navy-700 disabled:opacity-60"
          >
            {selectableInventionStatuses().map((status) => (
              <option key={status} value={status}>
                {inventionStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`${ROUTES.profile(invention.id)}#readiness-dashboard`}
            className="link-brand text-xs font-semibold"
          >
            Preparation
          </Link>
          <Link
            href={ROUTES.profile(invention.id)}
            className="link-brand text-xs font-semibold"
          >
            Open packet
          </Link>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-warm-700">
          {error}
        </p>
      ) : null}
    </article>
  );
}
