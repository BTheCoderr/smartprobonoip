import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { LearnJourney } from "@/components/learn/LearnJourney";
import { PatentEducationTopics } from "@/components/learn/PatentEducationTopics";
import { ConnectResourcesSection } from "@/components/connect/ConnectResourcesSection";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { COMMERCIALIZATION_COPY, LEARN_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";
import {
  CalloutCard,
  DossierPageHeader,
  DossierCard,
  PaperShell,
  Section,
  SectionHeader,
  StampLabel,
} from "@/components/ui/design";

export const metadata = {
  title: "Learn IP readiness basics — SmartProBonoIP",
  description:
    "Patent-focused IP preparation for inventors: privacy, public disclosure, AI inventorship, and invention disclosure basics. Preparation only — not legal advice.",
};

export default function LearnPage() {
  return (
    <div>
      <PageEvent event="learn_page_viewed" />

      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">PHASE 1 · PATENT LEARN</StampLabel>
            <StampLabel tone="aqua">PREPARATION ONLY</StampLabel>
          </>
        }
        kicker={LEARN_COPY.subtitle}
        title={LEARN_COPY.title}
        lead={LEARN_COPY.lead}
        aside={
          <div className="flex flex-col gap-3">
            <Link href={ROUTES.disclaimer} className="btn-primary">
              Start patent readiness
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

      <Section soft>
        <PaperShell>
          <PatentEducationTopics />
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <LearnJourney />
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <ConnectResourcesSection />
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Future modules"
            title={COMMERCIALIZATION_COPY.title}
            lead={COMMERCIALIZATION_COPY.lead}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMMERCIALIZATION_COPY.topics.map((topic, i) => (
              <DossierCard
                key={topic.title}
                index={i}
                title={topic.title}
                body={topic.body}
              />
            ))}
          </div>
          <CalloutCard
            tone="aqua"
            title="v1.0 scope"
            body={`${COMMERCIALIZATION_COPY.statusNote} ${LEARN_COPY.futureNote}`}
          />
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
