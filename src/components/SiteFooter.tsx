import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { BRAND } from "@/lib/brand";
import { DISCLAIMER_SHORT } from "@/lib/disclaimer";
import { ROUTES } from "@/lib/routes";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-mist-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandMark variant="full" size="sm" />
            <p className="mt-2 text-xs text-navy-500">{BRAND.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-navy-500">
            <Link href={ROUTES.home} className="hover:text-navy-700">
              Product
            </Link>
            <Link href={ROUTES.sample} className="hover:text-navy-700">
              Sample
            </Link>
            <Link href={ROUTES.learn} className="hover:text-navy-700">
              Learn
            </Link>
            <Link href={ROUTES.trust} className="hover:text-navy-700">
              Trust
            </Link>
            <Link href={ROUTES.forProfessionals} className="hover:text-navy-700">
              For Professionals
            </Link>
            <Link href={ROUTES.pilot} className="hover:text-navy-700">
              Pilot kit
            </Link>
            <Link href={ROUTES.afterMeeting} className="hover:text-navy-700">
              After Meeting
            </Link>
            <Link href={ROUTES.privacy} className="hover:text-navy-700">
              Privacy
            </Link>
            <Link href={ROUTES.disclaimer} className="hover:text-navy-700">
              Disclaimer
            </Link>
            <Link href={ROUTES.contact} className="hover:text-navy-700">
              Contact
            </Link>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-navy-500">
          {DISCLAIMER_SHORT}{" "}
          <Link href={ROUTES.trust} className="text-navy-600 hover:underline">
            Trust Center
          </Link>
        </p>
      </div>
    </footer>
  );
}
