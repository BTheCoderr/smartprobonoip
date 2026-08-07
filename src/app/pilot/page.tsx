import type { Metadata } from "next";
import { PageEvent } from "@/components/analytics/PageEvent";
import { InterestForm } from "@/components/contact/InterestForm";
import { ProductDemoVideo } from "@/components/pages/ProductDemoVideo";
import { ProductWalkthrough } from "@/components/pages/ProductWalkthrough";
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

export const metadata: Metadata = {
  title: "SmartProBonoIP Pilot Partner Program",
  description:
    "Join a focused 30-day SmartProBonoIP pilot and help test a better way to prepare inventors before professional IP review.",
};

const frictionPoints = [
  {
    title: "Unstructured inventor stories",
    body: "Important facts arrive through scattered emails, calls, notes, and attachments instead of one consistent intake.",
  },
  {
    title: "Missing information",
    body: "Professionals spend early conversations uncovering the problem, solution, variations, ownership, and supporting details.",
  },
  {
    title: "Unpaid preparation time",
    body: "Teams repeat basic intake work before they can decide what type of support or next conversation makes sense.",
  },
] as const;

const workflowSteps = [
  {
    title: "Refer up to 10 inventors",
    body: "Share a tracked pilot link with inventors, founders, creators, or small businesses that need help organizing an early-stage idea.",
  },
  {
    title: "SmartProBonoIP guides the intake",
    body: "The platform structures the inventor story, surfaces missing information, and organizes supporting details without providing legal advice.",
  },
  {
    title: "Receive an organized packet",
    body: "The inventor can bring a clear IP Readiness Packet into the next professional, clinic, mentor, or program conversation.",
  },
  {
    title: "Shape the professional workflow",
    body: "You review selected packets and tell us what was useful, what was missing, and what would make the handoff more valuable.",
  },
] as const;

const partnerTypes = [
  "Patent agents and patent attorneys",
  "Small intellectual property firms",
  "University innovation and entrepreneurship programs",
  "Legal clinics and pro bono programs",
  "Incubators, accelerators, and inventor support organizations",
] as const;

const pilotMeasures = [
  "Inventor intake completion",
  "Packet usefulness to the reviewer",
  "Missing-information reduction",
  "Professional preparation time saved",
  "Readiness for the next conversation",
  "Repeat referrals from pilot partners",
] as const;

const partnerIs = [
  "A pre-intake preparation layer that helps inventors organize invention disclosures before they reach you",
  "A way to receive more consistent handoff packets (summary, timeline, disclosures, inventorship notes, materials)",
  "A feedback loop so founding partners can shape what professionals need in the brief",
  "Optional aggregated pilot metrics — not a dump of raw invention text into marketing analytics",
] as const;

const partnerIsNot = [
  "Not a law firm, filing service, or patentability opinion engine",
  "Not a marketplace that assigns clients or guarantees paid work",
  "Not legal advice, representation, or an attorney-client relationship with inventors",
  "Not a replacement for your professional judgment, conflicts checks, or engagement letters",
  "Not a multi-path IP suite yet — Phase 1 is patent readiness only; other paths are coming later",
] as const;

export default function PilotPartnerPage() {
  return (
    <div>
      <PageEvent event="pilot_page_viewed" />

      <DossierPageHeader
        stamps={<StampLabel tone="teal">FOUNDING PARTNER PILOT</StampLabel>}
        kicker="Patent readiness pilot — inventor preparedness, not legal advice"
        title="Spend less time rebuilding intake from zero"
        lead="SmartProBonoIP is an IP Readiness Platform. Phase 1 helps inventors prepare clearer invention disclosures and professional handoff packets before patent conversations. We are selecting five IP professionals and organizations to test and shape that handoff — not to outsource legal judgment."
        aside={
          <a href="#pilot-application" className="btn-primary w-full text-center">
            Become a SmartProBonoIP pilot partner
          </a>
        }
      />

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Pilot partner clarification"
            title="What a pilot partner is — and is not"
            lead="A pilot partner is an organization or professional that (a) shares a tracked link with inventors they already support, (b) may review selected packets, and (c) gives feedback — with no referral fee, no legal relationship created by the platform, and no obligation to take on any inventor."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                A pilot partner is
              </h3>
              <ul className="mt-4 space-y-3">
                {partnerIs.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-teal-100 bg-teal-50/40 px-4 py-3 text-sm leading-relaxed text-navy-800"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-warm-700">
                A pilot partner is not signing up for
              </h3>
              <ul className="mt-4 space-y-3">
                {partnerIsNot.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-warm-200/80 bg-warm-50/40 px-4 py-3 text-sm leading-relaxed text-navy-800"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="The intake problem"
            title="Good ideas often arrive before the inventor is ready"
            lead="The first professional conversation should not have to begin with reconstructing the entire invention story."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {frictionPoints.map((item, index) => (
              <ValueCard
                key={item.title}
                icon={index + 1}
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
            kicker="The pilot workflow"
            title="One referral link. One structured handoff. Real reviewer feedback."
            lead="Each founding partner can refer up to 10 inventors during the 30-day pilot."
          />
          <ol className="mt-10 grid gap-5 sm:grid-cols-2">
            {workflowSteps.map((step, index) => (
              <li key={step.title}>
                <ValueCard
                  icon={index + 1}
                  title={`${index + 1}. ${step.title}`}
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
            kicker="Who the pilot is for"
            title="Built with the people who already support inventors"
            lead="We are prioritizing Rhode Island professionals and organizations for the founding pilot."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {partnerTypes.map((item) => (
              <li
                key={item}
                className="paper-card px-5 py-4 text-sm font-medium leading-relaxed text-navy-800"
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
            kicker="What we will measure"
            title="Proof before expansion"
            lead="The pilot is designed to answer one question: does a SmartProBonoIP packet create a better prepared inventor and a more useful professional handoff?"
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pilotMeasures.map((item) => (
              <li
                key={item}
                className="paper-card px-5 py-4 text-sm leading-relaxed text-navy-700"
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
            kicker="Clear boundaries"
            title="Preparation support, not legal conclusions"
          />
          <div className="mt-8">
            <CalloutCard
              tone="aqua"
              title="SmartProBonoIP supports the intake before expert review"
              body="The platform helps users organize their own information and prepare questions. It does not provide legal advice, representation, patentability opinions, clearance opinions, filing services, or replace a licensed attorney or registered patent practitioner."
            />
          </div>
          <p className="mt-5">
            <InlineDisclaimer>
              Educational readiness tool. Preparation only — not legal advice.
            </InlineDisclaimer>
          </p>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <ProductWalkthrough pageSection="pilot_page_walkthrough" />
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <ProductDemoVideo pageSection="pilot_page_demo" />
        </PaperShell>
      </Section>

      <Section id="pilot-application">
        <PaperShell>
          <SectionHeader
            kicker="Founding partner application"
            title="Become a SmartProBonoIP pilot partner"
            lead="Tell us about your organization, the inventors you support, and what a useful intake handoff would look like for your team. Please do not submit confidential invention details."
          />
          <div className="mt-8">
            <InterestForm id="pilot-partner-form" />
          </div>
        </PaperShell>
      </Section>
    </div>
  );
}
