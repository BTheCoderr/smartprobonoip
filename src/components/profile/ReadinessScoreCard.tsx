import {
  computeReadinessScore,
  computeReadinessScoreBreakdown,
} from "@/lib/attorneyExport";
import { buildReadinessMetrics } from "@/lib/packet";
import type { ProjectRecord } from "@/lib/types";

function scoreTone(score: number): string {
  if (score >= 75) return "text-teal-700";
  if (score >= 50) return "text-navy-800";
  return "text-warm-700";
}

function ringColor(score: number): string {
  if (score >= 75) return "border-teal-500";
  if (score >= 50) return "border-navy-400";
  return "border-warm-400";
}

export function ReadinessScoreCard({
  record,
  savedReferenceCount = 0,
}: {
  record: ProjectRecord;
  savedReferenceCount?: number;
}) {
  const score = computeReadinessScore(record, savedReferenceCount);
  const breakdown = computeReadinessScoreBreakdown(record, savedReferenceCount);
  const metrics = buildReadinessMetrics(record, savedReferenceCount);
  const highlight = metrics.slice(0, 4);

  return (
    <div className="overflow-hidden rounded-md border border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-white to-cream shadow-[var(--shadow-paper)]">
      <div className="border-b border-dashed border-mist-200 px-5 py-3 sm:px-6">
        <p className="section-kicker text-teal-700">Organization score</p>
        <p className="mt-1 text-xs leading-relaxed text-navy-500">
          Measures how organized your packet is — not legal merit or patentability.
        </p>
      </div>
      <div className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="flex flex-col items-center justify-center">
          <div
            className={`relative flex h-24 w-24 items-center justify-center rounded-full border-[5px] bg-white ${ringColor(score)}`}
          >
            <span className={`text-3xl font-bold tabular-nums ${scoreTone(score)}`}>
              {score}
            </span>
          </div>
          <p className="mt-2 text-center text-[10px] font-mono uppercase tracking-wide text-navy-500">
            out of 100
          </p>
        </div>
        <div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {highlight.map((metric) => (
              <li
                key={metric.label}
                className="rounded-md border border-mist-200/80 bg-white/80 px-3 py-2.5"
              >
                <p className="text-[10px] font-mono uppercase tracking-wide text-navy-400">
                  {metric.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-navy-800">
                  {metric.value}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-navy-500">
            Add timeline dates, materials, and saved similar references to raise
            your organization score before expert review.
          </p>
          <details className="group mt-3">
            <summary className="cursor-pointer list-none text-xs font-medium text-teal-700 hover:text-teal-900 [&::-webkit-details-marker]:hidden">
              How this score is calculated
            </summary>
            <ul className="mt-2 space-y-1.5">
              {breakdown.map((entry) => (
                <li
                  key={entry.label}
                  className="flex items-center justify-between rounded-md border border-mist-200/80 bg-white/80 px-3 py-1.5 text-xs text-navy-700"
                >
                  <span>{entry.label}</span>
                  <span className="font-semibold tabular-nums">
                    {Math.round(entry.points)} /{" "}
                    {entry.max <= 9 ? `+${entry.max}` : entry.max}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] leading-relaxed text-navy-500">
              Measures packet organization only — not legal merit.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
