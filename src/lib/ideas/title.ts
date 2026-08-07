import { getIdeaLabel } from "@/lib/packet";
import type { IntakeAnswers } from "@/lib/types";

export const MAX_INVENTION_TITLE_LENGTH = 120;

/**
 * Titles are inventor-owned when supplied and fall back to the label the packet
 * has always derived from intake answers, so existing inventions keep the exact
 * title they display today.
 */
export function resolveInventionTitle(
  answers: IntakeAnswers,
  storedTitle?: string | null,
): string {
  const stored = storedTitle?.trim();
  if (stored) return stored;

  const supplied = answers.inventionTitle?.trim();
  if (supplied) return supplied.slice(0, MAX_INVENTION_TITLE_LENGTH);

  return getIdeaLabel(answers);
}

/** Collapses whitespace and enforces the stored length limit. Returns null when empty. */
export function normalizeInventionTitle(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (!collapsed) return null;
  return collapsed.slice(0, MAX_INVENTION_TITLE_LENGTH);
}
