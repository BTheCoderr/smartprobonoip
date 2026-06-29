"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { RESEARCH_PREP_COPY } from "@/lib/copy";
import { suggestCpcCodes } from "@/lib/cpcSuggestions";
import {
  buildOutboundSearchTools,
  resolveOutboundToolUrl,
  type OutboundSearchTool,
} from "@/lib/research/buildLinks";
import { trackEvent } from "@/lib/analytics/client";
import type { ProjectRecord } from "@/lib/types";

const TOOL_SECTIONS: {
  key: OutboundSearchTool["priority"];
  title: string;
  lead?: string;
}[] = [
  {
    key: "recommended",
    title: "Recommended starting points",
    lead: RESEARCH_PREP_COPY.outboundToolsRecommended,
  },
  {
    key: "secondary",
    title: "More search resources",
    lead: RESEARCH_PREP_COPY.outboundToolsSecondary,
  },
  {
    key: "optional",
    title: "Optional AI exploration",
    lead: RESEARCH_PREP_COPY.outboundToolsOptional,
  },
];

function ToolCard({
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
      className="dossier-card block px-4 py-4 transition hover:border-teal-200 hover:bg-teal-50/30"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-navy-900">{tool.label}</p>
        {tool.badge ? (
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-700">
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
      <div className="space-y-8">
        {TOOL_SECTIONS.map((section) => {
          const sectionTools = tools.filter((tool) => tool.priority === section.key);
          if (sectionTools.length === 0) return null;
          return (
            <div key={section.key}>
              <h3 className="text-sm font-semibold text-navy-900">{section.title}</h3>
              {section.lead ? (
                <p className="mt-1 text-xs leading-relaxed text-navy-600">{section.lead}</p>
              ) : null}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {sectionTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    primaryQuery={primaryQuery}
                    onOpen={openTool}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function CpcSuggestionPanel({ record }: { record: ProjectRecord }) {
  const suggestions = suggestCpcCodes(record);

  return (
    <div className="rounded-xl border border-warm-200 bg-warm-50/50 px-4 py-4">
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
