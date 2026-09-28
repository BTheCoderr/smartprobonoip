import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { ROUTES } from "@/lib/routes";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-mist-200/90 bg-cream/95 backdrop-blur-md">
      <nav className="page-shell flex items-center justify-between gap-3 py-3">
        <BrandMark variant="compact" href={ROUTES.home} />
        <div className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1">
          <Link href={ROUTES.legal} className="link-brand hidden rounded-md px-2 py-2 font-medium sm:inline-block">
            Legal
          </Link>
          <Link href={ROUTES.ip} className="link-brand hidden rounded-md px-2 py-2 font-medium sm:inline-block">
            IP
          </Link>
          <Link href={ROUTES.workspace} className="link-brand hidden rounded-md px-2 py-2 font-medium md:inline-block">
            IP Workspace
          </Link>
          <Link href={ROUTES.learn} className="link-brand hidden rounded-md px-2 py-2 font-medium lg:inline-block">
            Learn
          </Link>
          <Link href={ROUTES.forProfessionals} className="link-brand hidden rounded-md px-2 py-2 font-medium lg:inline-block">
            Professionals
          </Link>
          <Link href="/#choose-a-path" className="btn-primary px-3 py-2 text-xs sm:px-4 sm:text-sm">
            Choose a path
          </Link>
        </div>
      </nav>
    </header>
  );
}
