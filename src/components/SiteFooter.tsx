import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { BRAND } from "@/lib/brand";
import { DISCLAIMER_SHORT } from "@/lib/disclaimer";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-mist-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandMark variant="full" size="sm" />
            <p className="mt-2 text-xs text-navy-500">{BRAND.tagline}</p>
          </div>
          <div className="flex gap-4 text-xs text-navy-500">
            <Link href="/" className="hover:text-teal-600">
              Product
            </Link>
            <Link href="/sample" className="hover:text-teal-600">
              Sample
            </Link>
            <Link href="/about" className="hover:text-teal-600">
              About
            </Link>
            <Link href="/for-professionals" className="hover:text-teal-600">
              Professionals
            </Link>
            <Link href="/contact" className="hover:text-teal-600">
              Contact
            </Link>
            <Link href="/pilot" className="hover:text-teal-600">
              Pilot kit
            </Link>
            <Link href="/disclaimer" className="hover:text-teal-600">
              Disclaimer
            </Link>
            <Link href="/privacy" className="hover:text-teal-600">
              Privacy
            </Link>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-navy-500">
          {DISCLAIMER_SHORT}
        </p>
      </div>
    </footer>
  );
}
