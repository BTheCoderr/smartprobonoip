import type { Metadata } from "next";
import Link from "next/link";
import {
  CalloutCard,
  DossierCard,
  PaperShell,
  Section,
  SectionHeader,
  StampLabel,
} from "@/components/ui/design";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Legal Help",
  description:
    "Ask Ermi, prepare drafts, organize a legal matter, and use guided preparation tools through SmartProBono.",
};

export default function LegalHomePage() {
  return (
    <div>
      <section className="paper-grid border-b border-mist-200/80">
        <PaperShell className="py-12 sm:py-16">
          <StampLabel tone="aqua">SMARTPROBONO LEGAL</StampLabel>
          <h1 className="headline-editorial mt-5 max-w-4xl text-4xl leading-tight sm:text-5xl">
            Get organized before the next legal conversation.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-blue">
            Use plain-language tools to organize facts, prepare questions, build drafts, and create a cleaner handoff for legal aid, court resources, or an attorney.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ROUTES.legalErmi} className="btn-primary-lg">
              Ask Ermi
            </Link>
            <Link href={ROUTES.legalDraft} className="btn-secondary-lg">
              Prepare a draft
            </Link>
          </div>
        </PaperShell>
      </section>

      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Available in the unified app"
            title="Start with the legal tools that move cleanly into the new platform"
            lead="These features are being rebuilt natively on the same Next.js platform as SmartProBonoIP instead of copying the old app wholesale."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <article className="dossier-card flex h-full flex-col p-6">
              <StampLabel tone="aqua">AVAILABLE</StampLabel>
              <h2 className="headline-editorial mt-4 text-xl">Understand a document</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-blue">
                Upload a PDF, DOCX, or TXT file for text extraction, plain-English review, date and action-language flags, and Ermi follow-up.
              </p>
              <Link href={ROUTES.legalDocument} className="btn-primary mt-6">
                Read a document
              </Link>
            </article>
            <article className="dossier-card flex h-full flex-col p-6">
              <StampLabel tone="aqua">AVAILABLE</StampLabel>
              <h2 className="headline-editorial mt-4 text-xl">Ask Ermi</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-blue">
                Turn a situation into clearer facts, questions, checklists, and preparation-focused next steps.
              </p>
              <Link href={ROUTES.legalErmi} className="btn-primary mt-6">
                Open Ermi
              </Link>
            </article>
            <article className="dossier-card flex h-full flex-col p-6">
              <StampLabel tone="teal">AVAILABLE</StampLabel>
              <h2 className="headline-editorial mt-4 text-xl">Draft builder</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-blue">
                Prepare an editable letter, summary, timeline, request, or checklist labeled for review.
              </p>
              <Link href={ROUTES.legalDraft} className="btn-primary mt-6">
                Build a draft
              </Link>
            </article>
            <article className="dossier-card flex h-full flex-col p-6">
              <StampLabel tone="warm">AVAILABLE</StampLabel>
              <h2 className="headline-editorial mt-4 text-xl">Record-clearing prep</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-blue">
                Organize the basic facts, disposition, documents, and goals you may need before checking state-specific eligibility.
              </p>
              <Link href={ROUTES.legalRecordClearing} className="btn-primary mt-6">
                Start preparation
              </Link>
            </article>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Next migration slices"
            title="Keep moving the strongest legal workflows onto the unified platform"
            lead="Document understanding now lives natively in SmartProBono. The remaining legal features should continue moving over in focused slices instead of copying the old app wholesale."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <DossierCard title="RI eviction pilot" body="Intake, grounded materials, issue flags, assistant, and printable case summary." />
            <DossierCard title="Professional workspace" body="Authenticated legal-team intake, persistence, documents, and operational review." />
            <DossierCard title="Exports + billing" body="DOCX/PDF export, plan controls, and payment flows after the core account model is unified." />
          </div>
        </PaperShell>
      </Section>

      <Section>
        <PaperShell>
          <CalloutCard
            tone="warm"
            title="Informational and preparation support only"
            body="SmartProBono is not a law firm and does not provide legal representation. Laws and procedures vary by jurisdiction and facts. Use these tools to get organized, then confirm important legal decisions, rights, deadlines, and filings with an authoritative source or qualified professional."
          />
        </PaperShell>
      </Section>
    </div>
  );
}
