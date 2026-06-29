import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { BRAND } from "@/lib/brand";
import { LANDING_COPY } from "@/lib/copy";
import {
  DossierPageHeader,
  PaperShell,
  Section,
  SectionHeader,
  StampLabel,
} from "@/components/ui/design";

export default function AboutPage() {
  return (
    <div>
      <PageEvent event="professionals_page_viewed" />

      <DossierPageHeader
        stamps={<StampLabel tone="teal">ABOUT</StampLabel>}
        kicker="SmartProBonoIP"
        title="IP readiness before expert review"
        lead={BRAND.positioning}
      />

      <Section>
        <PaperShell>
          <SectionHeader kicker="Mission" title="Why this exists" />
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-navy-700">
            {LANDING_COPY.whyExists}
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-navy-700">
            {LANDING_COPY.founder.extended}
          </p>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader kicker="Founder" title={LANDING_COPY.founder.name} />
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-navy-700">
            {LANDING_COPY.founder.bio}
          </p>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="What we build"
            title="Preparation tools, not legal services"
          />
          <ul className="mt-8 space-y-2 text-sm leading-relaxed text-navy-700">
            {LANDING_COPY.trustPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-teal-600">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/smartprobonoip" className="btn-primary">
              View product
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact
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
