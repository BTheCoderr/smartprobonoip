import type { Metadata } from "next";
import { RiEvictionResults } from "@/components/legal/RiEvictionResults";
import { DossierPageHeader, PaperShell, StampLabel } from "@/components/ui/design";

export const metadata: Metadata = {
  title: "RI Eviction Preparation Results",
  description:
    "Source-backed Rhode Island eviction preparation steps, document checklist, and questions to confirm.",
};

export default function RiEvictionResultsPage() {
  return (
    <div>
      <DossierPageHeader
        stamps={<StampLabel tone="teal">SOURCE-BACKED PREPARATION</StampLabel>}
        title="Rhode Island eviction preparation results"
        lead="These results organize what you reported and connect it to current Rhode Island Judiciary and Rhode Island Legal Services resources. They are not a legal opinion."
      />
      <PaperShell narrow className="py-8 sm:py-10">
        <RiEvictionResults />
      </PaperShell>
    </div>
  );
}
