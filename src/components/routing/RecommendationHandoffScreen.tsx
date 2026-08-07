"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrganizationShareConsent } from "@/components/organization/OrganizationShareConsent";
import { Card, CardHeader } from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics/client";
import {
  buildHandoffContent,
  HANDOFF_SHARED_INFO_COPY,
  type RoutingRecommendation,
} from "@/lib/routing";
import { ROUTES } from "@/lib/routes";

interface OrgShareLookup {
  organizationId: string;
  organizationName: string;
  shareEnabled: boolean;
}

export function RecommendationHandoffScreen({
  projectId,
  recommendation,
}: {
  projectId: string;
  recommendation: RoutingRecommendation;
}) {
  const handoff = buildHandoffContent(recommendation, projectId);
  const [confirmed, setConfirmed] = useState(false);
  const [orgShare, setOrgShare] = useState<OrgShareLookup | null>(null);

  useEffect(() => {
    trackEvent("recommendation_handoff_viewed", {
      projectId,
      metadata: {
        recommendationId: recommendation.id,
        category: recommendation.category,
        ...(recommendation.partnerId
          ? { partnerId: recommendation.partnerId }
          : {}),
      },
    });
  }, [projectId, recommendation]);

  useEffect(() => {
    if (!recommendation.partnerId) return;
    fetch(
      `/api/organization/lookup?registryPartnerId=${encodeURIComponent(recommendation.partnerId)}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.shareEnabled && data.organization?.id) {
          setOrgShare({
            organizationId: data.organization.id,
            organizationName: data.organization.name,
            shareEnabled: true,
          });
        }
      })
      .catch(() => undefined);
  }, [recommendation.partnerId]);

  if (!handoff) {
    return (
      <Card variant="elevated">
        <CardHeader
          title="Handoff unavailable"
          subtitle="This recommendation could not be loaded. Return to your packet to choose another step."
        />
        <Link href={ROUTES.profile(projectId)} className="link-brand text-sm font-semibold">
          Back to packet →
        </Link>
      </Card>
    );
  }

  const unavailable = handoff.partnerStatus === "unavailable";

  function handleContinue() {
    if (!handoff) return;
    trackEvent("recommendation_handoff_confirmed", {
      projectId,
      metadata: {
        recommendationId: recommendation.id,
        category: recommendation.category,
        ...(recommendation.partnerId
          ? { partnerId: recommendation.partnerId }
          : {}),
      },
    });
    trackEvent("recommendation_clicked", {
      projectId,
      metadata: {
        recommendationId: recommendation.id,
        category: recommendation.category,
        ...(recommendation.partnerId
          ? { partnerId: recommendation.partnerId }
          : {}),
      },
    });
    window.open(handoff.destinationUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
    <Card variant="elevated" className="border-teal-200/80 bg-white">
      <CardHeader
        title={`Before you visit ${handoff.partnerName}`}
        subtitle="Review what this partner may help with — starting points only, not legal advice."
      />

      <div className="space-y-5 text-sm leading-relaxed text-navy-700">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            Why this is recommended
          </h3>
          <p className="mt-1.5">{handoff.whyRecommended}</p>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            What they may help with
          </h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            {handoff.helpsWith.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            What they do not do
          </h3>
          <p className="mt-1.5">{handoff.doesNotDo}</p>
        </section>

        {handoff.jurisdictions.length > 0 ? (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              Jurisdiction notes
            </h3>
            <p className="mt-1.5">{handoff.jurisdictions.join(" · ")}</p>
          </section>
        ) : null}

        {handoff.eligibilityNotes ? (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              Eligibility notes
            </h3>
            <p className="mt-1.5">{handoff.eligibilityNotes}</p>
          </section>
        ) : null}

        {handoff.statusReason ? (
          <p className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
            {handoff.statusReason}
          </p>
        ) : null}

        <section className="rounded-xl border border-mist-200/80 bg-mist-50/50 px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            What information is shared
          </h3>
          <p className="mt-1.5 text-navy-600">{HANDOFF_SHARED_INFO_COPY}</p>
        </section>

        {!unavailable ? (
          <label className="flex items-start gap-2 text-sm text-navy-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            <span>
              I understand I am leaving SmartProBonoIP to visit an external
              resource. No invention details will be sent automatically.
            </span>
          </label>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!unavailable ? (
          <button
            type="button"
            disabled={!confirmed}
            onClick={handleContinue}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to {handoff.partnerName} ↗
          </button>
        ) : null}
        <Link
          href={ROUTES.profile(projectId)}
          className="text-sm font-semibold text-navy-600 underline-offset-2 hover:underline"
        >
          Back to packet
        </Link>
      </div>
    </Card>

    {orgShare ? (
      <OrganizationShareConsent
        projectId={projectId}
        target={{
          organizationId: orgShare.organizationId,
          organizationName: orgShare.organizationName,
          registryPartnerId: recommendation.partnerId ?? undefined,
          recommendationId: recommendation.id,
          referralReason: handoff?.whyRecommended,
        }}
      />
    ) : null}
    </div>
  );
}
