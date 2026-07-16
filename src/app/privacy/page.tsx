import Link from "next/link";
import { PRIVACY_NOTICE } from "@/lib/disclaimer";
import { BRAND, LEGAL } from "@/lib/brand";
import { ROUTES } from "@/lib/routes";
import { Card } from "@/components/ui/Card";

export default function PrivacyPage() {
  const paragraphs = PRIVACY_NOTICE.split("\n\n");
  const coreParagraphs = paragraphs.slice(0, 7);
  const retentionParagraphs = paragraphs.slice(7);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-navy-600">
        {BRAND.product}
      </p>
      <h1 className="text-3xl font-bold text-navy-900">Privacy & your data</h1>
      <p className="mt-2 text-navy-500">
        Plain-language summary of what we collect and how you can request export
        or deletion during the pilot.
      </p>

      <Card className="mt-8 space-y-4 text-sm leading-relaxed text-navy-700">
        {coreParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Card>

      <Card className="mt-6 space-y-4 text-sm leading-relaxed text-navy-700">
        <h2 className="text-lg font-semibold text-navy-900">
          Retention, subprocessors & security
        </h2>
        {retentionParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          During the pilot (10–25 inventors), demo records are clearly marked
          and excluded from live pilot reporting.
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
            href={`mailto:${LEGAL.privacyEmail}?subject=SmartProBonoIP%20data%20export%20request`}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            Request data export
          </a>
          <a
            href={`mailto:${LEGAL.privacyEmail}?subject=SmartProBonoIP%20data%20deletion%20request`}
            className="btn-secondary px-5 py-2.5 text-sm"
          >
            Request data deletion
          </a>
        </div>
        <p className="mt-4 text-xs text-navy-500">
          Contact: {LEGAL.privacyEmail} — update before production pilot if
          needed.
        </p>
      </Card>

      <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
        <Link href={ROUTES.terms} className="text-navy-600 hover:text-navy-800">
          Terms of Service →
        </Link>
        <Link href={ROUTES.trust} className="text-navy-600 hover:text-navy-800">
          Trust Center →
        </Link>
        <Link href={ROUTES.disclaimer} className="text-navy-600 hover:text-navy-800">
          ← Back to disclaimer
        </Link>
      </div>
    </div>
  );
}
