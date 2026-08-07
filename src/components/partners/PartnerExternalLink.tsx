"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { getPublicPartnerById, HANDOFF_SHARED_INFO_COPY } from "@/lib/routing";
import { PARTNER_DIRECTORY_COPY } from "@/lib/copy";

export function PartnerExternalLink({
  partnerId,
  label,
}: {
  partnerId: string;
  label?: string;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const partner = getPublicPartnerById(partnerId);
  if (!partner) return null;

  const { id, orgType, buildDestination } = partner;
  const destinationUrl = buildDestination({
    utmCampaign: `partner_directory_${id}`,
  });

  function handleContinue() {
    trackEvent("partner_external_link_clicked", {
      metadata: {
        partnerId: id,
        organizationType: orgType,
      },
    });
    window.open(destinationUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-mist-200/80 bg-mist-50/50 px-4 py-3 text-sm text-navy-600">
        <p>{HANDOFF_SHARED_INFO_COPY}</p>
      </section>

      <label className="flex items-start gap-2 text-sm text-navy-700">
        <input
          type="checkbox"
          className="mt-1"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        <span>{PARTNER_DIRECTORY_COPY.externalLinkConfirm}</span>
      </label>

      <button
        type="button"
        disabled={!confirmed}
        onClick={handleContinue}
        className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label ?? `${PARTNER_DIRECTORY_COPY.officialDestination} ↗`}
      </button>
    </div>
  );
}
