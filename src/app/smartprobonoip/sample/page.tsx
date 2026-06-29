"use client";

import { useState } from "react";
import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { ProfileView } from "@/components/profile/ProfileView";
import { CoachPreview } from "@/components/pilot/CoachPreview";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { AttorneyExportModal } from "@/components/profile/AttorneyExportModal";
import { DossierPageHeader, PaperCard, StampLabel } from "@/components/ui/design";
import { downloadPacketPdf } from "@/lib/pdf";
import { getIdeaLabel } from "@/lib/packet";
import { PILOT_KIT_COPY } from "@/lib/copy";
import { trackEvent } from "@/lib/analytics/client";
import { SAMPLE_RECORD } from "@/lib/samplePacket";

export default function SamplePacketPage() {
  const ideaLabel = getIdeaLabel(SAMPLE_RECORD.answers);
  const [attorneyExportOpen, setAttorneyExportOpen] = useState(false);

  return (
    <div className="pb-16">
      <PageEvent event="sample_packet_viewed" />
      <div className="border-b border-dashed border-warm-200/80 bg-cream">
        <div className="page-shell-packet py-4">
          <p className="text-sm leading-relaxed text-navy-700">
            {PILOT_KIT_COPY.sampleBanner}
          </p>
          <Link href="/smartprobonoip/pilot" className="btn-ghost mt-2 px-0">
            View pilot demo kit →
          </Link>
        </div>
      </div>

      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="warm">SAMPLE PACKET</StampLabel>
            <StampLabel tone="teal">IP READINESS</StampLabel>
            <StampLabel tone="navy">PREPARATION ONLY</StampLabel>
          </>
        }
        kicker="IP Readiness Packet"
        title={ideaLabel}
        lead={SAMPLE_RECORD.profile.ideaSummary}
        meta="Fictional demo example · HydroSeal · preparation only, not legal advice"
        aside={
          <PaperCard className="p-5">
            <p className="section-kicker text-muted-blue">Demo handoff</p>
            <p className="mt-2 text-sm leading-relaxed text-navy-700">
              Download this sample PDF to show partners what an IP Readiness
              Packet looks like.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setAttorneyExportOpen(true)}
                className="btn-secondary w-full sm:w-auto"
              >
                Export for Attorney
              </button>
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
          </PaperCard>
        }
      />

      <div className="page-shell-packet mt-8 space-y-8">
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
