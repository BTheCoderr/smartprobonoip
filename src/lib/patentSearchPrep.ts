import { ITEM_TYPE_LABELS } from "./labels";
import {
  extractProductNameFromAnswers,
  filterBlockedTokens,
  isBlockedToken,
  isMostlyUrl,
  isUrlOrRoute,
  normalizeAnswersForPacket,
} from "./intakeValidation";
import {
  cleanSearchQuery,
  cleanText,
  extractBrandName,
  stripBlockedTokensFromQuery,
} from "./textCleanup";
import { containsForbiddenLanguage } from "./safety";
import type { IntakeAnswers, ProjectRecord } from "./types";

export interface ExternalSearchLink {
  label: string;
  url: string;
  queryHint: string;
}

export interface WorksheetRow {
  searchQueryUsed: string;
  referenceFound: string;
  looksSimilar: string;
  seemsDifferent: string;
  questionsForExpert: string;
}

export interface PatentSearchPrep {
  searchKeywords: string[];
  suggestedQueries: string[];
  externalSearchLinks: ExternalSearchLink[];
  worksheetRows: WorksheetRow[];
  expertPrepQuestions: string[];
  safeDisclaimer: string;
}

export const PATENT_SEARCH_PREP_INTRO =
  "This section helps you prepare for prior art and similar patent research before meeting an expert. These are search terms to try and possible similar references to explore — not a legal conclusion about patentability, novelty, clearance, or infringement.";

export const PATENT_SEARCH_PREP_DISCLAIMER =
  "Similar Patent Discovery Prep does not determine patentability, novelty, clearance, infringement, or legal rights. Possible similar references should be reviewed by a patent agent, attorney, clinic, mentor, or innovation partner. This is not a legal conclusion.";

export const WORKSHEET_HEADERS = [
  "Search query used",
  "Reference or patent found",
  "What looks similar",
  "What seems different",
  "Questions to ask an expert",
] as const;

const USPTO_PATENT_PUBLIC_SEARCH =
  "https://ppubs.uspto.gov/pubwebapp/static/pages/ppubsbasic.html";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "as", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "can", "that", "this", "these", "those", "it", "its", "my",
  "your", "our", "their", "what", "which", "who", "how", "when", "where", "why",
  "not", "also", "just", "very", "about", "into", "through", "during", "before",
  "after", "above", "below", "between", "under", "over", "such", "some", "any",
  "all", "each", "other", "more", "most", "than", "then", "there", "here", "they",
  "them", "you", "we", "often", "lets", "let", "without", "extra", "like", "unlike",
  "while", "through", "using", "used", "uses",
]);

const MATERIAL_TERMS = [
  "carbon",
  "ceramic",
  "filter",
  "cartridge",
  "mesh",
  "silicone",
  "bpa-free",
  "compostable",
  "activated",
];

function extractKeywords(text: string, limit = 8): string[] {
  if (!text?.trim() || isUrlOrRoute(text) || isMostlyUrl(text)) return [];

  const brand = extractBrandName(text);
  const words = text
    .toLowerCase()
    .replace(/https?:\/\/[^\s]+/g, " ")
    .replace(/www\.[^\s]+/g, " ")
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 2 &&
        !STOP_WORDS.has(w) &&
        !isBlockedToken(w) &&
        !(brand && w === brand.toLowerCase()),
    );

  const seen = new Set<string>();
  const result: string[] = [];
  for (const w of words) {
    if (!seen.has(w)) {
      seen.add(w);
      result.push(w);
    }
    if (result.length >= limit) break;
  }
  return filterBlockedTokens(result);
}

function phraseJoin(...groups: string[][]): string {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const group of groups) {
    for (const w of group) {
      const key = w.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        words.push(w);
      }
    }
  }
  return stripBlockedTokensFromQuery(words.join(" "));
}

function productNouns(answers: IntakeAnswers): string[] {
  const fromCreated = extractKeywords(answers.whatCreated, 6);
  const fromParts = extractKeywords(answers.mainParts, 5);
  const item = ITEM_TYPE_LABELS[answers.itemType]?.toLowerCase() ?? "product";
  const nouns = [...fromCreated, ...fromParts];
  if (item.includes("physical")) nouns.push("portable", "device");
  if (item.includes("software")) nouns.push("software", "application");
  return nouns.slice(0, 8);
}

