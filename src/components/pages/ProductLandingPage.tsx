import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { TrackedNavLink } from "@/components/analytics/TrackedNavLink";
import { PartnerInterestLink } from "@/components/analytics/PartnerInterestLink";
import {
  ProductProofMedia,
} from "@/components/pages/ProductProofMedia";
import { ProductDemoVideo } from "@/components/pages/ProductDemoVideo";
import { ProductWalkthrough } from "@/components/pages/ProductWalkthrough";
import { SocialProofSlot } from "@/components/pages/SocialProofSlot";
import { ProtectionPathChooser } from "@/components/platform/ProtectionPathChooser";
import { BRAND } from "@/lib/brand";
import { LANDING_COPY, RESEARCH_PREP_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";
import {
  CalloutCard,
  CreativeHeroSection,
  DossierCard,
  HowItWorksStep,
  PaperShell,
  Section,
  SectionHeader,
} from "@/components/ui/design";
import { ProductSamplePreviewBand } from "@/components/pages/ProductSamplePreviewBand";

export default function ProductLandingPage() {
  return (
    <div>
      <PageEvent event="landing_viewed" />
      <CreativeHeroSection
        stamp={LANDING_COPY.heroStamp}
        title={BRAND.tagline}
        lead={BRAND.positioning}
        mission={BRAND.coreMessage}
        safetyLine={LANDING_COPY.heroSafety}
        subcta={LANDING_COPY.heroSubcta}
      >
        <div className="flex flex-wrap gap-3">
          <TrackedNavLink
            href={ROUTES.disclaimer}
            event="start_clicked"
            className="btn-primary"
          >
            Start patent readiness
          </TrackedNavLink>
          <TrackedNavLink
            href={ROUTES.sample}
            event="sample_packet_viewed"
            className="btn-secondary"
          >
            {LANDING_COPY.ctaSample}
          </TrackedNavLink>
          <Link href="#protection-paths" className="btn-ghost">
            See all paths
          </Link>
        </div>
      </CreativeHeroSection>

      <Section id="protection-paths" soft>
        <PaperShell>
          <ProtectionPathChooser
            heading="Choose a protection path to get started"
            lead="Phase 1 ships patent readiness for inventors. Other paths are registered on the platform and will reuse shared auth, dashboard, documents, AI, handoff, and portfolio services when they open — without fake placeholder workflows."
          />
        </PaperShell>
      </Section>

      <ProductSamplePreviewBand />

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Product proof"
            title="Real workflows — sample previews of the IP Readiness Packet"
            lead={LANDING_COPY.productProofLead}
          />
          <p className="mt-3 text-xs leading-relaxed text-navy-500">
            {LANDING_COPY.productProofMediaNote}
          </p>
          <div className="mt-10 border-b border-dashed border-mist-200 pb-10">
            <ProductDemoVideo pageSection="homepage_product_proof" />
          </div>
          <div className="mt-10 border-b border-dashed border-mist-200 pb-10">
            <ProductWalkthrough pageSection="homepage_product_proof" />
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {LANDING_COPY.productProof.map((item) => (
              <div key={item.title} className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-navy-600">{item.body}</p>
                </div>
                <ProductProofMedia variant={item.variant} />
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <TrackedNavLink
              href={ROUTES.sample}
              event="sample_packet_viewed"
              className="btn-secondary"
            >
              {LANDING_COPY.ctaSample}
            </TrackedNavLink>
            <Link href={ROUTES.forProfessionals} className="btn-secondary">
              For professionals
            </Link>
            <Link href={ROUTES.pilot} className="btn-ghost">
              Pilot kit
            </Link>
            <TrackedNavLink
              href={ROUTES.disclaimerDemo}
              event="demo_started"
              className="btn-ghost"
            >
              Try demo intake
            </TrackedNavLink>
          </div>
        </PaperShell>
      </Section>

      <SocialProofSlot />

      <Section id="how-it-works">
        <PaperShell>
          <SectionHeader
            kicker="How patent readiness works"
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
              href={ROUTES.disclaimer}
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
              href={ROUTES.sampleSimilarRef}
              event="sample_packet_viewed"
              className="btn-primary"
            >
              {LANDING_COPY.ctaSample}
            </TrackedNavLink>
            <Link href={ROUTES.forProfessionals} className="btn-secondary">
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
              tone="aqua"
              title="What this does not do"
              body={LANDING_COPY.whatWeDoNot}
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={ROUTES.trust} className="btn-secondary">
              Visit Trust Center
            </Link>
            <Link href={ROUTES.learn} className="btn-ghost">
              Learn IP basics
            </Link>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader kicker="About" title="Built for overlooked innovators" />
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-navy-700">
            {LANDING_COPY.founder.bio}
          </p>
          <Link href={ROUTES.about} className="btn-ghost mt-4 px-0">
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
            <Link href={ROUTES.pilot} className="btn-secondary">
              {LANDING_COPY.riPilotTeaser.cta}
            </Link>
            <PartnerInterestLink
              href={ROUTES.contact}
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
              href={ROUTES.disclaimer}
              event="start_clicked"
              className="btn-primary"
            >
              {LANDING_COPY.ctaPrimary}
            </TrackedNavLink>
            <TrackedNavLink
              href={ROUTES.sample}
              event="sample_packet_viewed"
              className="btn-secondary"
            >
              {LANDING_COPY.ctaSample}
            </TrackedNavLink>
            <Link href={ROUTES.learn} className="btn-secondary">
              Learn IP basics
            </Link>
            <Link href={ROUTES.trust} className="btn-ghost">
              Trust Center
            </Link>
            <Link href={ROUTES.forProfessionals} className="btn-ghost">
              For professionals
            </Link>
            <Link href={ROUTES.pilot} className="btn-ghost">
              Pilot kit
            </Link>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-xs leading-relaxed text-navy-500">
            {LANDING_COPY.footerDisclaimer}{" "}
            <Link href={ROUTES.disclaimer} className="text-teal-700 hover:underline">
              Read full disclaimer
            </Link>
          </p>
        </PaperShell>
      </Section>
    </div>
  );
}
