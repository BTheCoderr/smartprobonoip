"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  DISCLAIMER,
  PRIVACY_NOTICE,
  CONSENT_EDUCATIONAL,
  CONSENT_CONFIDENTIAL,
} from "@/lib/disclaimer";
import { ROUTES } from "@/lib/routes";
import { BRAND } from "@/lib/brand";
import { Card } from "@/components/ui/Card";
import { acknowledgeDisclaimer } from "@/lib/ack";
import { trackEvent, trackStartClicked } from "@/lib/analytics/client";
import { activateDemoFromQuery } from "@/lib/demo";

export default function DisclaimerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agreedEducational, setAgreedEducational] = useState(false);
  const [agreedConfidential, setAgreedConfidential] = useState(false);
  const paragraphs = DISCLAIMER.split("\n\n");
  const privacyParagraphs = PRIVACY_NOTICE.split("\n\n");
  const isDemo = searchParams.get("demo") === "1";
  const canContinue = agreedEducational && agreedConfidential;

  useEffect(() => {
    activateDemoFromQuery(`?${searchParams.toString()}`);
  }, [searchParams]);

  function handleContinue() {
    if (!canContinue) return;
    acknowledgeDisclaimer();
    trackEvent("disclaimer_accepted", { metadata: { demo: isDemo } });
    trackStartClicked(isDemo);
    router.push(isDemo ? "/start?demo=1" : "/start");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-teal-600">
        {BRAND.product}
        {isDemo ? (
          <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-xs normal-case text-teal-800">
            Demo mode
          </span>
        ) : null}
      </p>
      <h1 className="text-3xl font-bold text-navy-900">
        Before you begin: please read this
      </h1>
      <p className="mt-2 text-navy-500">
        We want to be clear about what {BRAND.product} is — and what it is not.
      </p>

      <Card className="mt-8">
        <div className="space-y-4 text-sm leading-relaxed text-navy-700">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-mist-200 bg-mist-50 p-4">
          <h2 className="text-sm font-semibold text-navy-900">Privacy notice</h2>
          <div className="mt-2 space-y-2 text-sm text-navy-600">
            {privacyParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <ul className="mt-6 space-y-2 rounded-lg bg-mist-50 p-4 text-sm text-navy-600">
          <li>• We help you organize and prepare — we do not file anything.</li>
          <li>• We never tell you that you &ldquo;need a patent&rdquo; or that your idea is protectable.</li>
          <li>• We point you toward people and resources who can actually advise you.</li>
        </ul>

        <p className="mt-4 text-sm">
          <Link href={ROUTES.trust} className="font-medium text-navy-600 hover:underline">
            Read the Trust Center →
          </Link>
          {" · "}
          <Link href={ROUTES.privacy} className="font-medium text-navy-600 hover:underline">
            Privacy summary
          </Link>
        </p>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-mist-200 p-4 transition hover:bg-mist-50">
          <input
            type="checkbox"
            checked={agreedEducational}
            onChange={(e) => setAgreedEducational(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-teal-600"
          />
          <span className="text-sm text-navy-700">{CONSENT_EDUCATIONAL}</span>
        </label>

        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border border-mist-200 p-4 transition hover:bg-mist-50">
          <input
            type="checkbox"
            checked={agreedConfidential}
            onChange={(e) => setAgreedConfidential(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-teal-600"
          />
          <span className="text-sm text-navy-700">{CONSENT_CONFIDENTIAL}</span>
        </label>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="mt-6 w-full rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-mist-300 disabled:text-navy-500"
        >
          I acknowledge — continue to intake
        </button>
      </Card>
    </div>
  );
}
