import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-mist-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-white">
            iP
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-navy-900">
              {BRAND.umbrella}
              <span className="text-teal-600">IP</span>
            </span>
            <span className="text-[11px] text-navy-500">{BRAND.feature}</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm sm:gap-2">
          <Link
            href="/smartprobonoip"
            className="hidden rounded-md px-3 py-2 text-navy-700 transition hover:bg-mist-100 sm:inline-block"
          >
            Product
          </Link>
          <Link
            href="/smartprobonoip/disclaimer?demo=1"
            className="hidden rounded-md px-3 py-2 text-teal-700 transition hover:bg-teal-50 sm:inline-block"
          >
            Demo
          </Link>
          <Link
            href="/smartprobonoip/dashboard"
            className="hidden rounded-md px-3 py-2 text-navy-700 transition hover:bg-mist-100 sm:inline-block"
          >
            Dashboard
          </Link>
          <Link
            href="/smartprobonoip/start"
            className="rounded-md bg-teal-600 px-4 py-2 font-medium text-white transition hover:bg-teal-700"
          >
            Start
          </Link>
        </div>
      </nav>
    </header>
  );
}
