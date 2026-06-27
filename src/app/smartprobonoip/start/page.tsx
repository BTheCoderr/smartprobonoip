"use client";

import Link from "next/link";
import { Suspense } from "react";
import { IntakeForm } from "@/components/intake/IntakeForm";
import { Card } from "@/components/ui/Card";
import { hasAcknowledgedDisclaimer } from "@/lib/ack";
import { useIsClient } from "@/lib/useIsClient";
import { BRAND } from "@/lib/brand";

export default function StartPage() {
  const ready = useIsClient();
  const acknowledged = ready && hasAcknowledgedDisclaimer();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-teal-600">
        {BRAND.product} · {BRAND.feature}
      </p>
      <h1 className="text-3xl font-bold text-navy-900">Guided intake</h1>
      <p className="mt-2 text-navy-500">
        You do not need perfect answers yet. Answer a few plain-language questions
        about your idea — there are no wrong answers. This is about organizing
        what you already know.
      </p>

      <div className="mt-8">
        {!ready ? (
          <Card>
            <p className="text-sm text-navy-500">Loading…</p>
          </Card>
        ) : acknowledged ? (
          <Suspense fallback={<Card><p className="text-sm text-navy-500">Loading intake…</p></Card>}>
            <IntakeForm />
          </Suspense>
        ) : (
          <Card>
            <h2 className="text-lg font-semibold text-navy-900">
              Please review the disclaimer first
            </h2>
            <p className="mt-2 text-sm text-navy-600">
              Before starting the intake, we need you to acknowledge that{" "}
              {BRAND.product} is an educational readiness tool and does not
              provide legal advice.
            </p>
            <Link
              href="/smartprobonoip/disclaimer"
              className="mt-4 inline-block rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700"
            >
              Read & acknowledge the disclaimer
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
