import type { IntakeAnswers } from "@/lib/types";

const DRAFT_KEY = "smartprobonoip-intake-draft";

export interface IntakeDraft {
  answers: IntakeAnswers;
  step: number;
  savedAt: string;
}

export function loadIntakeDraft(): IntakeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IntakeDraft;
    if (!parsed?.answers || typeof parsed.step !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveIntakeDraft(draft: IntakeDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* storage full or unavailable */
  }
}

export function clearIntakeDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
