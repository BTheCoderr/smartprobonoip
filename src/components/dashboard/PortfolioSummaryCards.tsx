import { inventionStatusLabel } from "@/lib/ideas/status";
import type { PortfolioSummary } from "@/lib/portfolio/types";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-mist-200/80 bg-white p-4 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-navy-900">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-navy-500">{hint}</p> : null}
    </div>
  );
}

export function PortfolioSummaryCards({
  summary,
}: {
  summary: PortfolioSummary;
}) {
  const withProfessional = summary.byStatus.professional_review;

  return (
    <section aria-label="Portfolio summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Inventions"
        value={String(summary.total)}
        hint={
          summary.archived > 0
            ? `${summary.active} active · ${summary.archived} archived`
            : "All active"
        }
      />
      <StatCard
        label="Average preparation"
        value={
          summary.averageReadiness === null
            ? "—"
            : `${summary.averageReadiness}/100`
        }
        hint="Across active inventions"
      />
      <StatCard
        label={inventionStatusLabel("professional_review")}
        value={String(withProfessional)}
        hint="Shared for expert review"
      />
      <StatCard
        label="Public sharing noted"
        value={String(summary.publicDisclosureCount)}
        hint="Worth raising with a professional"
      />
    </section>
  );
}
