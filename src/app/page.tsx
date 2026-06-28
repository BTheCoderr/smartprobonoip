import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Card } from "@/components/ui/Card";
import { InterestForm } from "@/components/contact/InterestForm";
import { PartnerInterestLink } from "@/components/analytics/PartnerInterestLink";

const PRODUCTS = [
  {
    name: "SmartProBonoIP",
    status: "Available now",
    available: true,
    href: "/smartprobonoip",
    description:
      "AI-powered IP readiness and referral tool. Organize your idea before you reach an expert.",
  },
  {
    name: "More coming soon",
    status: "In planning",
    available: false,
    href: "#",
    description:
      "Additional pro bono tools to help overlooked innovators get ready for the right support.",
  },
];

export default function UmbrellaLanding() {
  return (
    <div>
      <section className="bg-gradient-to-b from-navy-900 to-navy-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-teal-300">
            {BRAND.umbrella}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Pro bono tools that help overlooked innovators get ready for the
            right support.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-navy-100">
            {BRAND.umbrella} is a platform of practical, educational tools. Our
            first product helps you organize your idea so experts can help you
            faster.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/smartprobonoip"
              className="rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white transition hover:bg-teal-600"
            >
              Explore SmartProBonoIP
            </Link>
            <Link
              href="/smartprobonoip/disclaimer?demo=1"
              className="rounded-lg border border-teal-300 bg-teal-50 px-6 py-3 font-semibold text-teal-800 transition hover:bg-teal-100"
            >
              Try demo intake
            </Link>
            <PartnerInterestLink
              href="/contact"
              ctaName="Contact"
              pageSection="homepage_hero"
              className="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Partner or contact us
            </PartnerInterestLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-navy-900">Products</h2>
        <p className="mt-1 text-navy-500">
          The first product under the {BRAND.umbrella} umbrella.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Card key={p.name} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-navy-900">
                  {p.name}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    p.available
                      ? "bg-teal-50 text-teal-700"
                      : "bg-mist-100 text-navy-500"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <p className="flex-1 text-sm text-navy-500">{p.description}</p>
              {p.available ? (
                <Link
                  href={p.href}
                  className="mt-4 inline-block font-medium text-teal-600 hover:text-teal-700"
                >
                  Open product →
                </Link>
              ) : (
                <span className="mt-4 inline-block text-sm text-navy-300">
                  Coming soon
                </span>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <InterestForm />
      </section>
    </div>
  );
}
