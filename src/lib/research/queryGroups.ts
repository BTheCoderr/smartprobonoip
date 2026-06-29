import type { SuggestedQueryCard } from "./types";
import type { ProjectRecord } from "@/lib/types";
import { buildSuggestedQueryCards } from "./buildLinks";

export type QueryCategory =
  | "patent"
  | "product"
  | "trademark"
  | "design"
  | "general";

export interface QueryGroup {
  category: QueryCategory;
  title: string;
  queries: SuggestedQueryCard[];
}

const GROUP_TITLES: Record<QueryCategory, string> = {
  patent: "Patent search starters",
  product: "Product & market search starters",
  trademark: "Trademark / brand search starters",
  design: "Design / appearance search starters",
  general: "Web search starters",
};

function hasSignal(record: ProjectRecord, signal: string): boolean {
  return record.profile.signals.includes(signal as never);
}

function uniqueQueries(cards: SuggestedQueryCard[]): SuggestedQueryCard[] {
  const seen = new Set<string>();
  return cards.filter((card) => {
    const key = card.query.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildQueryGroups(record: ProjectRecord): QueryGroup[] {
  const cards = buildSuggestedQueryCards(record);
  if (cards.length === 0) return [];

  const patent = uniqueQueries([cards[0], cards[2], cards[4]].filter(Boolean));
  const product = uniqueQueries([cards[1], cards[3]].filter(Boolean));
  const general = uniqueQueries(cards.slice(0, 3));
  const trademark = hasSignal(record, "trademark_brand")
    ? uniqueQueries([cards[0], cards[1]].filter(Boolean))
    : [];
  const design = hasSignal(record, "design_appearance")
    ? uniqueQueries([cards[1], cards[2]].filter(Boolean))
    : [];

  const groups: QueryGroup[] = [];
  if (patent.length > 0) {
    groups.push({ category: "patent", title: GROUP_TITLES.patent, queries: patent });
  }
  if (product.length > 0) {
    groups.push({ category: "product", title: GROUP_TITLES.product, queries: product });
  }
  if (trademark.length > 0) {
    groups.push({
      category: "trademark",
      title: GROUP_TITLES.trademark,
      queries: trademark,
    });
  }
  if (design.length > 0) {
    groups.push({ category: "design", title: GROUP_TITLES.design, queries: design });
  }
  if (general.length > 0) {
    groups.push({ category: "general", title: GROUP_TITLES.general, queries: general });
  }

  return groups;
}

export function recordShowsTrademarkSearch(record: ProjectRecord): boolean {
  return hasSignal(record, "trademark_brand");
}

export function primaryStarterQuery(record: ProjectRecord): string | undefined {
  return buildSuggestedQueryCards(record)[0]?.query;
}
