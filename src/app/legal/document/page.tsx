import type { Metadata } from "next";
import { LegalDocumentWorkspace } from "@/components/legal/LegalDocumentWorkspace";
import { CalloutCard, DossierPageHeader, PaperShell, StampLabel } from "@/components/ui/design";

export const metadata: Metadata = {
  title: "Understand a Legal Document",
  description:
    "Upload a PDF, DOCX, or TXT document for extraction, plain-English preparation notes, questions to confirm, and Ermi follow-up.",
};

export default function LegalDocumentPage() {
  return (
    <div>
      <DossierPageHeader
        stamps={<StampLabel tone="aqua">DOCUMENT UNDERSTANDING</StampLabel>}
        title="Turn a legal document into something you can work with"
        lead="Upload a PDF, DOCX, or TXT file. SmartProBono extracts the text, organizes what the document appears to say, flags date and action language for review, and prepares questions to confirm."
      />
      <PaperShell className="py-8 sm:py-10">
        <LegalDocumentWorkspace />
        <div className="mt-6">
          <CalloutCard
            tone="warm"
            title="Read the original too"
            body="Extraction and AI-assisted explanations can miss context, formatting, exhibits, signatures, footnotes, or jurisdiction-specific meaning. Do not rely on SmartProBono to determine whether a date is a legal deadline or what legal action you should take."
          />
        </div>
      </PaperShell>
    </div>
  );
}
