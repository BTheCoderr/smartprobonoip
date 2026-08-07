import type { RecommendationReason } from "./types";

/** Approved, non-sensitive copy keyed by routing signal — never embed intake text. */
const REASON_COPY: Record<RecommendationReason, string> = {
  core_fields_missing:
    "Some core packet fields are still open in your preparation record.",
  timeline_incomplete:
    "Your development timeline has few recorded milestones.",
  materials_missing:
    "You have not listed supporting materials yet.",
  public_disclosure_unclear:
    "You noted public sharing — confirming where and when helps a professional review timing.",
  public_disclosure_past_no_date:
    "You noted sharing publicly but no reliable date is recorded yet.",
  similar_references_missing:
    "You have not saved possible similar references for a professional to review.",
  professional_review_ready:
    "Core packet fields look organized enough for an educational professional conversation.",
  local_ptrc_match:
    "Your location matches a Patent and Trademark Resource Center service area.",
  university_affiliation:
    "You noted a university or institutional affiliation signal.",
  pro_bono_interest:
    "You noted interest in pro bono patent assistance programs.",
  education_helpful:
    "Your readiness score suggests education topics may help before your next step.",
  export_helpful:
    "Your core fields are filled — an export may help for a professional conversation.",
  urgent_deadline:
    "You recorded dates or plans that may be worth discussing soon with a qualified professional.",
  planned_public_disclosure:
    "You noted upcoming public sharing plans that may be worth discussing with a professional.",
  office_action_response:
    "You noted an office action — timing questions may be worth discussing with a professional.",
  generic_fallback:
    "This verified resource is listed for reference based on your preparation path.",
};

const SENSITIVE_PATTERN =
  /\b(ownership|inventor|employer|whatcreated|problem|works|parts|notes|description|disclosure event)\b/i;

/**
 * Deterministic, user-facing explanation from approved routing signals only.
 * Never includes raw intake answers, ownership notes, or invention descriptions.
 */
export function formatWhyRecommended(
  reasons: RecommendationReason[],
): string {
  const unique = [...new Set(reasons)].filter((reason) => REASON_COPY[reason]);
  if (unique.length === 0) {
    return REASON_COPY.generic_fallback;
  }
  if (unique.length === 1) {
    return REASON_COPY[unique[0]!];
  }
  const parts = unique.slice(0, 3).map((reason) => REASON_COPY[reason]);
  return parts.join(" ");
}

/** Guardrail for tests — reason copy must not echo blocked intake fields. */
export function assertReasonCopySafe(text: string): boolean {
  if (SENSITIVE_PATTERN.test(text)) return false;
  if (text.length > 320) return false;
  return true;
}
