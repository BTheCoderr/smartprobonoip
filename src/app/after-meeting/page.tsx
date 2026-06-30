import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { AFTER_MEETING_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";
import {
  CalloutCard,
  DossierPageHeader,
  PaperShell,
  Section,
  SectionHeader,
  StampLabel,
} from "@/components/ui/design";

export const metadata = {
  title: "After your expert meeting — SmartProBonoIP",
  description:
    "Meeting notes template and follow-up prep after expert review. Preparation only — not legal advice.",
};

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-2 text-sm leading-relaxed text-navy-700">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-navy-500">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AfterMeetingPage() {
  return (
    <div>
      <PageEvent event="after_meeting_page_viewed" />

      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">FOLLOW-UP</StampLabel>
            <StampLabel tone="warm">PREPARATION ONLY</StampLabel>
          </>
        }
        kicker={AFTER_MEETING_COPY.subtitle}
        title={AFTER_MEETING_COPY.title}
        lead={AFTER_MEETING_COPY.lead}
        aside={
          <div className="flex flex-col gap-3">
            <Link href={ROUTES.disclaimer} className="btn-primary">
              Start / update packet
            </Link>
            <Link href={ROUTES.sample} className="btn-secondary">
              View sample packet
            </Link>
            <Link href={ROUTES.trust} className="btn-ghost px-0">
              Trust Center →
            </Link>
          </div>
        }
      />

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="After expert review"
            title="Common next-step scenarios"
          />
          <ul className="mt-8 space-y-4">
            {AFTER_MEETING_COPY.expertNextSteps.map((step) => (
              <li
                key={step.title}
                className="rounded-xl border border-mist-200 bg-white px-4 py-4 text-sm"
              >
                <p className="font-semibold text-navy-900">{step.title}</p>
                <p className="mt-2 leading-relaxed text-navy-600">{step.body}</p>
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker={AFTER_MEETING_COPY.meetingNotesTemplate.title}
            title="Write down what happened while it is fresh"
          />
          <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-navy-700">
            {AFTER_MEETING_COPY.meetingNotesTemplate.fields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ol>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <SectionHeader
                kicker="Gather next"
                title="Documents and materials to collect"
              />
              <BulletList items={AFTER_MEETING_COPY.gatherNext} />
            </div>
            <div>
              <SectionHeader
                kicker="Follow-up questions"
                title="Questions you may want to ask next time"
              />
              <BulletList items={AFTER_MEETING_COPY.followUpQuestions} />
            </div>
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Update your packet"
            title="When to refresh your IP Readiness Packet"
          />
          <BulletList items={AFTER_MEETING_COPY.updatePacket} />
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="What not to do"
            title="Without professional advice"
          />
          <BulletList items={AFTER_MEETING_COPY.avoidWithoutAdvice} />
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker={AFTER_MEETING_COPY.bringToExpert.title}
            title="Keep this checklist for your next conversation"
          />
          <BulletList items={AFTER_MEETING_COPY.bringToExpert.items} />
          <CalloutCard
            tone="warm"
            title="Preparation only"
            body="This page helps you organize follow-up. It does not replace advice from your expert."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ROUTES.disclaimer} className="btn-primary">
              Start your packet
            </Link>
            <Link href={ROUTES.learn} className="btn-secondary">
              Learn IP basics
            </Link>
            <Link href={ROUTES.trust} className="btn-ghost">
              Trust Center
            </Link>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell className="pb-8">
          <DisclaimerNotice />
        </PaperShell>
      </Section>
    </div>
  );
}
