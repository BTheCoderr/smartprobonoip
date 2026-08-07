import Link from "next/link";
import { PageEvent } from "@/components/analytics/PageEvent";
import { Card, CardHeader } from "@/components/ui/Card";
import { PartnerExternalLink } from "@/components/partners/PartnerExternalLink";
import {
  formatAudience,
  formatLastVerified,
  formatPartnerAvailability,
  formatPartnerOrgType,
  formatServiceCategory,
  getPartnerAvailability,
  getPartnerWhyMayHelp,
  type PublicPartnerView,
} from "@/lib/routing";
import { PARTNER_DIRECTORY_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";

export function PartnerDetailView({ partner }: { partner: PublicPartnerView }) {
  const availability = getPartnerAvailability(partner);

  return (
    <div>
      <PageEvent
        event="partner_profile_viewed"
        metadata={{
          partnerId: partner.id,
          organizationType: partner.orgType,
        }}
      />

      <Card variant="elevated">
        <CardHeader
          kicker={formatPartnerOrgType(partner.orgType)}
          title={partner.name}
          subtitle={partner.description}
        />

        <div className="space-y-5 text-sm leading-relaxed text-navy-700">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {PARTNER_DIRECTORY_COPY.whyMayHelp}
            </h2>
            <p className="mt-1.5">{getPartnerWhyMayHelp(partner)}</p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {PARTNER_DIRECTORY_COPY.audiences}
            </h2>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              {partner.audiences.map((audience) => (
                <li key={audience}>{formatAudience(audience)}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {PARTNER_DIRECTORY_COPY.services}
            </h2>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              {partner.serviceCategories.map((category) => (
                <li key={category}>{formatServiceCategory(category)}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {PARTNER_DIRECTORY_COPY.doesNotDo}
            </h2>
            <p className="mt-1.5">{partner.disclaimer}</p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {PARTNER_DIRECTORY_COPY.jurisdictions}
            </h2>
            <p className="mt-1.5">
              {partner.geography.join(" · ")} — {partner.jurisdictions.join(" · ")}
            </p>
          </section>

          {partner.eligibilityNotes ? (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                {PARTNER_DIRECTORY_COPY.eligibility}
              </h2>
              <p className="mt-1.5">{partner.eligibilityNotes}</p>
            </section>
          ) : null}

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {PARTNER_DIRECTORY_COPY.availability}
            </h2>
            <p className="mt-1.5">{formatPartnerAvailability(availability)}</p>
          </section>

          <section className="rounded-xl border border-teal-200/80 bg-teal-50/40 px-4 py-3 text-xs text-navy-600">
            <p className="font-semibold text-navy-700">
              Verified · {PARTNER_DIRECTORY_COPY.lastVerified}{" "}
              {formatLastVerified(partner.lastVerifiedAt)}
            </p>
            <p className="mt-1">{PARTNER_DIRECTORY_COPY.verificationNote}</p>
          </section>

          <section className="rounded-xl border border-mist-200/80 bg-mist-50/50 px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              SmartProBonoIP boundary
            </h2>
            <p className="mt-1.5 text-navy-600">
              {PARTNER_DIRECTORY_COPY.boundaryNote}
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {PARTNER_DIRECTORY_COPY.prepareBeforeContact}
            </h2>
            <p className="mt-1.5 text-navy-600">
              {PARTNER_DIRECTORY_COPY.prepareBeforeContactNote}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href={ROUTES.disclaimer} className="btn-secondary text-sm">
                Start patent readiness
              </Link>
              <Link href={ROUTES.learn} className="btn-ghost text-sm">
                Learn IP basics
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {PARTNER_DIRECTORY_COPY.officialDestination}
            </h2>
            <PartnerExternalLink
              partnerId={partner.id}
              label={`Continue to ${partner.name} ↗`}
            />
          </section>
        </div>

        <Link
          href={ROUTES.partners}
          className="link-brand mt-6 inline-block text-sm font-semibold"
        >
          ← {PARTNER_DIRECTORY_COPY.backToDirectory}
        </Link>
      </Card>
    </div>
  );
}
