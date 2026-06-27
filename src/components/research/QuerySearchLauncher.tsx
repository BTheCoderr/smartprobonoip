"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics/client";
import {
  buildGooglePatentsUrl,
  buildUsptoSearchUrl,
  buildUsptoTrademarkSearchUrl,
  buildWebSearchUrl,
} from "@/lib/research/buildLinks";
import type { QueryGroup } from "@/lib/research/queryGroups";
import { recordShowsTrademarkSearch } from "@/lib/research/queryGroups";
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

  function trackExternalSearch(label: string, queryIndex: number) {
    trackEvent("external_search_opened", {
      projectId: record.id,
      metadata: { label, demo: record.isDemo ?? false, queryIndex },
    });
  }

  return (
    <Card>
      <CardHeader
        title="Search launcher"
        subtitle="Grouped search terms to try — possible similar references only."
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
                    {(group.category === "patent" || group.category === "general") && (
                      <>
                        <a
                          href={buildGooglePatentsUrl(item.query)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackExternalSearch("Google Patents", queryIndex)}
                          className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                        >
                          Open Google Patents
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
                          Open USPTO Patent Public Search
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
                        Open USPTO Trademark Search
                      </a>
                    )}
                    <a
                      href={buildWebSearchUrl(item.query)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackExternalSearch("Web search", queryIndex)}
                      className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                    >
                      Open web search
                    </a>
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
  );
}
