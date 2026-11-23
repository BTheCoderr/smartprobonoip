/**
 * Server-side validation for readiness profiles sent by the browser.
 *
 * The browser receives a profile from /api/generate and posts it back to
 * /api/records. Without this check, a client could skip the generator's
 * safety filter, drop the disclaimer, or store arbitrary signals and
 * resources that later reach a professional handoff.
 */
import { DISCLAIMER } from "./disclaimer";
import { RESOURCE_LABELS } from "./labels";
import { collectProfileText, containsForbiddenLanguage } from "./safety";
import { SIGNAL_KEYS } from "./signals";
import type { IpSignal, ReadinessProfile, ResourceCategory } from "./types";

const MAX_TEXT = 6000;
const MAX_ITEMS = 40;
const MAX_ITEM_TEXT = 1200;

export type ProfileValidationResult =
  | { ok: true; profile: ReadinessProfile }
  | { ok: false; error: string };

function text(value: unknown, max = MAX_TEXT): string | null {
  return typeof value === "string" && value.length <= max ? value : null;
}

function textList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > MAX_ITEMS) return null;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.length > MAX_ITEM_TEXT) return null;
    out.push(item);
  }
  return out;
}

const SIGNALS = new Set<string>(SIGNAL_KEYS);
const RESOURCES = new Set<string>(Object.keys(RESOURCE_LABELS));

/**
 * @param opts.generated true when the profile should be generator output
 *   (new packets and regeneration): enforces the forbidden-language filter.
 *   Inventor edits to their own packet keep the shape checks only.
 */
export function validateClientProfile(
  value: unknown,
  opts: { generated: boolean },
): ProfileValidationResult {
  if (!value || typeof value !== "object") return { ok: false, error: "Invalid profile" };
  const v = value as Record<string, unknown>;

  const ideaSummary = text(v.ideaSummary);
  const publicDisclosureNote = text(v.publicDisclosureNote);
  const suggestedNextStep = text(v.suggestedNextStep);
  const completeInfo = textList(v.completeInfo);
  const missingInfo = textList(v.missingInfo);
  const expertQuestions = textList(v.expertQuestions);
  if (
    ideaSummary === null ||
    publicDisclosureNote === null ||
    suggestedNextStep === null ||
    !completeInfo ||
    !missingInfo ||
    !expertQuestions ||
    typeof v.publicDisclosure !== "boolean" ||
    !Array.isArray(v.signals) ||
    !Array.isArray(v.recommendedResources)
  ) {
    return { ok: false, error: "Invalid profile" };
  }

  const profile: ReadinessProfile = {
    ideaSummary,
    signals: v.signals.filter((s): s is IpSignal => typeof s === "string" && SIGNALS.has(s)),
    completeInfo,
    missingInfo,
    publicDisclosure: v.publicDisclosure,
    publicDisclosureNote,
    suggestedNextStep,
    expertQuestions,
    recommendedResources: v.recommendedResources.filter(
      (r): r is ResourceCategory => typeof r === "string" && RESOURCES.has(r),
    ),
    // Always the canonical disclaimer, never client-supplied text.
    disclaimer: DISCLAIMER,
    generator: v.generator === "ai" ? "ai" : "rule",
  };

  if (opts.generated && containsForbiddenLanguage(collectProfileText(profile))) {
    return { ok: false, error: "Profile failed safety validation. Please regenerate your packet." };
  }

  return { ok: true, profile };
}
