import { formatEventRelative } from "@/lib/timeline/format";
import type { PortfolioSummary } from "@/lib/portfolio/types";

export function WorkspaceHeader({ summary }: { summary: PortfolioSummary }) {
  const subtitle =
    summary.total === 0
      ? "Start your first invention when you are ready."
      : summary.lastActivityAt
        ? `Last activity ${formatEventRelative(summary.lastActivityAt).toLowerCase()}.`
        : `${summary.active} invention${summary.active === 1 ? "" : "s"} in progress.`;

  return (
    <header className="mb-8">
      <p className="section-kicker">Inventor workspace</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
        Welcome back
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-navy-500">{subtitle}</p>
    </header>
  );
}
