import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { RI_PILOT_PLAYBOOK } from "@/lib/content/riPilotPlaybook";
import {
  DossierPageHeader,
  PaperShell,
  Section,
  StampLabel,
} from "@/components/ui/design";

export default function PartnerPlaybookPage() {
  return (
    <div>
      <PageEvent event="pilot_page_viewed" />

      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">PARTNER PLAYBOOK</StampLabel>
            <StampLabel tone="warm">RHODE ISLAND PILOT</StampLabel>
          </>
        }
        kicker="One-page guide"
        title={RI_PILOT_PLAYBOOK.title}
        lead={RI_PILOT_PLAYBOOK.lead}
        aside={
          <div className="flex w-full flex-col gap-3 lg:max-w-xs">
            <Link href="/smartprobonoip/pilot" className="btn-primary w-full">
              Pilot overview
            </Link>
            <Link href="/smartprobonoip/sample" className="btn-secondary w-full">
              View sample packet
            </Link>
            <Link href="/contact" className="btn-ghost w-full justify-center px-0">
              Request referral link →
            </Link>
          </div>
        }
      />

      <Section>
        <PaperShell className="max-w-3xl">
          <p className="text-base leading-relaxed text-navy-700">
            {RI_PILOT_PLAYBOOK.subtitle}
          </p>

          <div className="mt-10 space-y-10">
            {RI_PILOT_PLAYBOOK.sections.map((section) => (
              <section key={section.title}>
                <h2 className="headline-editorial text-xl text-navy-900">
                  {section.title}
                </h2>
                {"body" in section && section.body ? (
                  <p className="mt-3 text-sm leading-relaxed text-navy-700">
                    {section.body}
                  </p>
                ) : null}
                {"bullets" in section && section.bullets ? (
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-navy-700">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-teal-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {"steps" in section && section.steps ? (
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-navy-700">
                    {section.steps.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                ) : null}
              </section>
            ))}
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
