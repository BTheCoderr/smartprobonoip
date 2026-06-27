"use client";

import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { ProfileView } from "@/components/profile/ProfileView";
import { CoachPreview } from "@/components/pilot/CoachPreview";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { StampLabel } from "@/components/ui/design";
import { downloadPacketPdf } from "@/lib/pdf";
import { getIdeaLabel } from "@/lib/packet";
import { PILOT_KIT_COPY } from "@/lib/copy";
import { trackEvent } from "@/lib/analytics/client";
import { SAMPLE_RECORD } from "@/lib/samplePacket";

export default function SamplePacketPage() {
  const ideaLabel = getIdeaLabel(SAMPLE_RECORD.answers);

  return (
    <div className="pb-16">
      <PageEvent event="sample_packet_viewed" />
      <div className="border-b border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-cream to-teal-50/40">
        <div className="page-shell-packet py-4">
          <p className="text-sm leading-relaxed text-navy-700">
            {PILOT_KIT_COPY.sampleBanner}
          </p>
          <Link href="/smartprobonoip/pilot" className="btn-ghost mt-2 px-0">
            View pilot demo kit →
          </Link>
        </div>
      </div>

      <div className="paper-grid border-b border-mist-200/80">
        <div className="page-shell-packet py-10 sm:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <StampLabel tone="warm">SAMPLE PACKET</StampLabel>
                <StampLabel tone="teal">IP READINESS</StampLabel>
                <StampLabel tone="navy">PREPARATION ONLY</StampLabel>
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-teal-600">
                IP Readiness Packet
              </p>
              <h1 className="headline-editorial mt-2 text-3xl sm:text-4xl">
                {ideaLabel}
              </h1>
              <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-blue">
                {SAMPLE_RECORD.profile.ideaSummary}
              </p>
              <p className="mt-4 text-xs text-navy-400">
                Fictional demo example · HydroSeal · preparation only, not legal
                advice
              </p>
            </div>
            <div className="paper-card shrink-0 p-5 lg:max-w-xs">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-blue">
                Demo handoff
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-700">
                Download this sample PDF to show partners what an IP Readiness
                Packet looks like.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
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
                  Download sample PDF
                </button>
                <Link
                  href="/smartprobonoip/disclaimer?demo=1"
                  className="btn-secondary w-full sm:w-auto"
                >
                  Try demo intake
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell-packet mt-8 space-y-8">
        <ProfileView record={SAMPLE_RECORD} />
        <CoachPreview />
        <DisclaimerNotice />
      </div>
    </div>
  );
}
