import { cleanText, extractBrandName } from "./textCleanup";
import type { IntakeAnswers } from "./types";

export const BLOCKED_SEARCH_TOKENS = new Set([
  "https",
  "http",
  "www",
  "netlify",
  "vercel",
  "localhost",
  "smartprobonoip",
  "app",
  "start",
  "com",
  "html",
  "netlifyapp",
]);

const URL_PATTERN =
  /^(https?:\/\/|www\.)/i;

const ROUTE_PATTERN =
  /^\/?smartprobonoip\/start/i;

const URL_IN_TEXT =
  /https?:\/\/[^\s]+|www\.[^\s]+|\bsmartprobonoip\.netlify\.app[^\s]*/gi;

const AUDIENCE_HINTS =
  /\b(users?|customers?|clients?|homeowners?|businesses?|students?|inventors?|creators?|teams?|companies|agents?|brokers?|landlords?|tenants|patients?|hikers?|campers|people|audience|buyers?|sellers?|developers?|founders?|entrepreneurs?|professionals?|parents?|children?|kids?|teens?|adults?|renters?|owners?|retailers?|bodegas?|grocers?|shopkeepers?|merchants?|organizations?|programs?|communities?|clinics?|hospitals?|schools?|universities?|nonprofits?)\b/i;

const WORKFLOW_HINTS =
  /\b(uploads?|uploaded|generates?|generating|click(s|ed|ing)?|steps?|workflow|process(es)?|then|after|before|creates?|creating|builds?|building|runs?|running|calculates?|sends?|exports?|imports?|checklist|pdf|database|api|module|feature|algorithm|analyzes?|parses?|transforms?|displays?|outputs?|inputs?|photos?|images?|data|automatically|system|stores?\s+(data|information|files|records|results|values|preferences|history))\b/i;

const PAIN_POINT_HINTS =
  /\b(problem|frustrat|frustration|pain|struggle|difficult|hard|expensive|cost|costly|risk|danger|unsafe|lack|missing|without|need(s|ed|ing)?|can't|cannot|unable|waste|wasted|slow|heavy|burden|gap|challenge|issue|barrier|obstacle|annoy|inconvenien|inefficien|fail(s|ed|ure|ures)?|break(s|ing)?|damage|lose|lost|run\s+out|shortage|scarce|limited|poor|bad|worse|worst|unreliable|confus|complex|overwhelm|stress|time-consuming|money|afford|pay|spend|hazard|harm|injur|theft|steal|messy|clutter|tangle|tangled|forget|forgot|forgetting|forgets)\b/i;

const COMPARISON_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "this",
  "with",
  "from",
  "your",
  "you",
  "are",
  "was",
  "were",
  "has",
  "have",
  "had",
  "its",
  "our",
  "their",
  "they",
  "them",
  "who",
  "what",
  "when",
  "where",
  "how",
  "why",
  "can",
  "may",
  "will",
  "would",
  "could",
  "should",
  "into",
  "through",
  "about",
  "also",
  "just",
  "very",
  "more",
  "most",
  "some",
  "any",
  "all",
  "each",
  "other",
  "than",
  "then",
  "there",
  "here",
  "such",
  "using",
  "used",
  "uses",
  "use",
  "idea",
  "product",
  "device",
  "system",
  "app",
  "tool",
  "solution",
  "new",
  "simple",
  "helps",
  "help",
  "make",
  "makes",
  "made",
  "keeps",
  "keep",
  "lets",
  "let",
  "using",
]);

export interface FieldValidationError {
  field: keyof IntakeAnswers;
  message: string;
}

export function isUrlOrRoute(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (URL_PATTERN.test(trimmed)) return true;
  if (ROUTE_PATTERN.test(trimmed)) return true;
  if (/smartprobonoip\.netlify\.app/i.test(trimmed)) return true;
  if (/^[^\s]+\.(com|app|io|net|org|dev)(\/|$)/i.test(trimmed)) return true;
  return false;
}

export function isMostlyUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const withoutUrls = trimmed.replace(URL_IN_TEXT, " ").trim();
  const alpha = withoutUrls.replace(/[^a-zA-Z]/g, "");
  return alpha.length < 8 && URL_IN_TEXT.test(trimmed);
}

export function stripUrlsFromText(text: string): string {
  return cleanText(text.replace(URL_IN_TEXT, " ").replace(/\s+/g, " "));
}

export function isBlockedToken(word: string): boolean {
  const key = word.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!key) return true;
  if (BLOCKED_SEARCH_TOKENS.has(key)) return true;
  if (key.includes("smartprobono")) return true;
  if (key.includes("netlify")) return true;
  return false;
}

export function filterBlockedTokens(words: string[]): string[] {
  return words.filter((w) => !isBlockedToken(w));
}

export function sanitizeFieldText(value: string): string {
  return stripUrlsFromText(value);
}