function textBlob(answers: IntakeAnswers): string {
  return [
    answers.whatCreated,
    answers.problemSolved,
    answers.howItWorks,
    answers.mainParts,
    answers.whatDifferent,
  ]
    .join(" ")
    .toLowerCase();
}

function mentions(text: string, ...terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function buildSuggestedQueries(record: ProjectRecord): string[] {
  const answers = normalizeAnswersForPacket(record.answers);
  const brand =
    extractBrandName(answers.whatCreated) ??
    extractProductNameFromAnswers(answers);
  const blob = textBlob(answers);

  const problemKw = extractKeywords(answers.problemSolved, 4);
  const createdKw = extractKeywords(answers.whatCreated, 5);
  const partsKw = extractKeywords(answers.mainParts, 5);
  const worksKw = extractKeywords(answers.howItWorks, 4);
  const diffKw = extractKeywords(answers.whatDifferent, 5);
  const materialKw = [...partsKw, ...worksKw].filter((w) =>
    MATERIAL_TERMS.some((m) => w.includes(m) || m.includes(w)),
  );

  let broad: string;
  let component: string;
  let workflow: string;
  let material: string;
  let difference: string;

  if (mentions(blob, "water", "filter", "bottle", "hydration")) {
    broad = "portable water filtration bottle replaceable cartridge";
    component = "twist lock replaceable filter cartridge bottle";
    workflow = "inline drinking water filter bottle";
    material = "carbon ceramic filter cartridge bottle";
    difference = "inline filter drinking no pump battery compostable cartridge";
  } else if (
    mentions(blob, "property", "renovation", "real estate", "upgrade", "contractor", "homeowner")
  ) {
    broad = "AI property upgrade planning software";
    component = "property photo renovation planning app";
    workflow = "automated materials checklist budget estimator";
    material = "real estate upgrade plan PDF generator";
    difference = "contractor handoff property improvement software";
  } else if (mentions(blob, "software", "app", "application", "platform")) {
    broad = phraseJoin(problemKw.slice(0, 3), ["software", "platform"]);
    component = phraseJoin(partsKw.slice(0, 4), ["module", "feature"]);
    workflow = phraseJoin(worksKw.slice(0, 4), ["workflow", "process"]);
    material = phraseJoin(diffKw.slice(0, 3), ["interface", "automation"]);
    difference = phraseJoin(diffKw.slice(0, 5));
  } else {
    broad = phraseJoin(problemKw.slice(0, 3), createdKw.slice(0, 4));
    component = phraseJoin(partsKw.slice(0, 4), createdKw.slice(0, 2));
    workflow = phraseJoin(worksKw.slice(0, 4), ["process", "method"]);
    material =
      materialKw.length > 0
        ? phraseJoin(materialKw.slice(0, 4), ["structure", "material"])
        : phraseJoin(partsKw.slice(0, 2), worksKw.slice(0, 2));
    difference = phraseJoin(diffKw.slice(0, 5));
  }

  if (mentions(blob, "outdoor", "hiker", "camp", "backcountry")) {
    broad = phraseJoin(["outdoor", "hydration", "bottle", "water", "purification"]);
  }

  const queries = [broad, component, workflow, material, difference].map(
    stripBlockedTokensFromQuery,
  );

  if (brand && answers.hasBrandIdentity) {
    const suffix =
      mentions(blob, "property", "renovation", "real estate")
        ? "property upgrade planning software"
        : problemKw.filter((w) => !brand.toLowerCase().includes(w))[0] ??
          "software platform";
    queries[4] = stripBlockedTokensFromQuery(`${brand.toLowerCase()} ${suffix}`);
  }

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const q of queries) {
    if (q.length > 0 && !seen.has(q)) {
      seen.add(q);
      unique.push(q);
    }
  }

  while (unique.length < 5) {
    const filler = cleanSearchQuery(
      `${ITEM_TYPE_LABELS[answers.itemType].toLowerCase()} ${createdKw.join(" ")}`,
    );
    if (!filler || seen.has(filler)) break;
    seen.add(filler);
    unique.push(filler);
  }

  return unique.slice(0, 5);
}

