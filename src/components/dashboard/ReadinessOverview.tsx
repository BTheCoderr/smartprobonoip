import Link from "next/link";
import { ReadinessMeter } from "@/components/portfolio/ReadinessMeter";
import { Card, CardHeader } from "@/components/ui/Card";
import type { PortfolioSummary } from "@/lib/portfolio/types";
import { ROUTES } from "@/lib/routes";

export function ReadinessOverview({ summary }: { summary: PortfolioSummary }) {
  if (summary.active === 0) return null;

  return (
    <Card>
      <CardHeader
        title="Packet preparation overview"
        subtitle="How complete each packet is for a professional conversation. Preparation only — not patentability, novelty, or filing readiness."
      />

      {summary.averageReadiness !== null ? (
        <div className="mb-5">
          <ReadinessMeter score={summary.averageReadiness} />
        </div>
      ) : null}

      {summary.strongest ? (
        <div className="mb-4 rounded-xl bg-mist-50/80 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">
            Most prepared
          </p>
          <Link
            href={`${ROUTES.profile(summary.strongest.id)}#readiness-dashboard`}
            className="link-brand mt-0.5 block truncate text-sm font-semibold"
          >
            {summary.strongest.title}
          </Link>
          <div className="mt-2">
            <ReadinessMeter
              score={summary.strongest.readinessScore}
              size="compact"
              showLabel={false}
            />
          </div>
        </div>
      ) : null}

      {summary.needsAttention.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-navy-400">
            Needs attention
          </p>
          <ul className="m-0 list-none space-y-2 p-0">
            {summary.needsAttention.map((invention) => (
              <li
                key={invention.id}
                className="flex items-center justify-between gap-3"
              >
                <Link
                  href={`${ROUTES.profile(invention.id)}#readiness-dashboard`}
                  className="link-brand min-w-0 flex-1 truncate text-sm"
                >
                  {invention.title}
                </Link>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-navy-500">
                  {invention.readinessScore}/100
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-navy-500">
          Every active invention is above the attention threshold.
        </p>
      )}
    </Card>
  );
}
