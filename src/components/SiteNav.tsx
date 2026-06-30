import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { ROUTES } from "@/lib/routes";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-mist-200/90 bg-cream/95 backdrop-blur-md">
      <nav className="page-shell flex items-center justify-between gap-3 py-3">
        <BrandMark variant="compact" href={ROUTES.home} />
        <div className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1">
          <Link
            href={ROUTES.sample}
            className="hidden rounded-md px-2 py-2 font-medium text-navy-600 transition hover:bg-mist-100 sm:inline-block"
          >
            Sample
          </Link>
          <Link
            href={ROUTES.learn}
            className="hidden rounded-md px-2 py-2 font-medium text-navy-600 transition hover:bg-mist-100 md:inline-block"
          >
            Learn
          </Link>
          <Link
            href={ROUTES.trust}
            className="hidden rounded-md px-2 py-2 font-medium text-navy-600 transition hover:bg-mist-100 md:inline-block"
          >
            Trust
          </Link>
          <Link
            href={ROUTES.pilot}
            className="hidden rounded-md px-2 py-2 font-medium text-navy-600 transition hover:bg-mist-100 lg:inline-block"
          >
            Pilot
          </Link>
          <Link
            href={ROUTES.forProfessionals}
            className="hidden rounded-md px-2 py-2 font-medium text-navy-600 transition hover:bg-mist-100 lg:inline-block"
          >
            Professionals
          </Link>
          <Link href={ROUTES.start} className="btn-primary px-3 py-2 text-xs sm:px-4 sm:text-sm">
            Start your packet
          </Link>
        </div>
      </nav>
    </header>
  );
}
