import { buildGooglePatentsUrl } from "@/lib/research/buildLinks";

export function FeaturedGooglePatentsCard({
  query,
  compact,
  href,
}: {
  query?: string;
  compact?: boolean;
  href?: string;
}) {
  const url = href ?? (query?.trim() ? buildGooglePatentsUrl(query) : "https://patents.google.com/");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`featured-tool-card block transition hover:-translate-y-px ${compact ? "p-4" : "p-5 sm:p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="featured-tool-badge">#1 · Recommended</span>
            <span className="text-[10px] font-mono uppercase tracking-wide text-navy-400">
              Start here
            </span>
          </div>
          <h3 className={`headline-editorial mt-2 text-navy-900 ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}>
            Google Patents
          </h3>
          <p className={`mt-2 max-w-2xl leading-relaxed text-navy-600 ${compact ? "text-xs" : "text-sm"}`}>
            Best overall starting point for most inventors — search published patents and
            applications worldwide. Preparation only, not a patentability opinion.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center justify-center rounded-md border border-teal-700 bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-[var(--shadow-btn)] sm:text-sm">
          Open Google Patents →
        </span>
      </div>
      {query?.trim() ? (
        <p className="mt-3 font-mono text-[11px] text-teal-800">
          Starter query: {query}
        </p>
      ) : null}
    </a>
  );
}

export function SearchToolGridLink({
  label,
  description,
  href,
  badge,
}: {
  label: string;
  description: string;
  href: string;
  badge?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="dossier-card block px-4 py-4 transition hover:border-teal-200 hover:bg-teal-50/20"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-navy-900">{label}</p>
        {badge ? (
          <span className="rounded-full bg-mist-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-600">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-navy-600">{description}</p>
      <p className="mt-2 text-[11px] font-medium text-teal-700">Open tool →</p>
    </a>
  );
}

export function SearchPrepHomePreview() {
  return (
    <div className="space-y-4">
      <FeaturedGooglePatentsCard compact query="portable water filter bottle seal" />
      <div className="grid gap-3 sm:grid-cols-2">
        <SearchToolGridLink
          label="USPTO Patent Public Search"
          badge="US formal"
          description="Official US patent document search workspace."
          href="https://ppubs.uspto.gov/pubwebapp/static/pages/ppubsbasic.html"
        />
        <SearchToolGridLink
          label="The Lens"
          badge="Research"
          description="Patents plus scholarly articles for broader coverage."
          href="https://www.lens.org/lens/search/patent/"
        />
      </div>
      <p className="text-[11px] leading-relaxed text-navy-500">
        Grouped starter queries, gap maps, and CPC conversation starters available in each
        packet — preparation only.
      </p>
    </div>
  );
}
