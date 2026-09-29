import type { Metadata } from "next";
import { RiEvictionIntakeForm } from "@/components/legal/RiEvictionIntakeForm";
import { CalloutCard, DossierPageHeader, PaperShell, StampLabel } from "@/components/ui/design";

export const metadata: Metadata = {
  title: "Rhode Island Eviction Preparation",
  description:
    "Organize a Rhode Island eviction situation, identify source-backed preparation steps, and build a summary for legal-aid or attorney review.",
};

export default function RiEvictionIntakePage() {
  return (
    <div>
      <DossierPageHeader
        stamps={<StampLabel tone="aqua">RHODE ISLAND · EVICTION PREP</StampLabel>}
        title="Organize the facts before you talk to the court, legal aid, or an attorney"
        lead="This guided intake helps sort the notice, court status, rent issues, housing conditions, and questions worth confirming. It does not decide your rights, defenses, or case outcome."
      />
      <PaperShell narrow className="py-8 sm:py-10">
        <RiEvictionIntakeForm />
        <div className="mt-6">
          <CalloutCard
            tone="warm"
            title="Time-sensitive papers need human confirmation"
            body="If you have a summons, hearing, judgment, lockout threat, or other urgent paper, confirm deadlines and available help promptly with the Rhode Island Judiciary, Rhode Island Legal Services, or a qualified attorney."
          />
        </div>
      </PaperShell>
    </div>
  );
}
