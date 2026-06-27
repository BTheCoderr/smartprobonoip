import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-mist-200/80 bg-cream/95 backdrop-blur-md">
      <nav className="page-shell flex items-center justify-between gap-4 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 text-sm font-bold text-white shadow-[var(--shadow-paper)]">
            iP
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-navy-900">
              {BRAND.umbrella}
              <span className="text-teal-600">IP</span>
            </span>
            <span className="text-[11px] text-muted-blue">{BRAND.feature}</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm sm:gap-2">
          <Link
            href="/smartprobonoip"
            className="hidden rounded-xl px-3 py-2 font-medium text-navy-700 transition hover:bg-mist-100 sm:inline-block"
          >
            Product
          </Link>
          <Link
            href="/smartprobonoip/disclaimer?demo=1"
            className="hidden rounded-xl px-3 py-2 font-medium text-teal-700 transition hover:bg-teal-50 sm:inline-block"
          >
            Demo
          </Link>
          <Link
            href="/smartprobonoip/sample"
            className="hidden rounded-xl px-3 py-2 font-medium text-navy-700 transition hover:bg-mist-100 sm:inline-block"
          >
            Sample
          </Link>
          <Link
            href="/smartprobonoip/pilot"
            className="hidden rounded-xl px-3 py-2 font-medium text-navy-700 transition hover:bg-mist-100 sm:inline-block"
          >
            Pilot
          </Link>
          <Link
            href="/smartprobonoip/dashboard"
            className="hidden rounded-xl px-3 py-2 font-medium text-navy-700 transition hover:bg-mist-100 sm:inline-block"
          >
            Dashboard
          </Link>
          <Link
            href="/smartprobonoip/recover"
            className="hidden rounded-xl px-3 py-2 font-medium text-navy-700 transition hover:bg-mist-100 sm:inline-block"
          >
            Recover
          </Link>
          <Link href="/smartprobonoip/start" className="btn-primary px-4 py-2.5">
            Start
          </Link>
        </div>
      </nav>
    </header>
  );
}
