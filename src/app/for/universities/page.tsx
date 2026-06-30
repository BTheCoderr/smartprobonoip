import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { PartnerInterestLink } from "@/components/analytics/PartnerInterestLink";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { FOR_UNIVERSITIES_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";
import {
  DossierPageHeader,
  PaperShell,
  Section,
  SectionHeader,
  StampLabel,
} from "@/components/ui/design";

export const metadata = {
  title: "For Universities & Hubs — SmartProBonoIP",
  description: "Prepare founders before PTRC, clinic, or mentor referrals.",
};

export default function ForUniversitiesPage() {
  return (
    <div>
      <PageEvent event="professionals_page_viewed" />

      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">FOR UNIVERSITIES</StampLabel>
            <StampLabel tone="aqua">PREPARATION ONLY</StampLabel>
          </>
        }
        kicker={FOR_UNIVERSITIES_COPY.subtitle}
        title={FOR_UNIVERSITIES_COPY.title}
        lead={FOR_UNIVERSITIES_COPY.lead}
        aside={
          <div className="flex flex-col gap-3">
            <Link href={ROUTES.sample} className="btn-primary">
              View sample packet
            </Link>
            <Link href={ROUTES.pilot} className="btn-secondary">
              Pilot kit
            </Link>
            <Link href={ROUTES.learn} className="btn-ghost px-0">
              Learn module for inventors →
            </Link>
          </div>
        }
      />

      <Section>
        <PaperShell>
          <SectionHeader kicker="Problem" title="Common gaps before first referrals" />
          <ul className="mt-6 space-y-2 text-sm text-navy-700">
            {FOR_UNIVERSITIES_COPY.problems.map((p) => (
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
          <SectionHeader kicker="What programs receive" title="Structured readiness handoff" />
          <ul className="mt-6 space-y-2 text-sm text-navy-700">
            {FOR_UNIVERSITIES_COPY.receives.map((item) => (
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
          <SectionHeader kicker="Pilot workflow" title="How hubs use SmartProBonoIP" />
          <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm text-navy-700">
            {FOR_UNIVERSITIES_COPY.pilotSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <PartnerInterestLink
              href={ROUTES.contact}
              ctaName="Request pilot conversation"
              pageSection="universities_pilot"
              className="btn-primary"
            >
              Request pilot conversation
            </PartnerInterestLink>
            <Link href={ROUTES.trust} className="btn-ghost">
              Trust Center
            </Link>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell className="pb-8">
          <p className="text-sm text-navy-600">{FOR_UNIVERSITIES_COPY.doesNotDo}</p>
          <DisclaimerNotice />
        </PaperShell>
      </Section>
    </div>
  );
}
