import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { BRAND } from "@/lib/brand";
import { DISCLAIMER_SHORT } from "@/lib/disclaimer";
import { ROUTES } from "@/lib/routes";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-navy-800 bg-navy-950 text-navy-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandMark variant="full" size="sm" light />
            <p className="mt-2 text-xs text-navy-200">{BRAND.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-aqua-200">
            <Link href={ROUTES.home} className="transition hover:text-white">
              Product
            </Link>
            <Link href={ROUTES.sample} className="transition hover:text-white">
              Sample
            </Link>
            <Link href={ROUTES.learn} className="transition hover:text-white">
              Learn
            </Link>
            <Link href={ROUTES.trust} className="transition hover:text-white">
              Trust
            </Link>
            <Link href={ROUTES.forProfessionals} className="transition hover:text-white">
              For Professionals
            </Link>
            <Link href={ROUTES.pilot} className="transition hover:text-white">
              Pilot kit
            </Link>
            <Link href={ROUTES.afterMeeting} className="transition hover:text-white">
              After Meeting
            </Link>
            <Link href={ROUTES.privacy} className="transition hover:text-white">
              Privacy
            </Link>
            <Link href={ROUTES.disclaimer} className="transition hover:text-white">
              Disclaimer
            </Link>
            <Link href={ROUTES.contact} className="transition hover:text-white">
              Contact
            </Link>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-navy-200">
          {DISCLAIMER_SHORT}{" "}
          <Link href={ROUTES.trust} className="text-aqua-300 transition hover:text-white hover:underline">
            Trust Center
          </Link>
        </p>
      </div>
    </footer>
  );
}
