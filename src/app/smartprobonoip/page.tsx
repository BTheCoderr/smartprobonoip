import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Card } from "@/components/ui/Card";
import { DemoChecklist } from "@/components/DemoChecklist";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";

const STEPS = [
  {
    title: "Guided intake",
    body: "Answer plain-language questions about your idea — no jargon required.",
  },
  {
    title: "IP Readiness Profile",
    body: "Get an organized, structured summary of your idea and possible IP signals.",
  },
  {
    title: "Suggested next resource",
    body: "See where to go next: education, a clinic, a pro bono program, or an expert.",
  },
];

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
      <section className="border-b border-mist-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-teal-600">
            {BRAND.product} · {BRAND.feature}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-navy-900 sm:text-5xl">
            {BRAND.tagline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-navy-600">
            {BRAND.positioning}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/smartprobonoip/disclaimer"
              className="rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700"
            >
              Start the readiness check
            </Link>
            <Link
              href="/smartprobonoip/disclaimer?demo=1"
              className="rounded-lg border border-teal-300 bg-teal-50 px-6 py-3 font-semibold text-teal-800 transition hover:bg-teal-100"
            >
              Try demo intake
            </Link>
            <Link
              href="/smartprobonoip/dashboard"
              className="rounded-lg border border-mist-300 px-6 py-3 font-semibold text-navy-700 transition hover:bg-mist-100"
            >
              View partner dashboard
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {AUDIENCE.map((a) => (
              <span
                key={a}
                className="rounded-full bg-mist-100 px-3 py-1 text-sm text-navy-600"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-navy-900 p-8 text-white sm:p-10">
          <h2 className="text-xl font-semibold text-teal-300">
            What matters most
          </h2>
          <p className="mt-2 max-w-3xl text-2xl font-semibold leading-snug">
            {BRAND.coreMessage}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl font-bold text-navy-900">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Card key={s.title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 font-semibold text-teal-700">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-navy-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-navy-500">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-8">
          <DemoChecklist />
        </div>
        <DisclaimerNotice />
      </section>
    </div>
  );
}
