import type { Metadata } from "next";
import { RiEvictionSummary } from "@/components/legal/RiEvictionSummary";
import { DossierPageHeader, PaperShell, StampLabel } from "@/components/ui/design";

export const metadata: Metadata = {
  title: "RI Eviction Preparation Summary",
  description:
    "Printable Rhode Island eviction preparation summary for legal-aid, court-resource, or attorney review.",
};

export default function RiEvictionSummaryPage() {
  return (
    <div>
      <DossierPageHeader
        stamps={<StampLabel tone="navy">STAFF-READY SUMMARY</StampLabel>}
        title="Rhode Island eviction preparation summary"
        lead="Print, save, or bring this summary to a legal-aid intake, court-resource conversation, or attorney review."
      />
      <PaperShell narrow className="py-8 sm:py-10">
        <RiEvictionSummary />
      </PaperShell>
    </div>
  );
}