export function looksLikeWorkflowAnswer(text: string): boolean {
  const cleaned = sanitizeFieldText(text);
  if (cleaned.length < 20) return false;
  if (/^(user|users)\s+(uploads?|clicks?|enters?|selects?|adds?)/i.test(cleaned)) {
    return true;
  }
  if (/\b(the|an|this)\s+(app|system|platform|tool|software)\s+(generates?|creates?|builds?|runs?|calculates?)/i.test(cleaned)) {
    return true;
  }
  const workflowHits = cleaned.match(WORKFLOW_HINTS)?.length ?? 0;
  const audienceHits = cleaned.match(AUDIENCE_HINTS)?.length ?? 0;
  if (audienceHits >= 2 && workflowHits <= 1) return false;
  return workflowHits >= 2 || (workflowHits >= 1 && audienceHits === 0);
}

export function looksLikeAudienceAnswer(text: string): boolean {
  const cleaned = sanitizeFieldText(text);
  if (cleaned.length < 8) return false;
  return AUDIENCE_HINTS.test(cleaned);
}

export function extractProductNameFromAnswers(
  answers: IntakeAnswers,
): string | null {
  const fields = [
    answers.whatCreated,
    answers.problemSolved,
    answers.mainParts,
    answers.whatDifferent,
    answers.howItWorks,
  ];

  for (const field of fields) {
    if (!field?.trim() || isUrlOrRoute(field) || isMostlyUrl(field)) continue;

    const titled = field.match(
      /\b([A-Z][A-Za-z0-9]+(?:\s+(?:Pro|AI|Plus|Lite|Max|Go|[A-Z][a-z]+)){0,2})\b/,
    );
    if (
      titled &&
      titled[1].length >= 5 &&
      !isBlockedToken(titled[1].toLowerCase().split(/\s+/)[0])
    ) {
      return titled[1];
    }

    const brand = extractBrandName(field);
    if (brand && !isBlockedToken(brand.toLowerCase())) return brand;
  }

  return null;
}

export function resolveWhatCreated(answers: IntakeAnswers): string {
  const raw = answers.whatCreated?.trim() ?? "";
  if (raw && !isUrlOrRoute(raw) && !isMostlyUrl(raw)) {
    return sanitizeFieldText(raw);
  }
  const fallback = extractProductNameFromAnswers(answers);
  if (fallback) return fallback;
  return sanitizeFieldText(raw);
}

export function getIdeaLabel(answers: IntakeAnswers): string {
  const resolved = resolveWhatCreated(answers);
  if (!resolved) return "Untitled idea";
  const firstSentence = resolved.split(/[.!?\n]/)[0].trim();
  const base = firstSentence.length > 0 ? firstSentence : resolved;
  if (isUrlOrRoute(base) || isMostlyUrl(base)) {
    const fallback = extractProductNameFromAnswers(answers);
    if (fallback) return fallback.length > 70 ? `${fallback.slice(0, 67)}…` : fallback;
    return "Untitled idea";
  }
  return base.length > 70 ? `${base.slice(0, 67)}…` : base;
}

export function normalizeAnswersForPacket(
  answers: IntakeAnswers,
): IntakeAnswers {
  const resolvedCreated = resolveWhatCreated(answers);
  let whoFor = sanitizeFieldText(answers.whoFor);
  let howItWorks = sanitizeFieldText(answers.howItWorks);

  if (looksLikeWorkflowAnswer(whoFor) && looksLikeAudienceAnswer(howItWorks)) {
    whoFor = sanitizeFieldText(answers.howItWorks);
    howItWorks = sanitizeFieldText(answers.whoFor);
  } else if (looksLikeWorkflowAnswer(whoFor) && !looksLikeAudienceAnswer(whoFor)) {
    whoFor = "";
  }

  return {
    ...answers,
    whatCreated: resolvedCreated,
    problemSolved: sanitizeFieldText(answers.problemSolved),
    whoFor,
    howItWorks,
    mainParts: sanitizeFieldText(answers.mainParts),
    whatDifferent: sanitizeFieldText(answers.whatDifferent),
  };
}

