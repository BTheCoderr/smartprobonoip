import Link from "next/link";
import { TERMS_OF_SERVICE } from "@/lib/disclaimer";
import { BRAND, LEGAL } from "@/lib/brand";
import { ROUTES } from "@/lib/routes";
import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  const paragraphs = TERMS_OF_SERVICE.split("\n\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-navy-600">
        {BRAND.product}
      </p>
      <h1 className="text-3xl font-bold text-navy-900">Terms of Service</h1>
      <p className="mt-2 text-navy-500">
        Plain-language terms for using SmartProBonoIP during the pilot.
      </p>
      <p className="mt-3 rounded-lg border border-aqua-200 bg-aqua-50 px-3 py-2 text-xs text-navy-700">
        Draft — review before legal sign-off.
      </p>

      <Card className="mt-8 space-y-4 text-sm leading-relaxed text-navy-700">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-navy-900">Related policies</h2>
        <p className="mt-2 text-sm text-navy-600">
          These Terms work together with our privacy, disclaimer, and trust
          materials.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={ROUTES.privacy} className="btn-secondary px-5 py-2.5 text-sm">
            Privacy
          </Link>
          <Link href={ROUTES.disclaimer} className="btn-secondary px-5 py-2.5 text-sm">
            Disclaimer
          </Link>
          <Link href={ROUTES.trust} className="btn-secondary px-5 py-2.5 text-sm">
            Trust Center
          </Link>
        </div>
        <p className="mt-4 text-xs text-navy-500">
          Questions: {LEGAL.privacyEmail}
        </p>
      </Card>

      <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
        <Link href={ROUTES.home} className="text-navy-600 hover:text-navy-800">
          ← Back to product
        </Link>
      </div>
    </div>
  );
}
