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
  patent: "Patent searches",
  product: "Product searches",
  trademark: "Trademark / brand searches",
  design: "Design / appearance searches",
  general: "General web searches",
};

function hasSignal(record: ProjectRecord, signal: string): boolean {
  return record.profile.signals.includes(signal as never);
}

export function buildQueryGroups(record: ProjectRecord): QueryGroup[] {
  const cards = buildSuggestedQueryCards(record);
  const groups: Record<QueryCategory, SuggestedQueryCard[]> = {
    patent: [],
    product: [],
    trademark: [],
    design: [],
    general: [],
  };

  cards.forEach((card, index) => {
    groups.patent.push(card);
    if (index % 2 === 0) groups.product.push(card);
    if (index % 3 === 0) groups.general.push(card);
    if (hasSignal(record, "trademark_brand")) groups.trademark.push(card);
    if (hasSignal(record, "design_appearance")) groups.design.push(card);
  });

  if (groups.product.length === 0 && cards[0]) groups.product.push(cards[0]);
  if (groups.general.length === 0) groups.general.push(...cards.slice(0, 2));

  return (Object.keys(groups) as QueryCategory[])
    .filter((category) => groups[category].length > 0)
    .map((category) => ({
      category,
      title: GROUP_TITLES[category],
      queries: groups[category],
    }));
}

export function recordShowsTrademarkSearch(record: ProjectRecord): boolean {
  return hasSignal(record, "trademark_brand");
}
