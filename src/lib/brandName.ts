import { extractBrandName } from "./textCleanup";
import type { IntakeAnswers } from "./types";

/** Common sentence starters that the extractBrandName heuristic can mistake for a brand. */
const SENTENCE_STARTER_STOP_LIST = new Set([
  "the",
  "a",
  "an",
  "my",
  "our",
  "this",
  "it",
  "we",
  "you",
  "when",
  "how",
  "what",
]);

function isSentenceStarter(candidate: string): boolean {
  const firstWord = candidate.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return SENTENCE_STARTER_STOP_LIST.has(firstWord);
}

/**
 * Resolve the product/brand name for a packet. Prefers the user-entered
 * brandName; otherwise, when the user says they have a brand identity, falls
 * back to the extractBrandName heuristic (rejecting sentence starters).
 */
export function resolveBrandName(answers: IntakeAnswers): string | null {
  const explicit = answers.brandName?.trim();
  if (explicit) return explicit;

  if (!answers.hasBrandIdentity) return null;

  const heuristic =
    extractBrandName(answers.whatCreated ?? "") ??
    extractBrandName(answers.problemSolved ?? "");
  if (!heuristic || isSentenceStarter(heuristic)) return null;
  return heuristic;
}
