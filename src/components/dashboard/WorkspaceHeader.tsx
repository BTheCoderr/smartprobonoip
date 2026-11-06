import { formatEventRelative } from "@/lib/timeline/format";
import type { PortfolioSummary } from "@/lib/portfolio/types";

export function WorkspaceHeader({ summary }: { summary: PortfolioSummary }) {
  const subtitle =
    summary.total === 0
      ? "Create or continue a matter, organize what you know, and prepare it for professional review."
      : summary.lastActivityAt
        ? `Your IP preparation is part of your Matter workspace. Last IP activity ${formatEventRelative(summary.lastActivityAt).toLowerCase()}.`
        : `${summary.active} IP matter${summary.active === 1 ? "" : "s"} in preparation.`;

  return (
    <header className="mb-8">
      <p className="section-kicker">SmartProBono · Matter Readiness</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
        Your matters
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-500">{subtitle}</p>
      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-navy-400">
        SmartProBono helps organize facts, documents, timelines, missing information, and questions for professional review. It does not decide legal rights or strategy.
      </p>
    </header>
  );
}
