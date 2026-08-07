import Link from "next/link";
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

export function PartnerCard({ partner }: { partner: PublicPartnerView }) {
  const availability = getPartnerAvailability(partner);

  return (
    <article className="rounded-xl border border-mist-200 bg-gradient-to-br from-white to-cream/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
            {formatPartnerOrgType(partner.orgType)}
          </p>
          <h3 className="mt-1 text-base font-semibold text-navy-900">
            <Link
              href={ROUTES.partnerDetail(partner.id)}
              className="hover:text-teal-800 hover:underline"
            >
              {partner.name}
            </Link>
          </h3>
        </div>
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 ring-1 ring-teal-100">
          {formatPartnerAvailability(availability)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-navy-700">
        {partner.description}
      </p>

      <p className="mt-3 text-xs leading-relaxed text-navy-600">
        <span className="font-semibold text-navy-700">
          {PARTNER_DIRECTORY_COPY.whyMayHelp}:{" "}
        </span>
        {getPartnerWhyMayHelp(partner)}
      </p>

      <dl className="mt-4 space-y-2 text-xs text-navy-600">
        <div>
          <dt className="font-semibold text-navy-700">
            {PARTNER_DIRECTORY_COPY.jurisdictions}
          </dt>
          <dd className="mt-0.5">
            {partner.geography.join(" · ")} — {partner.jurisdictions.join(" · ")}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-navy-700">
            {PARTNER_DIRECTORY_COPY.services}
          </dt>
          <dd className="mt-0.5">
            {partner.serviceCategories.map(formatServiceCategory).join(" · ")}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-navy-700">
            {PARTNER_DIRECTORY_COPY.audiences}
          </dt>
          <dd className="mt-0.5">
            {partner.audiences.map(formatAudience).join(" · ")}
          </dd>
        </div>
        {partner.eligibilityNotes ? (
          <div>
            <dt className="font-semibold text-navy-700">
              {PARTNER_DIRECTORY_COPY.eligibility}
            </dt>
            <dd className="mt-0.5">{partner.eligibilityNotes}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-500">
        <span>
          Verified · {PARTNER_DIRECTORY_COPY.lastVerified}{" "}
          {formatLastVerified(partner.lastVerifiedAt)}
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-navy-500">
        {partner.disclaimer}
      </p>

      <Link
        href={ROUTES.partnerDetail(partner.id)}
        className="link-brand mt-4 inline-block text-sm font-semibold"
      >
        View partner details →
      </Link>
    </article>
  );
}
