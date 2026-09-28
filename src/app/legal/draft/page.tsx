import type { Metadata } from "next";
import { LegalDraftBuilder } from "@/components/legal/LegalDraftBuilder";
import { CalloutCard, DossierPageHeader, PaperShell, StampLabel } from "@/components/ui/design";

export const metadata: Metadata = {
  title: "Legal Draft Builder",
  description: "Prepare editable legal-support drafts from user-supplied facts with SmartProBono.",
};

export default function LegalDraftPage() {
  return (
    <div>
      <DossierPageHeader
        stamps={<StampLabel tone="teal">DRAFT PREPARATION</StampLabel>}
        title="Build a draft from the facts you know"
        lead="Create a letter, factual summary, timeline, request, checklist, or statement for review. The tool is instructed not to fill gaps with invented facts."
      />
      <PaperShell className="py-8 sm:py-10">
        <LegalDraftBuilder />
        <div className="mt-6">
          <CalloutCard
            tone="warm"
            title="Review before use"
            body="A generated draft can be incomplete or wrong for your jurisdiction. Confirm names, dates, facts, legal requirements, filing rules, and deadlines before relying on it."
          />
        </div>
      </PaperShell>
    </div>
  );
}
