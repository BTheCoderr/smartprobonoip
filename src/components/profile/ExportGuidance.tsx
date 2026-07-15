import Link from "next/link";
import { PRODUCT_COPY } from "@/lib/copy";

export function ExportGuidance({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="rounded-md border border-teal-200 bg-gradient-to-br from-teal-50/60 to-white px-5 py-5 shadow-[var(--shadow-paper)] sm:px-6">
      <p className="section-kicker text-teal-700">After you export</p>
      <h3 className="headline-editorial mt-2 text-lg text-navy-900">
        {PRODUCT_COPY.exportGuidance.title}
      </h3>
      <ol className="mt-4 space-y-2 text-sm leading-relaxed text-navy-700">
        {PRODUCT_COPY.exportGuidance.steps.map((step, i) => (
          <li key={step} className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/smartprobonoip/sample#similar-reference-search-prep"
          className="btn-secondary text-xs sm:text-sm"
        >
          Open search prep
        </Link>
        {onDismiss ? (
          <button type="button" onClick={onDismiss} className="btn-ghost text-xs sm:text-sm">
            Dismiss
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-navy-500">
        {PRODUCT_COPY.exportGuidance.disclaimer}
      </p>
    </div>
  );
}
