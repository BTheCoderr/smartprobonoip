import { buildPatentSearchPrep } from "@/lib/patentSearchPrep";
import type { SuggestedQueryCard } from "@/lib/research/types";
import type { ProjectRecord } from "@/lib/types";

const USPTO_PATENT_PUBLIC_SEARCH =
  "https://ppubs.uspto.gov/pubwebapp/static/pages/ppubsbasic.html";

export interface OutboundSearchTool {
  id: string;
  label: string;
  description: string;
  url: string;
  supportsQuery: boolean;
  categories: ("patent" | "product" | "general" | "ai")[];
  priority: "recommended" | "secondary" | "optional";
  badge?: string;
}

export function buildGooglePatentsUrl(query: string): string {
  return `https://patents.google.com/?q=${encodeURIComponent(query)}`;
}

export function buildUsptoSearchUrl(): string {
  return USPTO_PATENT_PUBLIC_SEARCH;
}

export function buildWebSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function buildUsptoTrademarkSearchUrl(query: string): string {
  return `https://tmsearch.uspto.gov/search/search-results?query=${encodeURIComponent(query)}`;
}

export function buildWipoPatentscopeUrl(query?: string): string {
  if (query?.trim()) {
    return `https://patentscope.wipo.int/search/en/result.jsf?query=${encodeURIComponent(query)}`;
  }
  return "https://patentscope.wipo.int/search/en/search.jsf";
}

export function buildEspacenetUrl(query?: string): string {
  if (query?.trim()) {
    return `https://worldwide.espacenet.com/patent/search?q=${encodeURIComponent(query)}`;
  }
  return "https://worldwide.espacenet.com/";
}

export function buildLensPatentUrl(query?: string): string {
  if (query?.trim()) {
    return `https://www.lens.org/lens/search/patent/list?q=${encodeURIComponent(query)}`;
  }
  return "https://www.lens.org/lens/search/patent/";
}

export function buildPqaiUrl(query?: string): string {
  if (query?.trim()) {
    return `https://pqai.io/?q=${encodeURIComponent(query)}`;
  }
  return "https://pqai.io/";
}

export function buildOutboundSearchTools(primaryQuery?: string): OutboundSearchTool[] {
  const query = primaryQuery?.trim() || "";
  return [
    {
      id: "google_patents",
      label: "Google Patents",
      badge: "Recommended",
      description:
        "Best overall for most users — search published patents and applications worldwide. Preparation only, not a patentability opinion.",
      url: query ? buildGooglePatentsUrl(query) : "https://patents.google.com/",
      supportsQuery: true,
      categories: ["patent", "general"],
      priority: "recommended",
    },
    {
      id: "uspto",
      label: "USPTO Patent Public Search",
      badge: "Recommended",
      description:
        "Best for formal US patent work — official US patent document search workspace.",
      url: buildUsptoSearchUrl(),
      supportsQuery: false,
      categories: ["patent"],
      priority: "recommended",
    },
    {
      id: "lens",
      label: "The Lens",
      badge: "Recommended",
      description:
        "Best for comprehensive research — patents plus scholarly articles and possible similar references.",
      url: buildLensPatentUrl(query),
      supportsQuery: true,
      categories: ["patent", "general"],
      priority: "recommended",
    },
    {
      id: "wipo",
      label: "WIPO PATENTSCOPE",
      description: "International patent collection and PCT materials.",
      url: buildWipoPatentscopeUrl(query),
      supportsQuery: true,
      categories: ["patent"],
      priority: "secondary",
    },
    {
      id: "espacenet",
      label: "Espacenet",
      description: "European and worldwide patent database search.",
      url: buildEspacenetUrl(query),
      supportsQuery: true,
      categories: ["patent"],
      priority: "secondary",
    },
    {
      id: "web",
      label: "Web search",
      description: "Find products, articles, and public pages that may look similar.",
      url: query ? buildWebSearchUrl(query) : "https://www.google.com/",
      supportsQuery: true,
      categories: ["product", "general"],
      priority: "secondary",
    },
    {
      id: "uspto_trademark",
      label: "USPTO Trademark Search",
      description: "Explore possible brand or name overlaps — not a clearance opinion.",
      url: query ? buildUsptoTrademarkSearchUrl(query) : "https://tmsearch.uspto.gov/",
      supportsQuery: true,
      categories: ["product"],
      priority: "secondary",
    },
    {
      id: "pqai",
      label: "PQAI (optional)",
      badge: "Optional AI",
      description:
        "Optional free AI-assisted search exploration — limited free tier. Treat results as starter prompts only and verify with an expert.",
      url: buildPqaiUrl(query),
      supportsQuery: true,
      categories: ["patent", "ai"],
      priority: "optional",
    },
  ];
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

export function resolveOutboundToolUrl(
  tool: OutboundSearchTool,
  query?: string,
): string {
  if (!tool.supportsQuery || !query?.trim()) return tool.url;
  switch (tool.id) {
    case "google_patents":
      return buildGooglePatentsUrl(query);
    case "wipo":
      return buildWipoPatentscopeUrl(query);
    case "espacenet":
      return buildEspacenetUrl(query);
    case "lens":
      return buildLensPatentUrl(query);
    case "pqai":
      return buildPqaiUrl(query);
    case "web":
      return buildWebSearchUrl(query);
    case "uspto_trademark":
      return buildUsptoTrademarkSearchUrl(query);
    default:
      return tool.url;
  }
}
