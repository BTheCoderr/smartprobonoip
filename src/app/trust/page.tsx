import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { TRUST_COPY } from "@/lib/copy";
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
  title: "Trust Center — SmartProBonoIP",
  description:
    "What SmartProBonoIP does and does not do. Privacy, AI scope, and pilot practices.",
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

export default function TrustPage() {
  return (
    <div>
      <PageEvent event="trust_page_viewed" />

      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">TRUST CENTER</StampLabel>
            <StampLabel tone="warm">PREPARATION ONLY</StampLabel>
          </>
        }
        kicker={TRUST_COPY.subtitle}
        title={TRUST_COPY.title}
        lead={TRUST_COPY.lead}
        aside={
          <div className="flex flex-col gap-3">
            <Link href={ROUTES.privacy} className="btn-secondary">
              Privacy summary
            </Link>
            <Link href={ROUTES.disclaimer} className="btn-ghost px-0">
              Read full disclaimer →
            </Link>
            <Link href={ROUTES.contact} className="btn-ghost px-0">
              Contact →
            </Link>
          </div>
        }
      />

      <Section>
        <PaperShell>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <SectionHeader kicker="What we do" title="SmartProBonoIP helps you prepare" />
              <BulletList items={TRUST_COPY.doesDo} />
            </div>
            <div>
              <SectionHeader
                kicker="What we do not do"
                title="Important limits"
              />
              <BulletList items={TRUST_COPY.doesNotDo} />
            </div>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker={TRUST_COPY.aiScope.title}
            title="AI-assisted drafts with human review expected"
          />
          <BulletList items={TRUST_COPY.aiScope.points} />
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker={TRUST_COPY.privacy.title}
            title="Your data and recovery links"
          />
          <BulletList items={TRUST_COPY.privacy.points} />
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker={TRUST_COPY.exportPrivacy.title}
            title="You control exports"
          />
          <BulletList items={TRUST_COPY.exportPrivacy.points} />
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker={TRUST_COPY.pilotAnalytics.title}
            title="Pilot partners and aggregated metrics"
          />
          <BulletList items={TRUST_COPY.pilotAnalytics.points} />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ROUTES.pilot} className="btn-secondary">
              Pilot kit
            </Link>
            <Link href={ROUTES.forClinics} className="btn-ghost">
              For clinics
            </Link>
            <Link href={ROUTES.forUniversities} className="btn-ghost">
              For universities
            </Link>
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker={TRUST_COPY.contact.title}
            title="Questions, privacy, and pilot support"
          />
          <ul className="mt-6 space-y-2 text-sm leading-relaxed text-navy-700">
            {TRUST_COPY.contact.points.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-navy-500">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={ROUTES.contact} className="btn-primary">
              Contact
            </Link>
            <Link href={ROUTES.privacy} className="btn-secondary">
              Privacy summary
            </Link>
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker={TRUST_COPY.contact.title}
            title="Questions, privacy, and pilot support"
          />
          <BulletList items={TRUST_COPY.contact.points} />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={ROUTES.contact} className="btn-primary">
              Contact
            </Link>
            <Link href={ROUTES.privacy} className="btn-secondary">
              Privacy summary
            </Link>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell className="pb-8">
          <CalloutCard
            tone="warm"
            title="Preparation only — not legal advice"
            body="SmartProBonoIP is not a law firm. No attorney-client relationship is created by using this tool."
          />
          <div className="mt-8">
            <DisclaimerNotice />
          </div>
        </PaperShell>
      </Section>
    </div>
  );
}
