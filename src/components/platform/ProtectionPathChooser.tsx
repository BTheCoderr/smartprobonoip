"use client";

import Link from "next/link";
import { TrackedNavLink } from "@/components/analytics/TrackedNavLink";
import { listChooserPaths } from "@/lib/platform";
import type { ProtectionPathModule } from "@/lib/platform/types";
import { ROUTES } from "@/lib/routes";

function PathCard({ module }: { module: ProtectionPathModule }) {
  const { definition } = module;
  const available = definition.status === "available";

  const className = available
    ? "group flex h-full flex-col rounded-2xl border border-teal-200/90 bg-white p-5 shadow-[var(--shadow-soft)] transition hover:border-teal-400 hover:shadow-md"
    : "flex h-full flex-col rounded-2xl border border-dashed border-mist-300 bg-mist-50/60 p-5";

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-lg font-semibold ${
            available ? "text-navy-900" : "text-navy-600"
          }`}
        >
          {definition.label}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            available
              ? "bg-teal-100 text-teal-800"
              : "bg-mist-200/80 text-navy-500"
          }`}
        >
          {definition.badge ??
            (available ? "Available" : "Coming soon")}
        </span>
      </div>
      <p
        className={`mt-3 flex-1 text-sm leading-relaxed ${
          available ? "text-navy-600" : "text-navy-500"
        }`}
      >
        {definition.description}
      </p>
      <p
        className={`mt-4 text-sm font-medium ${
          available ? "text-teal-700 group-hover:text-teal-900" : "text-navy-400"
        }`}
      >
        {available ? "Start patent readiness →" : "Notify me when available →"}
      </p>
    </>
  );

  if (available) {
    return (
      <TrackedNavLink
        href={definition.entryHref}
        event="start_clicked"
        metadata={{
          ctaName: "protection_path_patent",
          pageSection: "path_chooser",
        }}
        className={className}
      >
        {body}
      </TrackedNavLink>
    );
  }

  return (
    <Link href={definition.interestHref} className={className}>
      {body}
    </Link>
  );
}

export function ProtectionPathChooser({
  heading = "What are you trying to protect?",
  lead = "Choose a protection path. Phase 1 focuses on patent readiness for inventors. Other paths share the same platform foundation and will open in later phases.",
}: {
  heading?: string;
  lead?: string;
}) {
  const paths = listChooserPaths();

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="section-kicker text-teal-700">IP Readiness Platform</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
          {heading}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">
          {lead}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paths.map((module) => (
          <PathCard key={module.definition.id} module={module} />
        ))}
      </div>

      <p className="text-xs leading-relaxed text-navy-500">
        Preparation only — not legal advice. SmartProBonoIP does not decide which
        protection fits your situation.{" "}
        <Link href={ROUTES.learn} className="font-medium text-teal-700 hover:text-teal-900">
          Learn IP basics
        </Link>{" "}
        or{" "}
        <Link href={ROUTES.sample} className="font-medium text-teal-700 hover:text-teal-900">
          view a sample patent packet
        </Link>
        .
      </p>
    </div>
  );
}
