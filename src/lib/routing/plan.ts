import type { ProjectRecord } from "@/lib/types";
import type { SupportNeed } from "@/lib/feedback";
import { buildRoutingContext } from "./context";
import { buildViewAllRecommendations, ROUTING_RULES } from "./rules";
import { formatWhyRecommended } from "./reasons";
import type {
  NextBestStepPlan,
  RoutingContext,
  RoutingRecommendation,
  BuiltRoutingRecommendation,
} from "./types";

const MAX_PRIMARY = 3;

function compareRecommendations(
  a: RoutingRecommendation,
  b: RoutingRecommendation,
): number {
  if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.id.localeCompare(b.id);
}

function dedupeRecommendations(
  recs: RoutingRecommendation[],
): RoutingRecommendation[] {
  const seen = new Set<string>();
  const out: RoutingRecommendation[] = [];
  for (const rec of recs) {
    const key = rec.partnerId
      ? `${rec.category}:${rec.partnerId}`
      : `${rec.category}:${rec.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(rec);
  }
  return out;
}

function finalizeRecommendation(
  built: BuiltRoutingRecommendation,
): RoutingRecommendation {
  return {
    ...built,
    whyRecommended:
      built.whyRecommended ?? formatWhyRecommended(built.reasons),
    isUrgent: built.isUrgent ?? false,
  };
}

function evaluateRules(ctx: RoutingContext): RoutingRecommendation[] {
  const matched: RoutingRecommendation[] = [];

  for (const rule of ROUTING_RULES) {
    if (!rule.when(ctx)) continue;
    const built = rule.build(ctx);
    if (!built) continue;
    matched.push(finalizeRecommendation(built));
  }

  return dedupeRecommendations(matched.sort(compareRecommendations));
}

function buildFingerprint(primary: RoutingRecommendation[]): string {
  return primary.map((rec) => rec.id).join("|");
}

/**
 * Deterministic, config-driven next-step plan for any surface.
 * Same RoutingContext always yields the same plan.
 */
export function buildNextBestStepPlan(
  ctx: RoutingContext,
): NextBestStepPlan {
  const evaluated = evaluateRules(ctx);
  const primary = evaluated.slice(0, MAX_PRIMARY);
  const primaryIds = new Set(primary.map((rec) => rec.id));

  const secondaryFromRules = evaluated.filter((rec) => !primaryIds.has(rec.id));
  const viewAll = buildViewAllRecommendations(ctx)
    .filter((rec) => !primaryIds.has(rec.id))
    .map(finalizeRecommendation);

  const secondary = dedupeRecommendations([
    ...secondaryFromRules,
    ...viewAll,
  ]);

  return {
    primary,
    secondary,
    fingerprint: buildFingerprint(primary),
  };
}

export function buildNextBestStepPlanForRecord(
  record: ProjectRecord,
  savedReferenceCount = 0,
  supportNeeded: SupportNeed[] = [],
): NextBestStepPlan {
  return buildNextBestStepPlan(
    buildRoutingContext(record, savedReferenceCount, supportNeeded),
  );
}

/** Map primary recommendations to legacy PDF step strings (backward compatible). */
export function planToLegacyStepStrings(plan: NextBestStepPlan): string[] {
  if (plan.primary.length === 0) {
    return [
      "Bring this packet to an IP professional, clinic, PTRC, or mentor.",
    ];
  }

  const categoryToLegacy: Partial<Record<string, string>> = {
    continue_preparing:
      "Fill in core gaps — especially how your idea works and what makes it different.",
    review_public_disclosure: "Clarify public sharing history.",
    similar_reference_prep:
      "Save 1 to 3 similar references from Google Patents or USPTO search.",
    urgent_timing_deadline:
      "Review time-sensitive timing notes with a qualified professional.",
  };

  const steps = plan.primary.map((rec) => {
    const legacy = categoryToLegacy[rec.category];
    if (legacy) return legacy;
    if (rec.category === "continue_preparing" && rec.id === "timeline-prep") {
      return "Fill in the development timeline.";
    }
    if (
      rec.category === "continue_preparing" &&
      rec.id === "continue-preparing-materials"
    ) {
      return "Attach or organize screenshots, wireframes, prototype notes, and customer feedback.";
    }
    return rec.body.replace(/^Based on the information you organized,\s*/i, "");
  });

  if (
    !plan.primary.some((rec) => rec.category === "speak_patent_professional")
  ) {
    steps.push(
      "Bring this packet to an IP professional, clinic, PTRC, or mentor.",
    );
  }

  return steps;
}
