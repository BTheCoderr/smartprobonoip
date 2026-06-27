import { InterestForm } from "@/components/contact/InterestForm";
import { PageEvent } from "@/components/analytics/PageEvent";
import { PaperShell, Section, SectionHeader } from "@/components/ui/design";

export default function ContactPage() {
  return (
    <div>
      <PageEvent event="contact_form_viewed" />
      <Section>
        <PaperShell>
          <SectionHeader
            kicker="Connect"
            title="Partner, pilot, or support SmartProBonoIP"
            lead="Educational readiness only — not legal advice."
          />
          <div className="mt-8">
            <InterestForm />
          </div>
        </PaperShell>
      </Section>
    </div>
  );
}
