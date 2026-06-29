"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { RESEARCH_PREP_COPY } from "@/lib/copy";
import { trackEvent } from "@/lib/analytics/client";
import {
  buildEspacenetUrl,
  buildGooglePatentsUrl,
  buildLensPatentUrl,
  buildPqaiUrl,
  buildUsptoSearchUrl,
  buildUsptoTrademarkSearchUrl,
  buildWebSearchUrl,
  buildWipoPatentscopeUrl,
} from "@/lib/research/buildLinks";
import type { QueryGroup } from "@/lib/research/queryGroups";
import { recordShowsTrademarkSearch } from "@/lib/research/queryGroups";
import {
  CpcSuggestionPanel,
  ExternalSearchTools,
} from "@/components/research/ExternalSearchTools";
import type { ProjectRecord } from "@/lib/types";

export function QuerySearchLauncher({
  record,
  queryGroups,
  onCopyQuery,
  onPrefillQuery,
}: {
  record: ProjectRecord;
  queryGroups: QueryGroup[];
  onCopyQuery: (query: string, queryIndex: number) => void;
  onPrefillQuery: (query: string) => void;
}) {
  const showTrademark = recordShowsTrademarkSearch(record);
  const primaryQuery = queryGroups[0]?.queries[0]?.query;

  function trackExternalSearch(label: string, queryIndex: number) {
    trackEvent("external_search_opened", {
      projectId: record.id,
      metadata: { label, demo: record.isDemo ?? false, queryIndex },
    });
  }

  return (
    <div className="space-y-6">
      <ExternalSearchTools record={record} primaryQuery={primaryQuery} />
      <CpcSuggestionPanel record={record} />

      <Card>
        <CardHeader
          title={RESEARCH_PREP_COPY.groupedQueriesTitle}
          subtitle={RESEARCH_PREP_COPY.groupedQueriesLead}
        />
        <div className="space-y-6">
          {queryGroups.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-navy-900">{group.title}</h3>
              <ul className="mt-3 space-y-4">
                {group.queries.map((item, queryIndex) => (
                  <li
                    key={`${group.category}-${item.query}`}
                    className="rounded-xl border border-mist-200 bg-mist-50/60 p-4"
                  >
                    <p className="text-sm font-medium text-navy-900">{item.query}</p>
                    <p className="mt-1 text-xs leading-relaxed text-navy-600">
                      {item.whyItMayHelp}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(group.category === "patent" ||
                        group.category === "design" ||
                        group.category === "general") && (
                        <>
                          <a
                            href={buildGooglePatentsUrl(item.query)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackExternalSearch("Google Patents", queryIndex)}
                            className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                          >
                            Google Patents
                          </a>
                          <a
                            href={buildUsptoSearchUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              trackExternalSearch("USPTO Patent Public Search", queryIndex)
                            }
                            className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                          >
                            USPTO
                          </a>
                          <a
                            href={buildWipoPatentscopeUrl(item.query)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackExternalSearch("WIPO PATENTSCOPE", queryIndex)}
                            className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                          >
                            WIPO
                          </a>
                          <a
                            href={buildEspacenetUrl(item.query)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackExternalSearch("Espacenet", queryIndex)}
                            className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                          >
                            Espacenet
                          </a>
                          <a
                            href={buildLensPatentUrl(item.query)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackExternalSearch("The Lens", queryIndex)}
                            className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                          >
                            The Lens
                          </a>
                          <a
                            href={buildPqaiUrl(item.query)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackExternalSearch("PQAI", queryIndex)}
                            className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                          >
                            PQAI
                          </a>
                        </>
                      )}
                      {group.category === "trademark" && showTrademark && (
                        <a
                          href={buildUsptoTrademarkSearchUrl(item.query)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackExternalSearch("USPTO Trademark Search", queryIndex)
                          }
                          className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                        >
                          USPTO Trademark
                        </a>
                      )}
                      {(group.category === "product" || group.category === "general") && (
                        <a
                          href={buildWebSearchUrl(item.query)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackExternalSearch("Web search", queryIndex)}
                          className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                        >
                          Web search
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onCopyQuery(item.query, queryIndex)}
                        className="rounded-lg border border-mist-300 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-white"
                      >
                        Copy query
                      </button>
                      <button
                        type="button"
                        onClick={() => onPrefillQuery(item.query)}
                        className="rounded-lg border border-mist-300 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-white"
                      >
                        Save as research note
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
