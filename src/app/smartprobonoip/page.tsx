import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { TrackedNavLink } from "@/components/analytics/TrackedNavLink";
import { BRAND } from "@/lib/brand";
import { LANDING_COPY, RESEARCH_PREP_COPY } from "@/lib/copy";
import {
  CalloutCard,
  CreativeHeroSection,
  DossierCard,
  HowItWorksStep,
  PaperShell,
  ProductFeatureMock,
  Section,
  SectionHeader,
} from "@/components/ui/design";
import { PartnerInterestLink } from "@/components/analytics/PartnerInterestLink";

export default function ProductLanding() {
  return (
    <div>
      <PageEvent event="landing_viewed" />
      <CreativeHeroSection
        stamp={LANDING_COPY.heroStamp}
        title={BRAND.tagline}
        lead={BRAND.positioning}
        safetyLine={LANDING_COPY.heroSafety}
      >
        <div className="flex flex-wrap gap-3">
          <TrackedNavLink
            href="/smartprobonoip/disclaimer"
            event="start_clicked"
            className="btn-primary"
          >
            {LANDING_COPY.ctaPrimary}
          </TrackedNavLink>
          <TrackedNavLink
            href="/smartprobonoip/sample"
            event="sample_packet_viewed"
            className="btn-secondary"
          >
            {LANDING_COPY.ctaSample}
          </TrackedNavLink>
          <Link href="#how-it-works" className="btn-ghost">
            {LANDING_COPY.ctaHowItWorks}
          </Link>
        </div>
      </CreativeHeroSection>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="See the product"
            title="What you get before expert review"
            lead="Example views from the IP Readiness Packet workflow — preparation only, not legal advice."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_COPY.productProof.map((item, i) => (
              <ProductFeatureMock
                key={item.title}
                index={i}
                title={item.title}
                body={item.body}
                previewLines={item.previewLines}
              />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <TrackedNavLink
              href="/smartprobonoip/sample"
              event="sample_packet_viewed"
              className="btn-secondary"
            >
              {LANDING_COPY.ctaSample}
            </TrackedNavLink>
            <TrackedNavLink
              href="/smartprobonoip/disclaimer?demo=1"
              event="demo_started"
              className="btn-ghost"
            >
              Try demo intake
            </TrackedNavLink>
          </div>
        </PaperShell>
      </Section>

      <Section id="how-it-works">
        <PaperShell>
          <SectionHeader
            kicker="How it works"
            title="From messy idea to organized handoff"
            lead="Four steps to prepare for expert review — not a legal conclusion."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {LANDING_COPY.howItWorks.map((step, i) => (
              <HowItWorksStep
                key={step.title}
                step={i + 1}
                title={step.title}
                body={step.body}
                showArrow={i < LANDING_COPY.howItWorks.length - 1}
              />
            ))}
          </div>
          <div className="mt-10">
            <TrackedNavLink
              href="/smartprobonoip/disclaimer"
              event="start_clicked"
              className="btn-primary"
            >
              {LANDING_COPY.ctaPrimary}
            </TrackedNavLink>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Similar reference prep"
            title={RESEARCH_PREP_COPY.similarReferenceSection.title}
            lead={RESEARCH_PREP_COPY.similarReferenceSection.lead}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <TrackedNavLink
              href="/smartprobonoip/sample#similar-reference-search-prep"
              event="sample_packet_viewed"
              className="btn-primary"
            >
              {LANDING_COPY.ctaSample}
            </TrackedNavLink>
            <Link href="/for-professionals" className="btn-secondary">
              View export schema
            </Link>
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="What the packet includes"
            title="Everything organized for your next conversation"
            lead="Preparation only — not legal advice and not a legal conclusion."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_COPY.whatYouGet.map((item, i) => (
              <DossierCard
                key={item.title}
                index={i}
                title={item.title}
                body={item.body}
              />
            ))}
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Who it helps"
            title="Built for inventors and the professionals who review them"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {LANDING_COPY.audienceCards.map((item, i) => (
              <DossierCard
                key={item.title}
                index={i}
                title={item.title}
                body={item.body}
              />
            ))}
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Trust & safety"
            title="Preparation only — with clear limits"
          />
          <ul className="mt-8 space-y-2 text-sm leading-relaxed text-navy-700">
            {LANDING_COPY.trustPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-teal-600">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <CalloutCard
              tone="warm"
              title="What this does not do"
              body={LANDING_COPY.whatWeDoNot}
            />
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader kicker="About" title="Built for overlooked innovators" />
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-navy-700">
            {LANDING_COPY.founder.bio}
          </p>
          <Link href="/about" className="btn-ghost mt-4 px-0">
            Learn more about the project →
          </Link>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Rhode Island pilot"
            title={LANDING_COPY.riPilotTeaser.title}
            lead={LANDING_COPY.riPilotTeaser.body}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/smartprobonoip/pilot" className="btn-secondary">
              {LANDING_COPY.riPilotTeaser.cta}
            </Link>
            <PartnerInterestLink
              href="/contact"
              ctaName="Request pilot conversation"
              pageSection="homepage_pilot"
              className="btn-ghost"
            >
              Request pilot conversation
            </PartnerInterestLink>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell className="pb-8 text-center">
          <SectionHeader
            kicker="Ready to start"
            title="Turn your idea into an organized readiness packet"
            lead="Free to start. Preparation only — not legal advice."
            center
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TrackedNavLink
              href="/smartprobonoip/disclaimer"
              event="start_clicked"
              className="btn-primary"
            >
              {LANDING_COPY.ctaPrimary}
            </TrackedNavLink>
            <TrackedNavLink
              href="/smartprobonoip/sample"
              event="sample_packet_viewed"
              className="btn-secondary"
            >
              {LANDING_COPY.ctaSample}
            </TrackedNavLink>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-xs leading-relaxed text-navy-500">
            {LANDING_COPY.footerDisclaimer}{" "}
            <Link href="/smartprobonoip/disclaimer" className="text-teal-700 hover:underline">
              Read full disclaimer
            </Link>
          </p>
        </PaperShell>
      </Section>
    </div>
  );
}
