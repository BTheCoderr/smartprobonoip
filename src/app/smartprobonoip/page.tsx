import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { TrackedNavLink } from "@/components/analytics/TrackedNavLink";
import { BRAND } from "@/lib/brand";
import { LANDING_COPY } from "@/lib/copy";
import {
  CalloutCard,
  CreativeHeroSection,
  MissionBand,
  PageShell,
  Section,
  SectionHeader,
  StampLabel,
  ValueCard,
} from "@/components/ui/design";
import { DemoChecklist } from "@/components/DemoChecklist";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";

export default function ProductLanding() {
  return (
    <div>
      <PageEvent event="landing_viewed" />
      <CreativeHeroSection
        stamp={LANDING_COPY.heroStamp}
        title={BRAND.tagline}
        lead={BRAND.positioning}
        mission={BRAND.coreMessage}
        safetyLine={LANDING_COPY.heroSafety}
      >
        <div className="flex flex-wrap gap-3">
          <TrackedNavLink
            href="/smartprobonoip/disclaimer"
            event="start_clicked"
            className="btn-primary"
          >
            Start your packet
          </TrackedNavLink>
          <TrackedNavLink
            href="/smartprobonoip/sample"
            event="sample_packet_viewed"
            className="btn-secondary"
          >
            View sample packet
          </TrackedNavLink>
        </div>
      </CreativeHeroSection>

      <Section>
        <PageShell>
          <SectionHeader
            kicker="Why this exists"
            title="The first step should not stop a good idea"
            lead={LANDING_COPY.whyExists}
          />
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-blue">
            {LANDING_COPY.whyExistsLead}
          </p>
        </PageShell>
      </Section>

      <Section soft>
        <PageShell>
          <SectionHeader
            kicker="What the packet helps you do"
            title="From messy idea to organized IP packet"
            lead="Preparation only — not legal advice and not a legal conclusion."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_COPY.packetHelps.map((item) => (
              <ValueCard key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </PageShell>
      </Section>

      <Section>
        <PageShell>
          <SectionHeader
            kicker="Who it helps"
            title="An IP readiness desk for overlooked innovators"
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_COPY.whoHelps.map((item) => (
              <li
                key={item}
                className="paper-card flex items-start gap-3 px-4 py-4 text-sm leading-relaxed text-navy-700"
              >
                <StampLabel tone="warm">ACCESS</StampLabel>
                <span className="flex-1 pt-0.5">{item}</span>
              </li>
            ))}
          </ul>
        </PageShell>
      </Section>

      <Section soft>
        <PageShell>
          <MissionBand quote={BRAND.coreMessage} body={BRAND.mission} />
        </PageShell>
      </Section>

      <Section>
        <PageShell>
          <CalloutCard
            tone="warm"
            title="What SmartProBonoIP does not do"
            body={LANDING_COPY.whatWeDoNot}
          />
        </PageShell>
      </Section>

      <Section navy>
        <PageShell>
          <SectionHeader
            light
            kicker="Partners & pilots"
            title="Community access to IP readiness"
            lead={LANDING_COPY.partnerCallout}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/smartprobonoip/pilot"
              className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Pilot demo kit
            </Link>
            <Link
              href="/smartprobonoip/dashboard"
              className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Open Partner Impact Desk
            </Link>
            <Link href="/smartprobonoip/start" className="btn-ghost text-navy-100 hover:bg-white/10">
              Start a packet →
            </Link>
          </div>
        </PageShell>
      </Section>

      <Section>
        <PageShell className="pb-8">
          <DemoChecklist />
          <div className="mt-8">
            <DisclaimerNotice />
          </div>
        </PageShell>
      </Section>
    </div>
  );
}
