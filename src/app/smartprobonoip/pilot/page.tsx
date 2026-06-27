import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PILOT_KIT_COPY } from "@/lib/copy";
import { appPath } from "@/lib/appUrl";
import {
  CalloutCard,
  PageShell,
  Section,
  SectionHeader,
  StampLabel,
  ValueCard,
} from "@/components/ui/design";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";

export default function PilotKitPage() {
  const qrLinks = PILOT_KIT_COPY.qrLinks.map((link) => ({
    ...link,
    url: appPath(link.path),
  }));

  return (
    <div>
      <Section className="paper-grid border-b border-mist-200/70 !py-12 sm:!py-16">
        <PageShell>
          <StampLabel tone="teal">PILOT DEMO KIT</StampLabel>
          <h1 className="headline-editorial mt-6 text-3xl sm:text-4xl lg:text-5xl">
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
              href="/smartprobonoip/disclaimer?demo=1"
              className="btn-secondary"
            >
              Start demo intake
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
            kicker="How to demo"
            title="What to show in about 2 minutes"
            lead="Preparation only — not legal advice and not a legal conclusion."
          />
          <ol className="mt-10 grid gap-5 sm:grid-cols-2">
            {PILOT_KIT_COPY.demoSteps.map((step, i) => (
              <li key={step.title}>
                <ValueCard
                  icon={i + 1}
                  title={`${i + 1}. ${step.title}`}
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

      <Section soft>
        <PageShell>
          <SectionHeader
            kicker="Rhode Island pilot"
            title="Partner value"
            lead={PILOT_KIT_COPY.pilotPitch}
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
            kicker="Recovery"
            title="Private packet access"
            lead={PILOT_KIT_COPY.recoveryNote}
          />
          <Link href="/smartprobonoip/recover" className="btn-secondary mt-6">
            Recover a packet
          </Link>
        </PageShell>
      </Section>

      <Section soft>
        <PageShell>
          <SectionHeader
            kicker="QR-ready links"
            title="Share these URLs at events and partner meetings"
          />
          <ul className="mt-8 space-y-3">
            {qrLinks.map((link) => (
              <li
                key={link.path}
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
