import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-mist-200/90 bg-cream/95 backdrop-blur-md">
      <nav className="page-shell flex items-center justify-between gap-4 py-3">
        <Link href="/smartprobonoip" className="group flex min-w-0 items-center gap-3">
          <span className="nav-mark shrink-0">IP</span>
          <span className="min-w-0 flex flex-col leading-tight">
            <span className="truncate font-serif text-base font-bold tracking-tight text-navy-900">
              {BRAND.product}
            </span>
            <span className="truncate text-[10px] font-mono uppercase tracking-[0.12em] text-muted-blue">
              Invention access desk
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1">
          <Link
            href="/smartprobonoip/sample"
            className="hidden rounded-md px-2.5 py-2 font-medium text-navy-600 transition hover:bg-mist-100 md:inline-block"
          >
            Sample
          </Link>
          <Link
            href="/smartprobonoip/pilot"
            className="hidden rounded-md px-2.5 py-2 font-medium text-navy-600 transition hover:bg-mist-100 md:inline-block"
          >
            Pilot
          </Link>
          <Link
            href="/smartprobonoip/dashboard"
            className="hidden rounded-md px-2.5 py-2 font-medium text-navy-600 transition hover:bg-mist-100 lg:inline-block"
          >
            Dashboard
          </Link>
          <Link href="/smartprobonoip/start" className="btn-primary px-4 py-2 text-xs sm:text-sm">
            Start your packet
          </Link>
        </div>
      </nav>
    </header>
  );
}
