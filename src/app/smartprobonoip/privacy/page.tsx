import Link from "next/link";
import { PRIVACY_NOTICE } from "@/lib/disclaimer";
import { BRAND } from "@/lib/brand";
import { Card } from "@/components/ui/Card";

const SUPPORT_EMAIL = "privacy@smartprobonoip.org";

export default function PrivacyPage() {
  const paragraphs = PRIVACY_NOTICE.split("\n\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-teal-600">
        {BRAND.product}
      </p>
      <h1 className="text-3xl font-bold text-navy-900">Privacy & your data</h1>
      <p className="mt-2 text-navy-500">
        Plain-language summary of what we collect and how you can request export
        or deletion during the pilot.
      </p>

      <Card className="mt-8 space-y-4 text-sm leading-relaxed text-navy-700">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          During the pilot (10–25 inventors), we keep records only as long as
          needed to measure readiness impact and improve the tool. Demo records
          are clearly marked and excluded from live pilot reporting.
        </p>
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-navy-900">Your data rights</h2>
        <p className="mt-2 text-sm text-navy-600">
          Email us to request export or deletion during the pilot and we will
          respond within a reasonable timeframe.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=SmartProBonoIP%20data%20export%20request`}
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Request data export
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=SmartProBonoIP%20data%20deletion%20request`}
            className="rounded-lg border border-mist-300 px-5 py-2.5 text-sm font-semibold text-navy-700 hover:bg-mist-100"
          >
            Request data deletion
          </a>
        </div>
        <p className="mt-4 text-xs text-navy-500">
          Placeholder contact: {SUPPORT_EMAIL} — update before production pilot.
        </p>
      </Card>

      <Link
        href="/smartprobonoip/disclaimer"
        className="mt-6 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        ← Back to disclaimer
      </Link>
    </div>
  );
}
