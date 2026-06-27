import { buildPatentSearchPrep } from "@/lib/patentSearchPrep";
import type { SuggestedQueryCard } from "@/lib/research/types";
import type { ProjectRecord } from "@/lib/types";

const USPTO_PATENT_PUBLIC_SEARCH =
  "https://ppubs.uspto.gov/pubwebapp/static/pages/ppubsbasic.html";

export function buildGooglePatentsUrl(query: string): string {
  return `https://patents.google.com/?q=${encodeURIComponent(query)}`;
}

export function buildUsptoSearchUrl(): string {
  return USPTO_PATENT_PUBLIC_SEARCH;
}

function whyQueryMayHelp(query: string, index: number): string {
  if (index === 0) {
    return "This broad query may help you explore possible similar references in your general topic area.";
  }
  if (query.length > 60) {
    return "This more specific query may help narrow possible similar references to features you described.";
  }
  return "This query may help you explore another angle on possible similar references — not a legal conclusion.";
}

export function buildSuggestedQueryCards(record: ProjectRecord): SuggestedQueryCard[] {
  const prep = buildPatentSearchPrep(record);
  return prep.suggestedQueries.map((query, index) => ({
    query,
    whyItMayHelp: whyQueryMayHelp(query, index),
  }));
}

export function buildResearchPrepFromRecord(record: ProjectRecord) {
  const prep = buildPatentSearchPrep(record);
  return {
    searchKeywords: prep.searchKeywords,
    suggestedQueries: buildSuggestedQueryCards(record),
  };
}
