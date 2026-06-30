import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { PartnerInterestLink } from "@/components/analytics/PartnerInterestLink";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { FOR_CLINICS_COPY, INSTITUTIONAL_WORKFLOW_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";
import {
  DossierPageHeader,
  PaperShell,
  Section,
  SectionHeader,
  StampLabel,
} from "@/components/ui/design";

export const metadata = {
  title: "For IP Clinics — SmartProBonoIP",
  description: "Cleaner inventor intake for IP clinics and pro bono programs.",
};

export default function ForClinicsPage() {
  return (
    <div>
      <PageEvent event="professionals_page_viewed" />

      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">FOR CLINICS</StampLabel>
            <StampLabel tone="warm">PREPARATION ONLY</StampLabel>
          </>
        }
        kicker={FOR_CLINICS_COPY.subtitle}
        title={FOR_CLINICS_COPY.title}
        lead={FOR_CLINICS_COPY.lead}
        aside={
          <div className="flex flex-col gap-3">
            <Link href={ROUTES.sample} className="btn-primary">
              View sample packet
            </Link>
            <Link href={ROUTES.pilot} className="btn-secondary">
              Pilot kit
            </Link>
            <PartnerInterestLink
              href={ROUTES.contact}
              ctaName="Request pilot conversation"
              pageSection="clinics_hero"
              className="btn-ghost px-0"
            >
              Request pilot conversation →
            </PartnerInterestLink>
          </div>
        }
      />

      <Section>
        <PaperShell>
          <SectionHeader kicker="Problem" title="What clinics often see today" />
          <ul className="mt-6 space-y-2 text-sm text-navy-700">
            {FOR_CLINICS_COPY.problems.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-navy-400">•</span>
                {p}
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader kicker="What you receive" title="Cleaner handoff materials" />
          <ul className="mt-6 space-y-2 text-sm text-navy-700">
            {FOR_CLINICS_COPY.receives.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-navy-500">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker={INSTITUTIONAL_WORKFLOW_COPY.title}
            title="Pilot workflow for clinics"
          />
          <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm text-navy-700">
            {FOR_CLINICS_COPY.pilotSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell className="pb-8">
          <p className="text-sm text-navy-600">{FOR_CLINICS_COPY.doesNotDo}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={ROUTES.trust} className="btn-secondary">
              Trust Center
            </Link>
            <Link href={ROUTES.forProfessionals} className="btn-ghost">
              All professionals
            </Link>
          </div>
          <div className="mt-8">
            <DisclaimerNotice />
          </div>
        </PaperShell>
      </Section>
    </div>
  );
}
