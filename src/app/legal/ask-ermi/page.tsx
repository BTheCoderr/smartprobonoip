import type { Metadata } from "next";
import { LegalAssistant } from "@/components/legal/LegalAssistant";
import { CalloutCard, DossierPageHeader, PaperShell, StampLabel } from "@/components/ui/design";

export const metadata: Metadata = {
  title: "Ask Ermi — Legal Preparation",
  description: "Organize facts, questions, checklists, and draft language with SmartProBono's legal preparation assistant.",
};

export default function AskErmiPage() {
  return (
    <div>
      <DossierPageHeader
        narrow
        stamps={<StampLabel tone="aqua">LEGAL PREPARATION</StampLabel>}
        title="Ask Ermi"
        lead="Use everyday language. Ermi helps organize what you know, what is missing, and what you may want to prepare or confirm next."
      />
      <PaperShell narrow className="py-8 sm:py-10">
        <LegalAssistant />
        <div className="mt-6">
          <CalloutCard
            tone="warm"
            title="Not legal advice"
            body="Ermi can help with preparation and general information, but does not represent you and should not be treated as the source of a jurisdiction-specific legal rule, deadline, or prediction."
          />
        </div>
      </PaperShell>
    </div>
  );
}
