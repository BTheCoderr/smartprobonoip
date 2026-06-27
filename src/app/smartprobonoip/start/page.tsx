"use client";

import Link from "next/link";
import { Suspense } from "react";
import { IntakeForm } from "@/components/intake/IntakeForm";
import { Card } from "@/components/ui/Card";
import { hasAcknowledgedDisclaimer } from "@/lib/ack";
import { useIsClient } from "@/lib/useIsClient";
import { BRAND } from "@/lib/brand";
import { INTAKE_COPY } from "@/lib/copy";

export default function StartPage() {
  const ready = useIsClient();
  const acknowledged = ready && hasAcknowledgedDisclaimer();

  return (
    <div className="pb-24 sm:pb-12">
      <div className="border-b border-mist-200/80 bg-gradient-to-b from-white to-surface">
        <div className="page-shell-narrow py-12 sm:py-14">
          <p className="section-kicker">
            {BRAND.product} · Guided intake
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Tell us about your idea
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-600">
            {INTAKE_COPY.intro} {INTAKE_COPY.introDetail}
          </p>
          <p className="mt-3 text-sm italic text-navy-500">
            {BRAND.coreMessage}
          </p>
        </div>
      </div>

      <div className="page-shell-narrow mt-8">
        {!ready ? (
          <Card>
            <p className="text-sm text-navy-500">Loading…</p>
          </Card>
        ) : acknowledged ? (
          <Suspense
            fallback={
              <Card>
                <p className="text-sm text-navy-500">Loading intake…</p>
              </Card>
            }
          >
            <IntakeForm />
          </Suspense>
        ) : (
          <Card variant="elevated">
            <h2 className="text-xl font-semibold text-navy-900">
              Please review the disclaimer first
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">
              Before starting the intake, we need you to acknowledge that{" "}
              {BRAND.product} is an educational readiness tool and does not
              provide legal advice.
            </p>
            <Link href="/smartprobonoip/disclaimer" className="btn-primary mt-6">
              Read & acknowledge the disclaimer
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
