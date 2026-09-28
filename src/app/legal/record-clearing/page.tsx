import type { Metadata } from "next";
import { RecordClearingPrep } from "@/components/legal/RecordClearingPrep";
import { CalloutCard, DossierPageHeader, PaperShell, StampLabel } from "@/components/ui/design";

export const metadata: Metadata = {
  title: "Record-Clearing Preparation",
  description: "Organize record-clearing facts and questions before checking state-specific eligibility.",
};

export default function RecordClearingPage() {
  return (
    <div>
      <DossierPageHeader
        stamps={<StampLabel tone="warm">GUIDED LEGAL PREP</StampLabel>}
        title="Record-clearing preparation"
        lead="Organize the facts and documents that may matter before you check expungement, sealing, or other record-clearing options in the correct jurisdiction."
      />
      <PaperShell className="py-8 sm:py-10">
        <RecordClearingPrep />
        <div className="mt-6">
          <CalloutCard
            tone="warm"
            title="This flow does not decide eligibility"
            body="Eligibility can depend on current state law, the exact charge and disposition, waiting periods, later cases, and other details. Use this summary to prepare for an authoritative eligibility check."
          />
        </div>
      </PaperShell>
    </div>
  );
}
