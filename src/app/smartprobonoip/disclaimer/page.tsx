"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DISCLAIMER } from "@/lib/disclaimer";
import { BRAND } from "@/lib/brand";
import { Card } from "@/components/ui/Card";
import { acknowledgeDisclaimer } from "@/lib/ack";

export default function DisclaimerPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const paragraphs = DISCLAIMER.split("\n\n");

  function handleContinue() {
    if (!agreed) return;
    acknowledgeDisclaimer();
    router.push("/smartprobonoip/start");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-teal-600">
        {BRAND.product}
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

        <ul className="mt-6 space-y-2 rounded-lg bg-mist-50 p-4 text-sm text-navy-600">
          <li>• We help you organize and prepare — we do not file anything.</li>
          <li>• We never tell you that you &ldquo;need a patent&rdquo; or that your idea is protectable.</li>
          <li>• We point you toward people and resources who can actually advise you.</li>
        </ul>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-mist-200 p-4 transition hover:bg-mist-50">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-teal-600"
          />
          <span className="text-sm text-navy-700">
            I understand that {BRAND.product} is an educational readiness tool
            and does not provide legal advice.
          </span>
        </label>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!agreed}
          className="mt-6 w-full rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-mist-300 disabled:text-navy-500"
        >
          I acknowledge — continue to intake
        </button>
      </Card>
    </div>
  );
}
