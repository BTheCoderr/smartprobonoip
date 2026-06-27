import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { CopyTextButton } from "@/components/pilot/CopyTextButton";
import { BRAND } from "@/lib/brand";
import { formatPilotHandoutText, PILOT_KIT_COPY } from "@/lib/copy";
import { appPath } from "@/lib/appUrl";
import { appendTrackingQuery } from "@/lib/partnerTracking";
import {
  CalloutCard,
  PageShell,
  Section,
  SectionHeader,
  StampLabel,
  ValueCard,
} from "@/components/ui/design";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";

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

      <Section className="paper-grid border-b border-mist-200/70 !py-12 sm:!py-16">
        <PageShell>
          <StampLabel tone="teal">RHODE ISLAND PILOT LAUNCH</StampLabel>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-teal-600">
            {PILOT_KIT_COPY.subtitle}
          </p>
          <h1 className="headline-editorial mt-3 text-3xl sm:text-4xl lg:text-5xl">
            {PILOT_KIT_COPY.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-blue">
            {PILOT_KIT_COPY.lead}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/smartprobonoip/sample" className="btn-primary">
              View sample packet
            </Link>
            <Link
              href="/smartprobonoip/disclaimer?partner=smartprobonoip-ri-pilot&source=qr&campaign=pilot-2026"
              className="btn-secondary"
            >
              Start RI pilot intake
            </Link>
            <Link href="/smartprobonoip/dashboard?demo=1" className="btn-ghost">
              Partner Impact Desk
            </Link>
          </div>
        </PageShell>
      </Section>

      <Section>
        <PageShell>
          <SectionHeader
            kicker="What it is"
            title="IP Readiness Packets — preparation only"
          />
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-navy-700">
            {PILOT_KIT_COPY.whatItIs}
          </p>
        </PageShell>
      </Section>

      <Section soft>
        <PageShell>
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
        </PageShell>
      </Section>

      <Section>
        <PageShell>
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
        </PageShell>
      </Section>

      <Section soft>
        <PageShell>
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
        </PageShell>
      </Section>

      <Section>
        <PageShell>
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
        </PageShell>
      </Section>

      <Section soft>
        <PageShell>
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
        </PageShell>
      </Section>

      <Section>
        <PageShell>
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
        </PageShell>
      </Section>

      <Section soft>
        <PageShell>
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
        </PageShell>
      </Section>

      <Section>
        <PageShell>
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
        </PageShell>
      </Section>

      <Section soft>
        <PageShell>
          <SectionHeader
            kicker="Recovery"
            title="Private packet access"
            lead={PILOT_KIT_COPY.recoveryNote}
          />
          <Link href="/smartprobonoip/recover" className="btn-secondary mt-6">
            Recover a packet
          </Link>
        </PageShell>
      </Section>

      <Section>
        <PageShell>
          <SectionHeader kicker="Safety" title="What SmartProBonoIP is not" />
          <ul className="mt-6 space-y-2 text-sm leading-relaxed text-navy-700">
            {PILOT_KIT_COPY.safetyPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-teal-600">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </PageShell>
      </Section>

      <Section soft>
        <PageShell className="pb-8">
          <CalloutCard
            tone="warm"
            title={`About ${BRAND.product}`}
            body="Signals and suggestions may be relevant starting points for your next conversation. A professional may want to review the details with you. This is preparation only — not legal advice."
          />
          <div className="mt-8">
            <DisclaimerNotice />
          </div>
        </PageShell>
      </Section>
    </div>
  );
}
