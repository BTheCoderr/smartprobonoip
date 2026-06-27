import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LANDING_COPY } from "@/lib/copy";
import {
  CalloutCard,
  HeroSection,
  MissionBand,
  PageShell,
  Section,
  SectionHeader,
  StepCard,
  ValueCard,
} from "@/components/ui/design";
import { DemoChecklist } from "@/components/DemoChecklist";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";

export default function ProductLanding() {
  return (
    <div>
      <HeroSection
        kicker={`${BRAND.product} · ${BRAND.feature}`}
        title={BRAND.tagline}
        lead={BRAND.positioning}
        mission={BRAND.coreMessage}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/smartprobonoip/disclaimer" className="btn-primary">
            Start your packet
          </Link>
          <Link
            href="/smartprobonoip/disclaimer?demo=1"
            className="btn-secondary"
          >
            View sample packet
          </Link>
          <Link href="/smartprobonoip/dashboard" className="btn-ghost">
            Partner dashboard
          </Link>
        </div>
      </HeroSection>

      <Section soft>
        <PageShell>
          <SectionHeader
            kicker="Why this exists"
            title="Access to IP should start with clarity, not confusion"
            lead={LANDING_COPY.whyExists}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {LANDING_COPY.valueCards.map((card, i) => (
              <ValueCard
                key={card.title}
                icon={i + 1}
                title={card.title}
                body={card.body}
              />
            ))}
          </div>
        </PageShell>
      </Section>

      <Section>
        <PageShell>
          <SectionHeader
            kicker="Who it helps"
            title="Built for people the IP system often overlooks"
            lead="If you have an idea but limited access to the first conversation, this is for you."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_COPY.whoHelps.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-mist-200/70 bg-white px-4 py-4 text-sm leading-relaxed text-navy-700 shadow-[var(--shadow-soft)]"
              >
                <span className="mt-0.5 text-teal-600" aria-hidden>
                  ✓
                </span>
                {item}
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
          <SectionHeader
            kicker="How it works"
            title="From messy notes to a packet you can bring with you"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LANDING_COPY.howItWorks.map((step, i) => (
              <StepCard key={step} step={i + 1} title={step} />
            ))}
          </div>
        </PageShell>
      </Section>

      <Section soft>
        <PageShell>
          <SectionHeader
            kicker="What you get"
            title="Your IP Readiness Packet includes"
            lead="Preparation only — not legal advice and not a legal conclusion."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_COPY.whatYouGet.map((item) => (
              <ValueCard key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </PageShell>
      </Section>

      <Section>
        <PageShell>
          <div className="grid gap-8 lg:grid-cols-2">
            <CalloutCard
              tone="warm"
              title="What SmartProBonoIP does not do"
              body={LANDING_COPY.whatWeDoNot.join(" ")}
            />
            <CalloutCard
              tone="teal"
              title="Safety first"
              body={LANDING_COPY.safetyLine}
            />
          </div>
        </PageShell>
      </Section>

      <Section navy>
        <PageShell>
          <SectionHeader
            light
            kicker="Partners & pilots"
            title="Support inventors before the first expert conversation"
            lead={LANDING_COPY.partnerCallout}
          />
          <div className="mt-8">
            <Link
              href="/smartprobonoip/dashboard"
              className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Open partner dashboard
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
