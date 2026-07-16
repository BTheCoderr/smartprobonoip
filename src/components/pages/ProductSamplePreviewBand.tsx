import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { PaperShell, Section, SectionHeader } from "@/components/ui/design";

const SAMPLE_HIGHLIGHTS = [
  "Full IP Readiness Packet (fictional HydroSeal demo)",
  "Interactive review panel with readiness score",
  "Similar-reference research workspace with outbound search tools",
  "PDF download and professional JSON export",
  "Connect resource categories and after-meeting guidance",
] as const;

export function ProductSamplePreviewBand() {
  return (
    <Section>
      <PaperShell>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader
              kicker="Live sample preview"
              title="Open the full sample packet — not a screenshot"
              lead="The sample packet is a working demo of the product: readiness review, research workspace, exports, and resource routing. Preparation only — not legal advice."
            />
            <ul className="mt-6 space-y-2 text-sm text-navy-700">
              {SAMPLE_HIGHLIGHTS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-navy-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={ROUTES.sample} className="btn-primary">
                Open live sample packet
              </Link>
              <Link href={ROUTES.disclaimerDemo} className="btn-secondary">
                Try demo intake
              </Link>
            </div>
            <p className="mt-4 text-xs text-navy-500">
              Product video walkthrough is not included in v1.0 — use the live sample and UI previews below.
            </p>
          </div>
          <div className="paper-card-elevated border-navy-100 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-500">
              Sample · HydroSeal
            </p>
            <p className="mt-3 font-serif text-lg font-bold text-navy-900">
              Portable water filter bottle
            </p>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Readiness score · timeline · materials · similar-reference prep · expert questions — all in one packet.
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist-200">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-navy-500 to-navy-600" />
            </div>
            <p className="mt-2 text-xs text-navy-500">Example readiness score · preparation only</p>
          </div>
        </div>
      </PaperShell>
    </Section>
  );
}
