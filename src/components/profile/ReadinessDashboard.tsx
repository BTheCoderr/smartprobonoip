import Link from "next/link";
import { ReadinessMeter } from "@/components/portfolio/ReadinessMeter";
import { NextBestStepsPanel } from "@/components/routing/NextBestStepsPanel";
import { buildReadinessEvaluation } from "@/lib/readiness";
import type { ProjectRecord } from "@/lib/types";

export function ReadinessDashboard({
  record,
  savedReferenceCount = 0,
}: {
  record: ProjectRecord;
  savedReferenceCount?: number;
}) {
  const evaluation = buildReadinessEvaluation(record, savedReferenceCount);

  return (
    <div
      id="readiness-dashboard"
      className="overflow-hidden rounded-md border border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-white to-cream shadow-[var(--shadow-paper)]"
    >
      <div className="border-b border-dashed border-mist-200 px-5 py-3 sm:px-6">
        <p className="section-kicker text-teal-700">Packet preparation score</p>
        <p className="mt-1 text-xs leading-relaxed text-navy-500">
          Measures how complete and organized your packet is for a professional
          conversation — not patentability, novelty, legal sufficiency, or filing
          readiness.
        </p>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,11rem)_1fr]">
          <div className="flex flex-col items-center justify-center rounded-lg border border-mist-200/80 bg-white/80 px-4 py-5">
            <p className="text-4xl font-bold tabular-nums text-navy-900">
              {evaluation.overallScore}
            </p>
            <p className="mt-1 text-[10px] font-mono uppercase tracking-wide text-navy-500">
              out of 100
            </p>
            <div className="mt-4 w-full">
              <ReadinessMeter
                score={evaluation.overallScore}
                size="compact"
                showLabel={false}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              Component breakdown
            </p>
            <ul className="mt-2 space-y-2">
              {evaluation.categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-md border border-mist-200/80 bg-white/80 px-3 py-2.5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-navy-800">
                      {category.label}
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-navy-600">
                      {category.score}/{category.max}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist-100">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{
                        width: `${Math.round((category.score / category.max) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-navy-500">
                    {category.whyItMatters}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <NextBestStepsPanel
          record={record}
          savedReferenceCount={savedReferenceCount}
          variant="full"
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            Improve this packet
          </p>
          {evaluation.actions.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {evaluation.actions.map((action) => (
                <li
                  key={action.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-mist-200/80 bg-white/80 px-3 py-2.5"
                >
                  <span className="text-sm text-navy-800">{action.label}</span>
                  <Link
                    href={action.target.href}
                    className="link-brand shrink-0 text-xs font-semibold"
                  >
                    {action.target.label} →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-navy-600">
              Every scored field is filled. Review expert questions on this page
              before your next conversation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
