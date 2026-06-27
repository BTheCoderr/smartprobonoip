import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { DISCLAIMER_SHORT } from "@/lib/disclaimer";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-mist-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-navy-900">
              {BRAND.umbrella}
              <span className="text-teal-600">IP</span>
            </p>
            <p className="text-xs text-navy-500">{BRAND.tagline}</p>
          </div>
          <div className="flex gap-4 text-xs text-navy-500">
            <Link href="/smartprobonoip" className="hover:text-teal-600">
              Product
            </Link>
            <Link href="/smartprobonoip/sample" className="hover:text-teal-600">
              Sample
            </Link>
            <Link href="/smartprobonoip/pilot" className="hover:text-teal-600">
              Pilot kit
            </Link>
            <Link href="/smartprobonoip/disclaimer" className="hover:text-teal-600">
              Disclaimer
            </Link>
            <Link href="/smartprobonoip/privacy" className="hover:text-teal-600">
              Privacy
            </Link>
            <Link href="/smartprobonoip/dashboard" className="hover:text-teal-600">
              Dashboard
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
