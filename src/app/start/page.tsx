"use client";

import Link from "next/link";
import { Suspense } from "react";
import { IntakeForm } from "@/components/intake/IntakeForm";
import { DossierPageHeader } from "@/components/ui/design";
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
      <DossierPageHeader
        narrow
        kicker={INTAKE_COPY.builderTitle}
        title="Tell us about your idea"
        lead={`${INTAKE_COPY.intro} ${INTAKE_COPY.introDetail}`}
        meta={BRAND.coreMessage}
      />

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
            <Link href="/disclaimer" className="btn-primary mt-6">
              Read & acknowledge the disclaimer
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
