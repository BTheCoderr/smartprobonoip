import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import {
  CalloutCard,
  DossierCard,
  MissionBand,
  PaperShell,
  Section,
  SectionHeader,
  StampLabel,
} from "@/components/ui/design";
import { BRAND } from "@/lib/brand";
import { ROUTES } from "@/lib/routes";

const legalCapabilities = [
  {
    title: "Ask Ermi",
    body: "Organize a legal question, turn a messy situation into clearer facts, and prepare questions or next steps for review.",
  },
  {
    title: "Draft preparation",
    body: "Create letters, summaries, timelines, checklists, and other editable drafts for your own review or professional handoff.",
  },
  {
    title: "Guided legal prep",
    body: "Work through structured preparation flows such as record-clearing and jurisdiction-specific pilots without pretending to decide your case.",
  },
];

const ipCapabilities = [
  {
    title: "Build the record",
    body: "Capture invention facts, contributors, disclosure history, ownership context, prior filings, and evidence in one reusable record.",
  },
  {
    title: "Prepare the handoff",
    body: "Map facts into professional intake questions, resolve missing information, and explicitly approve what gets shared.",
  },
  {
    title: "Connect when ready",
    body: "Bring a clearer packet and factual record into a conversation with a patent professional, clinic, university, or partner organization.",
  },
];

export default function UmbrellaLandingPage() {
  return (
    <div>
      <section className="paper-grid border-b border-mist-200/80">
        <PaperShell className="py-14 sm:py-20 lg:py-24">
          <div className="max-w-4xl">
            <BrandMark variant="full" size="lg" className="mb-6" />
            <StampLabel tone="teal">ONE PREPARATION PLATFORM</StampLabel>
            <h1 className="headline-editorial mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              {BRAND.platformTagline}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-blue sm:text-xl">
              {BRAND.platformPositioning}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#choose-a-path" className="btn-primary-lg">
                Choose what you need help with
              </Link>
              <Link href={ROUTES.trust} className="btn-secondary-lg">
                How SmartProBono stays in bounds
              </Link>
            </div>
          </div>
        </PaperShell>
      </section>

      <Section id="choose-a-path">
        <PaperShell>
          <SectionHeader
            kicker="Choose a path"
            title="One account direction. Different preparation workflows."
            lead="Legal matters and IP records need different questions and safeguards. SmartProBono keeps those workflows distinct while giving them one clear home."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="dossier-card flex h-full flex-col border-2 border-aqua-200/80">
              <div className="border-b border-dashed border-mist-200 bg-aqua-50/60 px-6 py-5">
                <StampLabel tone="aqua">LEGAL HELP</StampLabel>
                <h2 className="headline-editorial mt-4 text-2xl sm:text-3xl">
                  I have a legal issue or document.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-blue sm:text-base">
                  Understand what you have, organize the facts, prepare drafts and questions, and get ready for the next practical step.
                </p>
              </div>
              <div className="flex flex-1 flex-col px-6 py-6">
                <ul className="space-y-3 text-sm leading-relaxed text-navy-700">
                  <li>• Ask Ermi for preparation-focused help</li>
                  <li>• Build a draft or structured summary</li>
                  <li>• Use guided legal-prep workflows</li>
                  <li>• Prepare for legal aid, court staff, or attorney review</li>
                </ul>
                <div className="mt-auto pt-7">
                  <Link href={ROUTES.legal} className="btn-primary">
                    Go to Legal Help
                  </Link>
                </div>
              </div>
            </article>

            <article className="dossier-card flex h-full flex-col border-2 border-teal-300/70">
              <div className="border-b border-dashed border-mist-200 bg-teal-50/70 px-6 py-5">
                <StampLabel tone="teal">SMARTPROBONOIP</StampLabel>
                <h2 className="headline-editorial mt-4 text-2xl sm:text-3xl">
                  I need to protect an idea, invention, brand, or creative work.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-blue sm:text-base">
                  Build an IP readiness record before expert review, beginning with the patent workflow that is already live.
                </p>
              </div>
              <div className="flex flex-1 flex-col px-6 py-6">
                <ul className="space-y-3 text-sm leading-relaxed text-navy-700">
                  <li>• Patent readiness available now</li>
                  <li>• Trademark, copyright, trade secret, and unsure paths registered</li>
                  <li>• Evidence and disclosure timeline</li>
                  <li>• Professional intake mapping and explicit sharing</li>
                </ul>
                <div className="mt-auto pt-7">
                  <Link href={ROUTES.ip} className="btn-primary">
                    Go to SmartProBonoIP
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="The platform model"
            title="Learn → Prepare → Connect"
            lead="The same operating model applies across SmartProBono, while each subject area keeps its own facts, workflows, and safety boundaries."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <DossierCard
              index={0}
              title="Learn"
              body="Get plain-language orientation so you understand the issue, vocabulary, documents, and questions that may matter."
            />
            <DossierCard
              index={1}
              title="Prepare"
              body="Organize facts, timelines, evidence, drafts, and unanswered questions into something another person can actually review."
            />
            <DossierCard
              index={2}
              title="Connect"
              body="Move the prepared record to the right human next step — a professional, clinic, legal aid organization, court resource, or partner."
            />
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeader
                kicker="Legal side"
                title="Preparation without pretending to be your lawyer"
                lead="The legal experience focuses on factual organization, document understanding, draft preparation, and guided workflows."
              />
              <div className="mt-7 space-y-4">
                {legalCapabilities.map((item) => (
                  <DossierCard key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
              <Link href={ROUTES.legal} className="btn-secondary mt-6">
                Explore legal tools
              </Link>
            </div>
            <div>
              <SectionHeader
                kicker="IP side"
                title="SmartProBonoIP stays a real product inside the platform"
                lead="The canonical IP record and professional handoff work remains intact rather than being flattened into a generic legal form."
              />
              <div className="mt-7 space-y-4">
                {ipCapabilities.map((item) => (
                  <DossierCard key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
              <Link href={ROUTES.ip} className="btn-secondary mt-6">
                Explore SmartProBonoIP
              </Link>
            </div>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <MissionBand
            kicker="Why combine them"
            quote="One trusted front door. Specialized workflows behind it."
            body="People should not have to understand SmartProBono's internal product structure before they can get started. The platform chooses the right preparation path while preserving the differences between legal matters and IP readiness."
          />
          <div className="mt-8">
            <CalloutCard
              tone="warm"
              title="SmartProBono is preparation support, not a law firm."
              body="The platform can help organize information, explain general concepts, prepare questions and drafts, and support professional handoff. It does not create an attorney-client relationship, make legal decisions for a user, or replace qualified professional review."
            />
          </div>
        </PaperShell>
      </Section>
    </div>
  );
}
