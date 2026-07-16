import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { BRAND, formatCopyrightNotice } from "@/lib/brand";
import { DISCLAIMER_SHORT } from "@/lib/disclaimer";
import { ROUTES } from "@/lib/routes";

const footerLinkClass =
  "text-aqua-200 transition hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-auto border-t border-teal-500/25 bg-navy-950 text-cream">
      <div className="page-shell py-8 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <BrandMark variant="full" size="sm" light />
            <p className="mt-2 text-xs leading-relaxed text-navy-100">
              {BRAND.tagline}
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-4 gap-y-2.5 text-xs font-medium"
          >
            <Link href={ROUTES.home} className={footerLinkClass}>
              Product
            </Link>
            <Link href={ROUTES.sample} className={footerLinkClass}>
              Sample
            </Link>
            <Link href={ROUTES.learn} className={footerLinkClass}>
              Learn
            </Link>
            <Link href={ROUTES.trust} className={footerLinkClass}>
              Trust
            </Link>
            <Link href={ROUTES.forProfessionals} className={footerLinkClass}>
              For Professionals
            </Link>
            <Link href={ROUTES.pilot} className={footerLinkClass}>
              Pilot kit
            </Link>
            <Link href={ROUTES.afterMeeting} className={footerLinkClass}>
              After Meeting
            </Link>
            <Link href={ROUTES.privacy} className={footerLinkClass}>
              Privacy
            </Link>
            <Link href={ROUTES.terms} className={footerLinkClass}>
              Terms
            </Link>
            <Link href={ROUTES.disclaimer} className={footerLinkClass}>
              Disclaimer
            </Link>
            <Link href={ROUTES.contact} className={footerLinkClass}>
              Contact
            </Link>
          </nav>
        </div>
        <p className="mt-6 max-w-3xl text-[11px] leading-relaxed text-navy-100 sm:text-xs">
          {DISCLAIMER_SHORT}{" "}
          <Link
            href={ROUTES.trust}
            className="font-medium text-aqua-200 underline-offset-2 transition hover:text-cream hover:underline"
          >
            Trust Center
          </Link>
        </p>
        <p className="mt-3 text-[11px] text-navy-200 sm:text-xs">
          {formatCopyrightNotice()}
        </p>
      </div>
    </footer>
  );
}
