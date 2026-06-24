import { ITEM_TYPE_LABELS, SIGNAL_LABELS } from "./labels";
import { containsForbiddenLanguage } from "./safety";
import type { ProjectRecord } from "./types";

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
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "that",
  "this",
  "these",
  "those",
  "it",
  "its",
  "my",
  "your",
  "our",
  "their",
  "what",
  "which",
  "who",
  "how",
  "when",
  "where",
  "why",
  "not",
  "also",
  "just",
  "very",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "over",
  "such",
  "some",
  "any",
  "all",
  "each",
  "other",
  "more",
  "most",
  "than",
  "then",
  "there",
  "here",
  "they",
  "them",
  "you",
  "your",
  "we",
  "our",
]);

function snippet(text: string, maxWords = 6): string {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return "";
  return words.slice(0, maxWords).join(" ");
}

function extractKeywords(text: string, limit = 10): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const seen = new Set<string>();
  const result: string[] = [];
  for (const w of words) {
    if (!seen.has(w)) {
      seen.add(w);
      result.push(w);
    }
    if (result.length >= limit) break;
  }
  return result;
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

function buildSuggestedQueries(record: ProjectRecord): string[] {
  const { answers, profile } = record;
  const problem = snippet(answers.problemSolved);
  const created = snippet(answers.whatCreated);
  const parts = snippet(answers.mainParts, 4);
  const workflow = snippet(answers.howItWorks, 4);
  const different = snippet(answers.whatDifferent, 5);
  const itemLabel = ITEM_TYPE_LABELS[answers.itemType] ?? "invention";
  const queries: string[] = [];

  if (problem && created) {
    queries.push(`${problem} ${created} patent`);
  }
  if (parts && workflow) {
    queries.push(`${parts} ${workflow} ${itemLabel.toLowerCase()}`);
  }
  if (different) {
    queries.push(`${different} invention`);
  }
  if (problem && parts) {
    queries.push(`${problem} ${parts} prior art`);
  }
  if (
    profile.signals.includes("patent_invention") &&
    created &&
    !queries.some((q) => q.includes(created))
  ) {
    queries.push(`${created} similar patent references`);
  }

  if (queries.length === 0) {
    queries.push(
      `${itemLabel.toLowerCase()} invention search terms`,
      "problem solution patent search",
    );
  }

  return queries.slice(0, 5);
}

function buildWorksheetRows(suggestedQueries: string[]): WorksheetRow[] {
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

  while (rows.length < 3) {
    rows.push(blank());
  }
  return rows;
}

function buildExpertPrepQuestions(record: ProjectRecord): string[] {
  const { answers } = record;
  const questions = [
    "How should I explain the differences between my idea and this reference?",
    "Which parts of my invention should I describe more clearly?",
    "What should a professional review before I share this publicly?",
    "What materials should I bring to make the comparison easier?",
    "What search terms might help me find other possible similar references?",
  ];

  if (answers.whatDifferent?.trim()) {
    questions.push(
      "How can I best describe my user-stated differences when comparing to a reference?",
    );
  }
  if (record.profile.publicDisclosure) {
    questions.push(
      "This may be relevant to discuss with a professional: what should I note about my public sharing timeline?",
    );
  }

  return questions.slice(0, 7);
}

function buildExternalSearchLinks(
  suggestedQueries: string[],
): ExternalSearchLink[] {
  const primary = suggestedQueries[0] ?? "invention patent search";
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
  const { answers, profile } = record;

  const searchKeywords = uniqueKeywords([
    extractKeywords(answers.whatCreated),
    extractKeywords(answers.problemSolved),
    extractKeywords(answers.howItWorks),
    extractKeywords(answers.mainParts),
    extractKeywords(answers.whatDifferent),
    [ITEM_TYPE_LABELS[answers.itemType].toLowerCase()],
    ...profile.signals.map((s) =>
      SIGNAL_LABELS[s].toLowerCase().split(/\s+/).slice(0, 3),
    ),
  ]);

  const suggestedQueries = buildSuggestedQueries(record);
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
