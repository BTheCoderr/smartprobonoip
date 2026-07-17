import { TrackedNavLink } from "@/components/analytics/TrackedNavLink";
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
              title="Open the full sample packet — then start yours"
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
              <TrackedNavLink
                href={ROUTES.sample}
                event="sample_packet_viewed"
                metadata={{ ctaName: "homepage_open_sample", pageSection: "sample_band" }}
                className="btn-primary"
              >
                Open live sample packet
              </TrackedNavLink>
              <TrackedNavLink
                href={ROUTES.disclaimerDemo}
                event="demo_started"
                metadata={{ ctaName: "homepage_start_example", pageSection: "sample_band" }}
                className="btn-secondary"
              >
                Start with this example
              </TrackedNavLink>
              <TrackedNavLink
                href={ROUTES.disclaimer}
                event="start_clicked"
                metadata={{ ctaName: "homepage_start_own", pageSection: "sample_band" }}
                className="btn-ghost"
              >
                Start your own packet
              </TrackedNavLink>
            </div>
            <p className="mt-4 text-xs text-navy-500">
              Watch the official product demo on this page, or open the live sample packet below.
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
