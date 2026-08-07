import { ReadinessDashboard } from "@/components/profile/ReadinessDashboard";
import { buildReadinessMetrics } from "@/lib/packet";
import type { ProjectRecord } from "@/lib/types";

/**
 * Packet-page readiness surface. Overall score is canonical Formula A only.
 * Formula C metrics remain secondary descriptive tiles — never the hero number.
 */
export function ReadinessScoreCard({
  record,
  savedReferenceCount = 0,
}: {
  record: ProjectRecord;
  savedReferenceCount?: number;
}) {
  const metrics = buildReadinessMetrics(record, savedReferenceCount);

  return (
    <div className="space-y-4">
      <ReadinessDashboard
        record={record}
        savedReferenceCount={savedReferenceCount}
      />
      <div className="rounded-md border border-mist-200/80 bg-white/80 px-4 py-3">
        <p className="text-[10px] font-mono uppercase tracking-wide text-navy-400">
          Additional packet metrics
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-navy-500">
          Descriptive checklist signals only — not the overall preparation score
          above.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {metrics.slice(0, 4).map((metric) => (
            <li
              key={metric.label}
              className="rounded-md border border-mist-200/80 bg-mist-50/40 px-3 py-2"
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
      </div>
    </div>
  );
}
