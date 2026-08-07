import Link from "next/link";
import { InterestForm } from "@/components/contact/InterestForm";
import {
  CalloutCard,
  PaperShell,
  Section,
  SectionHeader,
} from "@/components/ui/design";
import type { ProtectionPathModule } from "@/lib/platform/types";
import { ROUTES } from "@/lib/routes";
import { PLATFORM_SERVICES } from "@/lib/platform/registry";

/**
 * Shared shell for coming-soon protection paths.
 * Registers interest and documents the shared platform foundation —
 * does not invent fake intake or packet workflows.
 */
export function ComingSoonPathPanel({
  module,
}: {
  module: ProtectionPathModule;
}) {
  const { definition } = module;

  return (
    <div>
      <Section>
        <PaperShell narrow>
          <p className="section-kicker text-teal-700">Coming soon</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900">
            {definition.label}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-navy-600">
            {definition.description}
          </p>
          <CalloutCard
            tone="aqua"
            title="Phase 1 is patent-focused"
            body="SmartProBonoIP is evolving into a full IP Readiness Platform. Right now the live readiness workflow prepares inventors for patent conversations. This path is registered in the platform architecture and will reuse shared authentication, dashboard, document storage, AI orchestration, professional handoff, and portfolio tracking when it ships."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ROUTES.disclaimer} className="btn-primary">
              Start patent readiness instead
            </Link>
            <Link href={ROUTES.home} className="btn-secondary">
              Back to path chooser
            </Link>
            <Link href={ROUTES.learn} className="btn-ghost">
              Learn IP basics
            </Link>
          </div>
        </PaperShell>
      </Section>

      <Section soft>
        <PaperShell narrow>
          <SectionHeader
            kicker="Shared platform foundation"
            title="What every protection path will plug into"
            lead="Coming-soon paths are not empty stubs — they are registered modules waiting on the same services the patent path already uses."
          />
          <ul className="mt-8 space-y-4">
            {(
              [
                PLATFORM_SERVICES.auth,
                PLATFORM_SERVICES.dashboard,
                PLATFORM_SERVICES.documents,
                PLATFORM_SERVICES.aiOrchestration,
                PLATFORM_SERVICES.professionalHandoff,
                PLATFORM_SERVICES.portfolioTracking,
              ] as const
            ).map((service) => (
              <li
                key={service.id}
                className="rounded-xl border border-mist-200 bg-white px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-navy-900">
                    {service.id.replace(/_/g, " ")}
                  </p>
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-800">
                    {service.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {service.description}
                </p>
              </li>
            ))}
          </ul>
        </PaperShell>
      </Section>

      <Section id="interest">
        <PaperShell narrow>
          <SectionHeader
            kicker="Stay in the loop"
            title={`Get notified when ${definition.label} readiness opens`}
            lead="Tell us you are interested. Do not submit confidential invention or brand details here."
          />
          <div className="mt-8">
            <InterestForm id={`protect-${definition.id}-interest`} />
          </div>
        </PaperShell>
      </Section>
    </div>
  );
}
