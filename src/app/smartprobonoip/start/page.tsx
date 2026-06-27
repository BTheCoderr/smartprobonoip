"use client";

import Link from "next/link";
import { Suspense } from "react";
import { IntakeForm } from "@/components/intake/IntakeForm";
import { StampLabel } from "@/components/ui/design";
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
      <div className="paper-grid border-b border-mist-200/80">
        <div className="page-shell-narrow py-12 sm:py-14">
          <StampLabel tone="teal">IP READINESS</StampLabel>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-teal-600">
            {INTAKE_COPY.builderTitle}
          </p>
          <h1 className="headline-editorial mt-3 text-3xl sm:text-4xl">
            Tell us about your idea
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-blue">
            {INTAKE_COPY.intro} {INTAKE_COPY.introDetail}
          </p>
          <p className="mt-3 text-sm italic text-navy-600">
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
