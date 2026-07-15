import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { TrackedNavLink } from "@/components/analytics/TrackedNavLink";
import { PartnerInterestLink } from "@/components/analytics/PartnerInterestLink";
import { SearchPrepHomePreview } from "@/components/ui/FeaturedGooglePatentsCard";
import { ProductProofPreview } from "@/components/ui/ProductProofPreview";
import { BRAND } from "@/lib/brand";
import { LANDING_COPY, RESEARCH_PREP_COPY } from "@/lib/copy";
import {
  CalloutCard,
  CreativeHeroSection,
  DossierCard,
  HowItWorksStep,
  InlineDisclaimer,
  PaperShell,
  ProductProofCard,
  Section,
  SectionHeader,
  TestimonialCard,
} from "@/components/ui/design";

export default function ProductLanding() {
  return (
    <div>
      <PageEvent event="landing_viewed" />
      <CreativeHeroSection
        stamp={LANDING_COPY.heroStamp}
        title={BRAND.tagline}
        lead={BRAND.positioning}
        safetyLine={LANDING_COPY.heroSafety}
        subcta={LANDING_COPY.heroSubcta}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <TrackedNavLink
            href="/smartprobonoip/disclaimer"
            event="start_clicked"
            className="btn-primary-lg w-full sm:w-auto"
          >
            {LANDING_COPY.ctaPrimary}
          </TrackedNavLink>
          <TrackedNavLink
            href="/smartprobonoip/sample"
            event="sample_packet_viewed"
            className="btn-secondary-lg w-full sm:w-auto"
          >
            {LANDING_COPY.ctaSample}
          </TrackedNavLink>
          <Link
            href="#how-it-works"
            className="btn-ghost w-full justify-center sm:w-auto"
          >
            {LANDING_COPY.ctaHowItWorks}
          </Link>
        </div>
      </CreativeHeroSection>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="See the product"
            title="What you get before expert review"
            lead="Interactive views from the IP Readiness Packet workflow."
          />
          <p className="mt-4 max-w-3xl">
            <InlineDisclaimer>
              Preparation only — not legal advice. These previews show organization
              tools, not legal conclusions.
            </InlineDisclaimer>
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy-600">
            {LANDING_COPY.productProofLead}
          </p>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {LANDING_COPY.productProof.map((item, i) => (
              <ProductProofCard
                key={item.title}
                index={i}
                title={item.title}
                body={item.body}
              >
                <ProductProofPreview variant={item.variant} />
              </ProductProofCard>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedNavLink
              href="/smartprobonoip/sample"
              event="sample_packet_viewed"
              className="btn-primary w-full sm:w-auto"
            >
              {LANDING_COPY.ctaSample}
            </TrackedNavLink>
            <TrackedNavLink
              href="/smartprobonoip/disclaimer?demo=1"
              event="demo_started"
              className="btn-secondary w-full sm:w-auto"
            >
              Start with HydroSeal example
            </TrackedNavLink>
          </div>
        </PaperShell>
      </Section>

      <Section id="how-it-works">
        <PaperShell>
          <SectionHeader
            kicker="How it works"
            title="From messy idea to organized handoff"
            lead="Four steps to prepare for expert review."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              className="btn-primary-lg w-full sm:w-auto"
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
          <div className="mt-8">
            <SearchPrepHomePreview />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedNavLink
              href="/smartprobonoip/sample#similar-reference-search-prep"
              event="sample_packet_viewed"
              className="btn-primary w-full sm:w-auto"
            >
              See it in the sample packet
            </TrackedNavLink>
            <Link href="/for-professionals" className="btn-secondary w-full sm:w-auto">
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
            lead="SmartProBonoIP is built for expert review, not to replace it."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {LANDING_COPY.trustQuotes.map((item) => (
              <TestimonialCard
                key={item.role}
                quote={item.quote}
                role={item.role}
                context={item.context}
              />
            ))}
          </div>
          <ul className="mt-8 grid gap-2 sm:grid-cols-2">
            {LANDING_COPY.trustPoints.map((point) => (
              <li
                key={point}
                className="flex gap-2 rounded-md border border-mist-200/80 bg-white px-4 py-3 text-sm leading-relaxed text-navy-700"
              >
                <span className="shrink-0 text-teal-600">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <CalloutCard
              tone="warm"
              title="What this does not do"
              body={LANDING_COPY.whatWeDoNot}
            />
            <div className="dossier-card flex flex-col justify-between px-5 py-5 sm:px-6 sm:py-6">
              <div>
                <p className="section-kicker text-teal-700">Rhode Island pilot</p>
                <h3 className="headline-editorial mt-2 text-xl text-navy-900">
                  {LANDING_COPY.riPilotTeaser.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {LANDING_COPY.riPilotTeaser.body}
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link href="/smartprobonoip/pilot" className="btn-secondary w-full sm:w-auto">
                  {LANDING_COPY.riPilotTeaser.cta}
                </Link>
                <PartnerInterestLink
                  href="/contact"
                  ctaName="Request pilot conversation"
                  pageSection="homepage_trust"
                  className="btn-ghost w-full justify-center sm:w-auto"
                >
                  Request conversation
                </PartnerInterestLink>
              </div>
            </div>
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
        <PaperShell className="pb-8 text-center">
          <SectionHeader
            kicker="Ready to start"
            title="Turn your idea into an organized readiness packet"
            lead="Free to start. Preparation only — not legal advice."
            center
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <TrackedNavLink
              href="/smartprobonoip/disclaimer"
              event="start_clicked"
              className="btn-primary-lg w-full sm:w-auto"
            >
              {LANDING_COPY.ctaPrimary}
            </TrackedNavLink>
            <TrackedNavLink
              href="/smartprobonoip/sample"
              event="sample_packet_viewed"
              className="btn-secondary-lg w-full sm:w-auto"
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
