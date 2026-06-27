import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LANDING_COPY } from "@/lib/copy";
import { Card } from "@/components/ui/Card";
import { DemoChecklist } from "@/components/DemoChecklist";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";

const AUDIENCE = [
  "Inventors",
  "Creators",
  "Students",
  "Founders",
  "Small businesses",
];

export default function ProductLanding() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-mist-200/80 bg-gradient-to-b from-white via-white to-surface">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,163,163,0.08),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(217,119,6,0.06),transparent_40%)]" />
        <div className="page-shell relative py-16 sm:py-24">
          <p className="section-kicker">
            {BRAND.product} · {BRAND.feature}
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
            {BRAND.tagline}
          </h1>
          <p className="section-lead max-w-3xl">{BRAND.positioning}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-navy-500">
            {BRAND.coreMessage}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/smartprobonoip/disclaimer" className="btn-primary">
              Start the readiness check
            </Link>
            <Link
              href="/smartprobonoip/disclaimer?demo=1"
              className="btn-secondary"
            >
              Try demo intake
            </Link>
            <Link href="/smartprobonoip/dashboard" className="btn-ghost">
              Partner dashboard
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {AUDIENCE.map((a) => (
              <span
                key={a}
                className="rounded-full border border-mist-200 bg-white/80 px-3.5 py-1.5 text-sm text-navy-600 shadow-sm"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {LANDING_COPY.valueCards.map((card, i) => (
            <Card key={card.title} variant="elevated" className="h-full">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-sm font-bold text-teal-700 ring-1 ring-teal-100">
                {i + 1}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-navy-900">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">
                {card.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell pb-16 sm:pb-20">
        <div className="mission-band">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">
            Our mission
          </p>
          <p className="mt-4 max-w-4xl text-2xl font-semibold leading-snug sm:text-3xl">
            {BRAND.coreMessage}
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-navy-100/90">
            {BRAND.mission}
          </p>
        </div>
      </section>

      <section className="page-shell pb-16 sm:pb-20">
        <h2 className="section-title">How it works</h2>
        <p className="section-lead">
          A guided path from messy notes to a packet you can bring to your next
          conversation.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_COPY.howItWorks.map((step, i) => (
            <Card key={step} variant="soft" className="relative">
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                Step {i + 1}
              </span>
              <p className="mt-3 text-base font-semibold leading-snug text-navy-900">
                {step}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell pb-20">
        <div className="mb-8">
          <DemoChecklist />
        </div>
        <DisclaimerNotice />
      </section>
    </div>
  );
}
