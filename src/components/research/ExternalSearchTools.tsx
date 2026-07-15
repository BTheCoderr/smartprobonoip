"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { FeaturedGooglePatentsCard } from "@/components/ui/FeaturedGooglePatentsCard";
import { RESEARCH_PREP_COPY } from "@/lib/copy";
import { suggestCpcCodes } from "@/lib/cpcSuggestions";
import {
  buildOutboundSearchTools,
  resolveOutboundToolUrl,
  type OutboundSearchTool,
} from "@/lib/research/buildLinks";
import { trackEvent } from "@/lib/analytics/client";
import type { ProjectRecord } from "@/lib/types";

function SecondaryToolCard({
  tool,
  primaryQuery,
  onOpen,
}: {
  tool: OutboundSearchTool;
  primaryQuery?: string;
  onOpen: (tool: OutboundSearchTool) => void;
}) {
  return (
    <a
      href={resolveOutboundToolUrl(tool, primaryQuery)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onOpen(tool)}
      className="dossier-card block px-4 py-4 transition hover:border-teal-200 hover:bg-teal-50/20"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-navy-900">{tool.label}</p>
        {tool.badge ? (
          <span className="rounded-full bg-mist-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-600">
            {tool.badge}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-navy-600">{tool.description}</p>
      <p className="mt-2 text-[11px] font-medium text-teal-700">Open tool →</p>
    </a>
  );
}

export function ExternalSearchTools({
  record,
  primaryQuery,
}: {
  record: ProjectRecord;
  primaryQuery?: string;
}) {
  const tools = buildOutboundSearchTools(primaryQuery);
  const googlePatents = tools.find((tool) => tool.id === "google_patents");
  const secondaryTools = tools.filter(
    (tool) => tool.priority === "secondary" || tool.priority === "optional",
  );

  function openTool(tool: OutboundSearchTool) {
    trackEvent("external_search_opened", {
      projectId: record.id,
      metadata: {
        label: tool.label,
        demo: record.isDemo ?? false,
        toolId: tool.id,
      },
    });
  }

  return (
    <Card>
      <CardHeader
        title={RESEARCH_PREP_COPY.outboundToolsTitle}
        subtitle={RESEARCH_PREP_COPY.outboundToolsLead}
      />
      <div className="space-y-6">
        {googlePatents ? (
          <div>
            <p className="text-sm font-semibold text-navy-900">
              Recommended starting point
            </p>
            <p className="mt-1 text-xs leading-relaxed text-navy-600">
              {RESEARCH_PREP_COPY.outboundToolsGooglePatentsLead}
            </p>
            <div className="mt-3">
              <FeaturedGooglePatentsCard
                query={primaryQuery}
                href={resolveOutboundToolUrl(googlePatents, primaryQuery)}
              />
            </div>
          </div>
        ) : null}

        <div>
          <h3 className="text-sm font-semibold text-navy-900">
            More search resources
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-navy-600">
            {RESEARCH_PREP_COPY.outboundToolsSecondary}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {secondaryTools
              .filter((tool) => tool.priority === "secondary")
              .map((tool) => (
                <SecondaryToolCard
                  key={tool.id}
                  tool={tool}
                  primaryQuery={primaryQuery}
                  onOpen={openTool}
                />
              ))}
          </div>
        </div>

        {secondaryTools.some((tool) => tool.priority === "optional") ? (
          <div>
            <h3 className="text-sm font-semibold text-navy-900">
              Optional AI exploration
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-navy-600">
              {RESEARCH_PREP_COPY.outboundToolsOptional}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {secondaryTools
                .filter((tool) => tool.priority === "optional")
                .map((tool) => (
                  <SecondaryToolCard
                    key={tool.id}
                    tool={tool}
                    primaryQuery={primaryQuery}
                    onOpen={openTool}
                  />
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function CpcSuggestionPanel({ record }: { record: ProjectRecord }) {
  const suggestions = suggestCpcCodes(record);

  return (
    <div className="rounded-xl border border-warm-200 bg-warm-50/50 px-4 py-4 sm:px-5 sm:py-5">
      <p className="text-sm font-semibold text-navy-900">
        {RESEARCH_PREP_COPY.cpcTitle}
      </p>
      {suggestions.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <li
              key={item.code}
              className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs text-navy-700"
            >
              <span className="font-semibold text-teal-800">{item.code}</span>
              <span className="text-navy-500"> · {item.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-navy-600">{RESEARCH_PREP_COPY.cpcEmpty}</p>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-navy-600">
        {RESEARCH_PREP_COPY.cpcDisclaimer}
      </p>
    </div>
  );
}
