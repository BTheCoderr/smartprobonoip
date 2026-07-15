import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { PartnerInterestLink } from "@/components/analytics/PartnerInterestLink";
import { FeaturedGooglePatentsCard } from "@/components/ui/FeaturedGooglePatentsCard";
import { buildAttorneyExportPacket } from "@/lib/attorneyExport";
import { PROFESSIONALS_COPY } from "@/lib/copy";
import { SAMPLE_RECORD } from "@/lib/samplePacket";
import {
  CalloutCard,
  DossierCard,
  DossierPageHeader,
  InlineDisclaimer,
  PaperShell,
  Section,
  SectionHeader,
  StampLabel,
  TestimonialCard,
} from "@/components/ui/design";

const EXAMPLE_EXPORT = buildAttorneyExportPacket(
  SAMPLE_RECORD,
  [],
  "review@example-firm.com",
);

export default function ForProfessionalsPage() {
  const exampleJson = JSON.stringify(EXAMPLE_EXPORT, null, 2);

  return (
    <div>
      <PageEvent event="professionals_page_viewed" />

      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">FOR PROFESSIONALS</StampLabel>
            <StampLabel tone="warm">PREPARATION ONLY</StampLabel>
          </>
        }
        kicker={PROFESSIONALS_COPY.subtitle}
        title={PROFESSIONALS_COPY.title}
        lead={PROFESSIONALS_COPY.lead}
        aside={
          <div className="flex w-full flex-col gap-3 lg:max-w-xs">
            <Link href="/smartprobonoip/sample" className="btn-primary-lg w-full">
              View sample packet
            </Link>
            <Link href="/for-professionals/playbook" className="btn-secondary w-full">
              Partner playbook
            </Link>
            <Link href="/smartprobonoip/pilot" className="btn-secondary w-full">
              Explore pilot
            </Link>
            <Link href="/smartprobonoip/pilot-tracker" className="btn-ghost w-full justify-center px-0">
              Pilot tracker (local) →
            </Link>
            <PartnerInterestLink
              href="/contact"
              ctaName="Request conversation"
              pageSection="professionals_hero"
              className="btn-ghost w-full justify-center px-0"
            >
              Request pilot conversation →
            </PartnerInterestLink>
          </div>
        }
      />

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Positioning"
            title="IP readiness before expert review"
          />
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-navy-700">
            {PROFESSIONALS_COPY.positioning}
          </p>
          <p className="mt-4 max-w-3xl text-sm font-semibold text-teal-800">
            {PROFESSIONALS_COPY.corePromise}
          </p>
          <p className="mt-4">
            <InlineDisclaimer>{PROFESSIONALS_COPY.lead}</InlineDisclaimer>
          </p>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Search prep"
            title="Google Patents as the recommended starting point"
            lead="Inventors are guided to start with Google Patents, then save possible similar references for expert review."
          />
          <div className="mt-8">
            <FeaturedGooglePatentsCard query="portable water filter bottle seal" />
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Who this is for"
            title="Built for professionals who review early-stage inventors"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {PROFESSIONALS_COPY.audiences.map((item, i) => (
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
            kicker="What inventors bring you"
            title="Cleaner intake, not legal conclusions"
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {PROFESSIONALS_COPY.valuePoints.map((item) => (
              <li
                key={item}
                className="dossier-card px-4 py-4 text-sm leading-relaxed text-navy-700"
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
            kicker="Export for Attorney"
            title="Structured handoff from completed packets"
            lead={PROFESSIONALS_COPY.exportIntro}
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {PROFESSIONALS_COPY.exportFormats.map((format, i) => (
              <DossierCard
                key={format.title}
                index={i}
                title={format.title}
                body={format.body}
              />
            ))}
          </div>
          <dl className="paper-card mt-8 space-y-4 px-5 py-5 text-sm sm:px-6">
            {PROFESSIONALS_COPY.exportFormats.map((format) => (
              <div key={format.title}>
                <dt className="font-semibold text-navy-900">{format.title}</dt>
                <dd className="mt-1 font-mono text-xs text-teal-700">
                  MIME: {format.mime}
                </dd>
                <dd className="mt-1 font-mono text-xs text-navy-500">
                  Filename: {format.filename}
                </dd>
              </div>
            ))}
          </dl>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="JSON schema"
            title="Attorney export field reference"
            lead="All fields are derived from inventor intake and saved workspace data. Values are user-provided unless noted."
          />
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-mist-200 bg-cream/60">
                  <th className="px-4 py-3 font-semibold text-navy-900">Field</th>
                  <th className="px-4 py-3 font-semibold text-navy-900">Type</th>
                  <th className="px-4 py-3 font-semibold text-navy-900">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {PROFESSIONALS_COPY.schemaFields.map((row) => (
                  <tr
                    key={row.field}
                    className="border-b border-mist-100 text-navy-700"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-teal-800">
                      {row.field}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-navy-500">
                      {row.type}
                    </td>
                    <td className="px-4 py-3 leading-relaxed">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8">
            <CalloutCard
              tone="warm"
              title="Suggested classification areas"
              body={PROFESSIONALS_COPY.cpcNote}
            />
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Example export"
            title="Sample JSON — HydroSeal (fictional demo)"
            lead="Generated from the public sample packet. Preparation help only — not legal advice."
          />
          <pre className="paper-card mt-8 max-h-[480px] overflow-auto p-4 text-xs leading-relaxed text-navy-800 sm:p-6">
            <code>{exampleJson}</code>
          </pre>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="CSV format"
            title="Flat field/value export"
            lead="Optional two-column CSV for spreadsheet review. First row is the header field,value."
          />
          <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PROFESSIONALS_COPY.csvFields.map((field) => (
              <li
                key={field}
                className="rounded border border-mist-200 bg-white px-3 py-2 font-mono text-xs text-navy-600"
              >
                {field}
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="What this does not do"
            title="Important limits for professional reviewers"
          />
          <ul className="mt-8 space-y-2 text-sm leading-relaxed text-navy-700">
            {PROFESSIONALS_COPY.doesNotDo.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-teal-600">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Trust & data handling"
            title="How exports and pilot data are handled"
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <TestimonialCard
              quote="The structured export saved time on basic organization. I still reviewed everything myself — but the packet was a useful starting point."
              role="Patent agent"
              context="Professional reviewer feedback — anonymized"
            />
            <TestimonialCard
              quote="Inventors showed up with timelines, materials lists, and questions already organized. It felt like a real intake conversation instead of starting from scratch."
              role="Clinic coordinator"
              context="Rhode Island pilot feedback — anonymized"
            />
          </div>
          <ul className="mt-8 grid gap-2 sm:grid-cols-2">
            {PROFESSIONALS_COPY.trustPoints.map((point) => (
              <li
                key={point}
                className="flex gap-2 rounded-md border border-mist-200/80 bg-white px-4 py-3 text-sm leading-relaxed text-navy-700"
              >
                <span className="shrink-0 text-teal-600">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Rhode Island pilot"
            title="Pilot SmartProBonoIP as a pre-intake layer"
            lead={PROFESSIONALS_COPY.pilotTeaser}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/smartprobonoip/pilot" className="btn-primary">
              Explore pilot kit
            </Link>
            <Link href="/smartprobonoip/sample" className="btn-secondary">
              View sample packet
            </Link>
            <Link href="/smartprobonoip/pilot-tracker" className="btn-secondary">
              Pilot tracker (local)
            </Link>
            <PartnerInterestLink
              href="/contact"
              ctaName="Request pilot conversation"
              pageSection="professionals_pilot"
              className="btn-ghost"
            >
              Request pilot conversation
            </PartnerInterestLink>
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell className="pb-8">
          <DisclaimerNotice />
        </PaperShell>
      </Section>
    </div>
  );
}
