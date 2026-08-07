import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { PartnerDirectory } from "@/components/partners/PartnerDirectory";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { PARTNER_DIRECTORY_COPY } from "@/lib/copy";
import { getPublicPartnerViews } from "@/lib/routing";
import { ROUTES } from "@/lib/routes";
import {
  DossierPageHeader,
  PaperShell,
  Section,
  StampLabel,
} from "@/components/ui/design";

export const metadata = {
  title: "Verified IP support partners — SmartProBonoIP",
  description:
    "Browse verified external IP support partners. Identity-checked destinations — not endorsements or referrals. Preparation only.",
};

export default function PartnersPage() {
  const partners = getPublicPartnerViews();

  return (
    <div>
      <PageEvent event="partner_directory_viewed" />

      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">PARTNER DIRECTORY</StampLabel>
            <StampLabel tone="aqua">VERIFIED · NOT ENDORSEMENT</StampLabel>
          </>
        }
        kicker="External IP support"
        title={PARTNER_DIRECTORY_COPY.title}
        lead={PARTNER_DIRECTORY_COPY.lead}
        aside={
          <div className="flex flex-col gap-3">
            <Link href={ROUTES.learn} className="btn-secondary">
              Learn IP basics
            </Link>
            <Link href={ROUTES.disclaimer} className="btn-primary">
              Start patent readiness
            </Link>
            <Link href={ROUTES.trust} className="btn-ghost px-0">
              Trust Center →
            </Link>
          </div>
        }
      />

      <Section>
        <PaperShell>
          <PartnerDirectory partners={partners} />
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell className="pb-8">
          <DisclaimerNotice />
        </PaperShell>
      </Section>
    </div>
  );
}