function normalizeComparisonText(text: string): string {
  return sanitizeFieldText(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function comparisonTokens(text: string): Set<string> {
  return new Set(
    normalizeComparisonText(text)
      .split(" ")
      .filter(
        (word) =>
          word.length >= 3 &&
          !COMPARISON_STOP_WORDS.has(word) &&
          !isBlockedToken(word),
      ),
  );
}

function tokenJaccardSimilarity(a: string, b: string): number {
  const setA = comparisonTokens(a);
  const setB = comparisonTokens(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function areProblemAndCreatedNearlyIdentical(
  whatCreated: string,
  problemSolved: string,
): boolean {
  const created = normalizeComparisonText(whatCreated);
  const problem = normalizeComparisonText(problemSolved);
  if (!created || !problem) return false;
  if (created === problem) return true;

  const shorter = created.length <= problem.length ? created : problem;
  const longer = created.length <= problem.length ? problem : created;
  if (shorter.length >= 24 && longer.includes(shorter)) return true;

  const setA = comparisonTokens(whatCreated);
  const setB = comparisonTokens(problemSolved);
  if (setA.size === 0 || setB.size === 0) return false;

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection += 1;
  }

  const jaccard = tokenJaccardSimilarity(whatCreated, problemSolved);
  if (jaccard >= 0.72) return true;
  if (setB.size >= 3 && intersection / setB.size >= 0.85) return true;

  return false;
}

export function problemMostlyRepeatsProductWithoutPainPoint(
  whatCreated: string,
  problemSolved: string,
): boolean {
  const created = sanitizeFieldText(whatCreated).trim();
  const problem = sanitizeFieldText(problemSolved).trim();
  if (!created || !problem) return false;
  if (PAIN_POINT_HINTS.test(problem)) return false;

  const jaccard = tokenJaccardSimilarity(created, problem);
  if (jaccard >= 0.5) return true;

  const setCreated = comparisonTokens(created);
  const setProblem = comparisonTokens(problem);
  if (setProblem.size === 0) return false;

  let overlap = 0;
  for (const word of setProblem) {
    if (setCreated.has(word)) overlap += 1;
  }

  return overlap / setProblem.size >= 0.7;
}

export function validateProblemField(
  answers: IntakeAnswers,
): FieldValidationError | null {
  const created = answers.whatCreated.trim();
  const problem = answers.problemSolved.trim();
  if (!created || !problem) return null;

  if (areProblemAndCreatedNearlyIdentical(created, problem)) {
    return {
      field: "problemSolved",
      message:
        "Your problem answer looks the same as your idea description. Please describe the problem your idea solves.",
    };
  }

  if (problemMostlyRepeatsProductWithoutPainPoint(created, problem)) {
    return {
      field: "problemSolved",
      message:
        "Please describe the problem, frustration, cost, risk, or gap this idea addresses.",
    };
  }

  return null;
}

const MIN_STEP_DETAIL_LENGTH = 12;

export function validateHowItWorksStep(
  answers: IntakeAnswers,
): FieldValidationError | null {
  const howItWorks = answers.howItWorks.trim();
  if (!howItWorks) {
    return {
      field: "howItWorks",
      message: "Please add a few sentences describing how it works.",
    };
  }
  if (howItWorks.length < MIN_STEP_DETAIL_LENGTH) {
    return {
      field: "howItWorks",
      message: "Please add a bit more detail about how it works.",
    };
  }

  const mainParts = answers.mainParts.trim();
  if (!mainParts) {
    return {
      field: "mainParts",
      message: "Please list the main parts or components.",
    };
  }
  if (mainParts.length < MIN_STEP_DETAIL_LENGTH) {
    return {
      field: "mainParts",
      message: "Please add a bit more detail about the main parts or components.",
    };
  }

  const whatDifferent = answers.whatDifferent.trim();
  if (!whatDifferent) {
    return {
      field: "whatDifferent",
      message:
        "Please describe what makes it different from what already exists.",
    };
  }
  if (whatDifferent.length < MIN_STEP_DETAIL_LENGTH) {
    return {
      field: "whatDifferent",
      message: "Please add a bit more detail about what makes it different.",
    };
  }

  return null;
}

export function validateIntakeStep(
  step: number,
  answers: IntakeAnswers,
): FieldValidationError | null {
  if (step === 0) {
    const created = answers.whatCreated.trim();
    if (!created) {
      return {
        field: "whatCreated",
        message: "Please describe what you created.",
      };
    }
    if (isUrlOrRoute(created) || isMostlyUrl(created)) {
      return {
        field: "whatCreated",
        message:
          "Please describe the idea itself, not the webpage link.",
      };
    }
    if (answers.whoFor.trim() && looksLikeWorkflowAnswer(answers.whoFor)) {
      return {
        field: "whoFor",
        message:
          "This sounds like how the idea works. Please describe who the idea is for.",
      };
    }
    const problemError = validateProblemField(answers);
    if (problemError) return problemError;
  }

  if (step === 1) {
    return validateHowItWorksStep(answers);
  }

  return null;
}

export function validateForGeneration(
  answers: IntakeAnswers,
): FieldValidationError[] {
  const errors: FieldValidationError[] = [];
  const step0 = validateIntakeStep(0, answers);
  if (step0) errors.push(step0);
  const howItWorksStep = validateHowItWorksStep(answers);
  if (howItWorksStep) errors.push(howItWorksStep);
  return errors;
}

export const REVIEW_FIELDS: {
  key: keyof IntakeAnswers;
  label: string;
}[] = [
  { key: "whatCreated", label: "What you created" },
  { key: "problemSolved", label: "Problem" },
  { key: "whoFor", label: "Who it is for" },
  { key: "howItWorks", label: "How it works" },
  { key: "mainParts", label: "Main components" },
  { key: "whatDifferent", label: "What makes it different" },
];