function uniqueKeywords(keywordLists: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const list of keywordLists) {
    for (const kw of list) {
      const key = kw.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(kw);
      }
    }
  }
  return result.slice(0, 20);
}

function buildWorksheetRows(suggestedQueries: WorksheetRow["searchQueryUsed"][]): WorksheetRow[] {
  const blank = (): WorksheetRow => ({
    searchQueryUsed: "(Search query you tried)",
    referenceFound: "(Patent or publication title / number)",
    looksSimilar: "(What looks similar to your idea)",
    seemsDifferent: "(What seems different — user-described only)",
    questionsForExpert: "(Questions to ask a professional)",
  });

  const rows: WorksheetRow[] = suggestedQueries.slice(0, 3).map((q) => ({
    searchQueryUsed: q,
    referenceFound: "(Patent or publication title / number)",
    looksSimilar: "(What looks similar to your idea)",
    seemsDifferent: "(What seems different — user-described only)",
    questionsForExpert: "(Questions to ask a professional)",
  }));

  while (rows.length < 3) rows.push(blank());
  return rows;
}

function buildExpertPrepQuestions(record: ProjectRecord): string[] {
  const { answers, profile } = record;
  const questions = [
    "How should I explain the differences between my idea and a possible similar reference?",
    "Which parts of my description should I clarify before an expert conversation?",
    profile.publicDisclosure
      ? "What should a professional review about my public sharing timeline?"
      : "What should I consider before any public sharing?",
    "What materials should I bring to make a comparison easier?",
    "What search terms might help me find other possible similar references?",
  ];

  if (answers.whatDifferent?.trim()) {
    questions.push(
      "How can I best describe my user-stated differences when comparing to a reference?",
    );
  }

  return questions.slice(0, 6).map(cleanText);
}

function buildExternalSearchLinks(
  suggestedQueries: string[],
): ExternalSearchLink[] {
  const primary = suggestedQueries[0] ?? "portable water filtration bottle";
  return [
    {
      label: "Google Patents",
      url: `https://patents.google.com/?q=${encodeURIComponent(primary)}`,
      queryHint: primary,
    },
    {
      label: "USPTO Patent Public Search",
      url: USPTO_PATENT_PUBLIC_SEARCH,
      queryHint: primary,
    },
  ];
}

export function buildPatentSearchPrep(record: ProjectRecord): PatentSearchPrep {
  const answers = normalizeAnswersForPacket(record.answers);

  const searchKeywords = uniqueKeywords([
    extractKeywords(answers.whatCreated),
    extractKeywords(answers.problemSolved),
    extractKeywords(answers.howItWorks),
    extractKeywords(answers.mainParts),
    extractKeywords(answers.whatDifferent),
    productNouns(answers),
  ]).filter((kw) => !isBlockedToken(kw));

  const suggestedQueries = buildSuggestedQueries({
    ...record,
    answers,
  });
  const externalSearchLinks = buildExternalSearchLinks(suggestedQueries);
  const worksheetRows = buildWorksheetRows(suggestedQueries);
  const expertPrepQuestions = buildExpertPrepQuestions(record);

  return {
    searchKeywords,
    suggestedQueries,
    externalSearchLinks,
    worksheetRows,
    expertPrepQuestions,
    safeDisclaimer: PATENT_SEARCH_PREP_DISCLAIMER,
  };
}

export function assertPatentSearchPrepSafe(): void {
  const text = [
    PATENT_SEARCH_PREP_INTRO,
    PATENT_SEARCH_PREP_DISCLAIMER,
    ...WORKSHEET_HEADERS,
    "possible similar references",
    "search terms to try",
    "a professional may want to review",
    "user-described differences",
    "not a legal conclusion",
  ].join(" \n ");
  if (containsForbiddenLanguage(text)) {
    throw new Error("Patent search prep content contains forbidden language");
  }
}
