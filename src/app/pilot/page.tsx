import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { CopyTextButton } from "@/components/pilot/CopyTextButton";
import { BRAND } from "@/lib/brand";
import { formatPilotHandoutText, PILOT_KIT_COPY, INSTITUTIONAL_WORKFLOW_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";
import { appPath } from "@/lib/appUrl";
import { appendTrackingQuery } from "@/lib/partnerTracking";
import {
  CalloutCard,
  DossierPageHeader,
  InlineDisclaimer,
  PaperShell,
  Section,
  SectionHeader,
  StampLabel,
  ValueCard,
} from "@/components/ui/design";
import { SearchPrepHomePreview } from "@/components/ui/FeaturedGooglePatentsCard";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { InterestForm } from "@/components/contact/InterestForm";
import { PartnerInterestLink } from "@/components/analytics/PartnerInterestLink";

function trackedLinks(
  links: readonly {
    label: string;
    path: string;
    query: Record<string, string | undefined>;
  }[],
) {
  return links.map((link) => {
    const path = appendTrackingQuery(
      link.path,
      link.query as Record<string, string | undefined>,
    );
    return { ...link, url: appPath(path) };
  });
}

export default function PilotKitPage() {
  const launchLinks = trackedLinks(PILOT_KIT_COPY.launchQrLinks);
  const handoutText = formatPilotHandoutText();

  return (
    <div>
      <PageEvent event="pilot_page_viewed" />

      <DossierPageHeader
        stamps={<StampLabel tone="teal">RHODE ISLAND PILOT LAUNCH</StampLabel>}
        kicker={PILOT_KIT_COPY.subtitle}
        title={PILOT_KIT_COPY.title}
        lead={PILOT_KIT_COPY.lead}
        aside={
          <div className="flex flex-wrap gap-3 lg:flex-col">
            <Link href={ROUTES.sample} className="btn-primary">
              View sample packet
            </Link>
            <PartnerInterestLink
              href={`${ROUTES.disclaimer}?partner=smartprobonoip-ri-pilot&source=qr&campaign=pilot-2026`}
              ctaName="Start RI pilot intake"
              pageSection="pilot_hero"
              className="btn-secondary w-full"
            >
              Start RI pilot intake
            </PartnerInterestLink>
            <Link href={ROUTES.playbook} className="btn-secondary">
              Partner playbook
            </Link>
            <Link href={ROUTES.pilotTracker} className="btn-secondary">
              Pilot tracker (local)
            </Link>
            <Link href={ROUTES.dashboardDemo} className="btn-ghost px-0">
              Partner Impact Desk →
            </Link>
            <Link href={ROUTES.trust} className="btn-ghost px-0">
              Trust Center →
            </Link>
            <Link href={ROUTES.learn} className="btn-ghost px-0">
              Learn IP basics →
            </Link>
            <Link href={ROUTES.forProfessionals} className="btn-ghost px-0">
              For professionals →
            </Link>
          </div>
        }
      />

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Similar reference prep"
            title="Patent & similar-reference search prep"
            lead={PILOT_KIT_COPY.similarReferencePrepBlurb}
          />
          <div className="mt-8">
            <SearchPrepHomePreview />
          </div>
          <p className="mt-4">
            <InlineDisclaimer>
              Preparation only — not a patentability or clearance opinion.
            </InlineDisclaimer>
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/smartprobonoip/sample#similar-reference-search-prep" className="btn-primary w-full sm:w-auto">
              View sample workspace
            </Link>
            <Link href="/for-professionals" className="btn-secondary w-full sm:w-auto">
              Export schema for professionals
            </Link>
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker={INSTITUTIONAL_WORKFLOW_COPY.title}
            title="Partner workflow in v1.0 pilots"
            lead={INSTITUTIONAL_WORKFLOW_COPY.lead}
          />
          <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm text-navy-700">
            {INSTITUTIONAL_WORKFLOW_COPY.steps.map((step) => (
              <li key={step.title}>
                <span className="font-semibold text-navy-900">{step.title}.</span>{" "}
                {step.body}
              </li>
            ))}
          </ol>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Similar reference prep"
            title="Patent & similar-reference search prep"
            lead={PILOT_KIT_COPY.similarReferencePrepBlurb}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ROUTES.sampleSimilarRef} className="btn-primary">
              View sample workspace
            </Link>
            <Link href={ROUTES.forProfessionals} className="btn-secondary">
              Export schema for professionals
            </Link>
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="What it is"
            title="IP Readiness Packets — preparation only"
          />
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-navy-700">
            {PILOT_KIT_COPY.whatItIs}
          </p>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader kicker="Who it helps" title="Built for overlooked innovators" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PILOT_KIT_COPY.whoItHelps.map((item) => (
              <li
                key={item}
                className="paper-card px-4 py-4 text-sm leading-relaxed text-navy-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Rhode Island pilot"
            title="How the 10–25 user pilot works"
            lead={PILOT_KIT_COPY.pilotPitch}
          />
          <ol className="mt-10 grid gap-5 sm:grid-cols-2">
            {PILOT_KIT_COPY.howPilotWorks.map((step, i) => (
              <li key={step.title}>
                <ValueCard
                  icon={i + 1}
                  title={`${i + 1}. ${step.title}`}
                  body={step.body}
                />
              </li>
            ))}
          </ol>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Partner value"
            title="What partners get"
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PILOT_KIT_COPY.partnerValue.map((item) => (
              <li
                key={item}
                className="paper-card px-4 py-4 text-sm leading-relaxed text-navy-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Pilot measurement"
            title={PILOT_KIT_COPY.pilotMetrics.title}
            lead={PILOT_KIT_COPY.pilotMetrics.lead}
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PILOT_KIT_COPY.pilotMetrics.items.map((item) => (
              <li
                key={item}
                className="paper-card px-4 py-4 text-sm leading-relaxed text-navy-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="2-minute demo"
            title="Demo walkthrough guide"
            lead="Preparation only — not legal advice and not a legal conclusion."
          />
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PILOT_KIT_COPY.demoWalkthrough.map((step, i) => (
              <li key={step.title}>
                <ValueCard
                  icon={i + 1}
                  title={`Step ${i + 1}: ${step.title}`}
                  body={step.body}
                />
                <Link
                  href={step.href}
                  className="btn-ghost mt-3 inline-flex text-teal-700"
                >
                  Open →
                </Link>
              </li>
            ))}
          </ol>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Partner handout"
            title="One-page copy for flyers and email"
            lead="Print this section or copy the text for partner outreach."
          />
          <div className="paper-card mt-8 space-y-4 px-6 py-6 text-sm leading-relaxed text-navy-700">
            <h3 className="text-lg font-semibold text-navy-900">
              {PILOT_KIT_COPY.handout.title}
            </h3>
            <p>{PILOT_KIT_COPY.handout.coreLine}</p>
            <p>
              <strong>Pilot ask:</strong> {PILOT_KIT_COPY.handout.pilotAsk}
            </p>
            <div>
              <p className="font-semibold text-navy-900">Partner value</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {PILOT_KIT_COPY.handout.partnerValue.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-navy-500">{PILOT_KIT_COPY.handout.safety}</p>
          </div>
          <div className="mt-4">
            <CopyTextButton text={handoutText} label="Copy handout text" />
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="QR-ready links"
            title="Tracked pilot links"
            lead="Use on flyers, QR codes, and partner handouts. Partner and campaign params are stored with new packets."
          />
          <ul className="mt-8 space-y-3">
            {launchLinks.map((link) => (
              <li
                key={link.label}
                className="paper-card flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-semibold text-navy-900">
                  {link.label}
                </span>
                <a
                  href={link.url}
                  className="break-all font-mono text-xs text-teal-700 hover:underline"
                >
                  {link.url}
                </a>
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Outreach"
            title="Short messages for partners"
            lead="Simple ask: a working pilot, feedback welcome, and 10–25 test users."
          />
          <ul className="mt-8 space-y-6">
            {PILOT_KIT_COPY.outreach.map((item) => (
              <li key={item.audience} className="paper-card px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                  {item.audience}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-navy-700">
                  {item.message}
                </p>
                <div className="mt-4">
                  <CopyTextButton
                    text={item.message}
                    label={`Copy message`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Recovery"
            title="Private packet access"
            lead={PILOT_KIT_COPY.recoveryNote}
          />
          <Link href={ROUTES.recover} className="btn-secondary mt-6">
            Recover a packet
          </Link>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader kicker="Safety" title="What SmartProBonoIP is not" />
          <ul className="mt-6 space-y-2 text-sm leading-relaxed text-navy-700">
            {PILOT_KIT_COPY.safetyPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-teal-600">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell className="pb-8">
          <InterestForm />
          <CalloutCard
            tone="aqua"
            title={`About ${BRAND.product}`}
            body="Signals and suggestions may be relevant starting points for your next conversation. A professional may want to review the details with you. This is preparation only — not legal advice."
          />
          <div className="mt-8">
            <DisclaimerNotice />
          </div>
        </PaperShell>
      </Section>
    </div>
  );
}
