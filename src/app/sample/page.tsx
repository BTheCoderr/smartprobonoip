"use client";

import { useState } from "react";
import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { TrackedNavLink } from "@/components/analytics/TrackedNavLink";
import { ProfileView } from "@/components/profile/ProfileView";
import { CoachPreview } from "@/components/pilot/CoachPreview";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { AttorneyExportModal } from "@/components/profile/AttorneyExportModal";
import {
  DossierPageHeader,
  InlineDisclaimer,
  PaperCard,
  StampLabel,
} from "@/components/ui/design";
import { downloadPacketPdf } from "@/lib/pdf";
import { getIdeaLabel } from "@/lib/packet";
import { EXPORT_HANDOFF_COPY, PILOT_KIT_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics/client";
import { SAMPLE_RECORD } from "@/lib/samplePacket";

export default function SamplePacketPage() {
  const ideaLabel = getIdeaLabel(SAMPLE_RECORD.answers);
  const [attorneyExportOpen, setAttorneyExportOpen] = useState(false);

  return (
    <div className="pb-20 sm:pb-16">
      <PageEvent event="sample_packet_viewed" />
      <div className="border-b border-dashed border-aqua-200/80 bg-cream">
        <div className="page-shell-packet py-4 sm:py-5">
          <p className="text-sm leading-relaxed text-navy-700">
            {PILOT_KIT_COPY.sampleBanner}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Link href={ROUTES.pilot} className="btn-ghost px-0">
              View pilot demo kit →
            </Link>
            <InlineDisclaimer>
              Fictional HydroSeal example — preparation only, not legal advice.
            </InlineDisclaimer>
          </div>
        </div>
      </div>

      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="aqua">SAMPLE PACKET</StampLabel>
            <StampLabel tone="teal">IP READINESS</StampLabel>
            <StampLabel tone="navy">PREPARATION ONLY</StampLabel>
          </>
        }
        kicker="IP Readiness Packet"
        title={ideaLabel}
        lead={SAMPLE_RECORD.profile.ideaSummary}
        meta="Fictional demo · HydroSeal portable filter bottle"
        aside={
          <PaperCard elevated className="p-5 sm:p-6">
            <p className="section-kicker text-muted-blue">Start from this sample</p>
            <p className="mt-2 text-sm leading-relaxed text-navy-700">
              See how an organized readiness packet looks, then start the builder
              with this example or with your own idea.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <TrackedNavLink
                href={ROUTES.disclaimerDemo}
                event="demo_started"
                metadata={{ ctaName: "sample_start_example", pageSection: "sample_aside" }}
                className="btn-primary w-full sm:w-auto"
              >
                {PILOT_KIT_COPY.sampleStartCta}
              </TrackedNavLink>
              <p className="text-xs leading-relaxed text-navy-600">
                {PILOT_KIT_COPY.sampleStartHint}
              </p>
              <TrackedNavLink
                href={ROUTES.disclaimer}
                event="start_clicked"
                metadata={{ ctaName: "sample_start_own", pageSection: "sample_aside" }}
                className="btn-secondary w-full sm:w-auto"
              >
                {PILOT_KIT_COPY.sampleStartOwnCta}
              </TrackedNavLink>
              <p className="text-xs leading-relaxed text-navy-600">
                {PILOT_KIT_COPY.sampleStartOwnHint}
              </p>
              <button
                type="button"
                onClick={() => {
                  downloadPacketPdf(SAMPLE_RECORD);
                  trackEvent("sample_pdf_downloaded", {
                    metadata: { pdfDownloaded: true, demo: true },
                  });
                }}
                className="btn-primary w-full sm:w-auto"
              >
                {EXPORT_HANDOFF_COPY.pdfLabel}
              </button>
              <button
                type="button"
                onClick={() => setAttorneyExportOpen(true)}
                className="btn-secondary w-full sm:w-auto"
              >
                {EXPORT_HANDOFF_COPY.jsonLabel}
              </button>
            </div>
          </PaperCard>
        }
      />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-mist-200 bg-white/95 p-3 shadow-[0_-4px_24px_rgb(11_31_58_/_0.08)] backdrop-blur-sm sm:hidden">
        <div className="flex gap-2">
          <TrackedNavLink
            href={ROUTES.disclaimerDemo}
            event="demo_started"
            metadata={{ ctaName: "sample_start_example", pageSection: "sample_mobile_bar" }}
            className="btn-primary flex-1 py-2.5 text-xs"
          >
            Start example
          </TrackedNavLink>
          <TrackedNavLink
            href={ROUTES.disclaimer}
            event="start_clicked"
            metadata={{ ctaName: "sample_start_own", pageSection: "sample_mobile_bar" }}
            className="btn-secondary flex-1 py-2.5 text-xs"
          >
            Your packet
          </TrackedNavLink>
          <button
            type="button"
            onClick={() => {
              downloadPacketPdf(SAMPLE_RECORD);
              trackEvent("sample_pdf_downloaded", {
                metadata: { pdfDownloaded: true, demo: true },
              });
            }}
            className="btn-primary flex-1 py-2.5 text-xs"
          >
            PDF
          </button>
        </div>
      </div>

      <div className="page-shell-packet mt-8 space-y-8 sm:mt-10">
        <ProfileView record={SAMPLE_RECORD} />
        <CoachPreview />
        <DisclaimerNotice />
      </div>

      {attorneyExportOpen ? (
        <AttorneyExportModal
          record={SAMPLE_RECORD}
          savedReferences={[]}
          onClose={() => setAttorneyExportOpen(false)}
        />
      ) : null}
    </div>
  );
}
