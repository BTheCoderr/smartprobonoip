import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-mist-200/90 bg-cream/95 backdrop-blur-md">
      <nav className="page-shell flex items-center justify-between gap-4 py-3">
        <BrandMark variant="compact" href="/smartprobonoip" />
        <div className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1">
          <Link
            href="/smartprobonoip/sample"
            className="hidden rounded-md px-2.5 py-2 font-medium text-navy-600 transition hover:bg-mist-100 md:inline-block"
          >
            Sample
          </Link>
          <Link
            href="/about"
            className="hidden rounded-md px-2.5 py-2 font-medium text-navy-600 transition hover:bg-mist-100 md:inline-block"
          >
            About
          </Link>
          <Link
            href="/smartprobonoip/pilot"
            className="hidden rounded-md px-2.5 py-2 font-medium text-navy-600 transition hover:bg-mist-100 md:inline-block"
          >
            Pilot
          </Link>
          <Link
            href="/for-professionals"
            className="hidden rounded-md px-2.5 py-2 font-medium text-navy-600 transition hover:bg-mist-100 lg:inline-block"
          >
            Professionals
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-md px-2.5 py-2 font-medium text-navy-600 transition hover:bg-mist-100 md:inline-block"
          >
            Contact
          </Link>
          <Link href="/smartprobonoip/start" className="btn-primary px-4 py-2 text-xs sm:text-sm">
            Start free packet
          </Link>
        </div>
      </nav>
    </header>
  );
}
