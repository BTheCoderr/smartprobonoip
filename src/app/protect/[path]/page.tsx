import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PageEvent } from "@/components/analytics/PageEvent";
import { ComingSoonPathPanel } from "@/components/platform/ComingSoonPathPanel";
import { getProtectionPath } from "@/lib/platform";
import type { ProtectionPathId } from "@/lib/platform/types";
import { ROUTES } from "@/lib/routes";

const SLUG_TO_PATH: Record<string, ProtectionPathId> = {
  patent: "patent",
  trademark: "trademark",
  copyright: "copyright",
  "trade-secret": "trade_secret",
  unsure: "unsure",
};

export function generateStaticParams() {
  return Object.keys(SLUG_TO_PATH).map((path) => ({ path }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string }>;
}): Promise<Metadata> {
  const { path: slug } = await params;
  const id = SLUG_TO_PATH[slug];
  const pathModule = id ? getProtectionPath(id) : undefined;
  if (!pathModule) {
    return { title: "Protection path — SmartProBonoIP" };
  }
  const available = pathModule.definition.status === "available";
  return {
    title: available
      ? `${pathModule.definition.label} readiness — SmartProBonoIP`
      : `${pathModule.definition.label} (coming soon) — SmartProBonoIP`,
    description: pathModule.definition.description,
  };
}

export default async function ProtectPathPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path: slug } = await params;
  const id = SLUG_TO_PATH[slug];
  const pathModule = id ? getProtectionPath(id) : undefined;

  if (!pathModule) {
    redirect(ROUTES.home);
  }

  if (
    pathModule.definition.status === "available" &&
    pathModule.hasReadinessWorkflow
  ) {
    redirect(pathModule.definition.entryHref);
  }

  return (
    <div>
      <PageEvent
        event="landing_viewed"
        metadata={{ pageSection: `protect_${pathModule.definition.id}` }}
      />
      <ComingSoonPathPanel module={pathModule} />
    </div>
  );
}
