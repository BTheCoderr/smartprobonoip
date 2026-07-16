import type { Metadata } from "next";
import { PageEvent } from "@/components/analytics/PageEvent";
import { InterestForm } from "@/components/contact/InterestForm";
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

export default function PilotPartnerPage() {
  return (
    <div>
      <PageEvent event="pilot_page_viewed" />

      <DossierPageHeader
        stamps={<StampLabel tone="teal">FOUNDING PARTNER PILOT</StampLabel>}
        kicker="A focused 30-day SmartProBonoIP pilot"
        title="Spend less time rebuilding intake from zero"
        lead="SmartProBonoIP turns unstructured inventor stories into organized, review-ready IP Readiness Packets before they reach your desk. We are selecting five IP professionals and organizations to help test and shape the professional workflow."
        aside={
          <a href="#pilot-application" className="btn-primary w-full text-center">
            Become a SmartProBonoIP pilot partner
          </a>
        }
      />

      <Section soft>
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
