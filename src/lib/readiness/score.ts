import {
  countFilledTimelineFields,
  getTimelineFieldValue,
} from "@/lib/packet";
import type { ProjectRecord } from "@/lib/types";
import {
  READINESS_SCORE_SOURCE,
  type ReadinessCategoryScore,
  type ReadinessEvaluation,
} from "./types";
import { buildReadinessActions } from "./actions";

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

const WHY_IT_MATTERS: Record<ReadinessCategoryScore["id"], string> = {
  core_idea:
    "A clear plain-language description helps a professional understand what you built before they ask follow-up questions.",
  problem_audience:
    "Naming the problem and who it helps keeps the packet focused on real use, not just features.",
  prototype_materials:
    "Notes about prototypes and supporting materials show what evidence you can bring to a conversation.",
  timeline:
    "Key development dates help organize your story and flag moments worth discussing with an expert.",
  public_disclosure:
    "Clear notes about if and how you shared the idea help a professional ask the right timing questions.",
  expert_handoff:
    "Filled core fields plus similar-reference prep make a handoff packet easier for someone else to review.",
};

/**
 * Canonical packet-preparation breakdown (Formula A).
 * Sum of category scores is the overall readiness score (0–100).
 */
export function computeReadinessCategoryBreakdown(
  record: ProjectRecord,
  savedReferenceCount = 0,
): ReadinessCategoryScore[] {
  const { answers, profile } = record;

  const coreScore = [
    answers.whatCreated,
    answers.mainParts,
    answers.howItWorks,
    answers.whatDifferent,
  ].reduce((sum, field) => sum + (hasText(field) ? 5 : 0), 0);

  const problemScore =
    (hasText(answers.problemSolved) ? 8 : 0) + (hasText(answers.whoFor) ? 7 : 0);

  let prototypeMaterialsScore = answers.hasPrototype ? 8 : 0;
  prototypeMaterialsScore += Math.min(12, answers.assets.length * 4);

  const timelineFilled = countFilledTimelineFields(record.developmentTimeline);
  const timelineScore = Math.round((timelineFilled / 6) * 15);

  let disclosureScore = 15;
  if (profile.publicDisclosure) {
    disclosureScore = 5;
    if (
      hasText(
        getTimelineFieldValue(
          record.developmentTimeline,
          "Date first shared publicly",
        ),
      )
    ) {
      disclosureScore += 5;
    }
    if (answers.sharedChannels.some((channel) => channel !== "none")) {
      disclosureScore += 5;
    }
  }

  const handoffFields = [
    answers.whatCreated,
    answers.problemSolved,
    answers.howItWorks,
    answers.mainParts,
    answers.whatDifferent,
  ].filter(hasText).length;
  let expertScore = Math.round((handoffFields / 5) * 10);
  if (savedReferenceCount > 0) expertScore += 5;
  expertScore = Math.min(15, expertScore);

  return [
    {
      id: "core_idea",
      label: "Core idea clarity",
      score: coreScore,
      max: 20,
      whyItMatters: WHY_IT_MATTERS.core_idea,
    },
    {
      id: "problem_audience",
      label: "Problem and audience clarity",
      score: problemScore,
      max: 15,
      whyItMatters: WHY_IT_MATTERS.problem_audience,
    },
    {
      id: "prototype_materials",
      label: "Prototype/materials readiness",
      score: prototypeMaterialsScore,
      max: 20,
      whyItMatters: WHY_IT_MATTERS.prototype_materials,
    },
    {
      id: "timeline",
      label: "Timeline readiness",
      score: timelineScore,
      max: 15,
      whyItMatters: WHY_IT_MATTERS.timeline,
    },
    {
      id: "public_disclosure",
      label: "Public disclosure clarity",
      score: disclosureScore,
      max: 15,
      whyItMatters: WHY_IT_MATTERS.public_disclosure,
    },
    {
      id: "expert_handoff",
      label: "Expert handoff readiness",
      score: expertScore,
      max: 15,
      whyItMatters: WHY_IT_MATTERS.expert_handoff,
    },
  ];
}

/** Canonical overall packet-preparation score (Formula A). */
export function computeOverallReadinessScore(
  record: ProjectRecord,
  savedReferenceCount = 0,
): number {
  return computeReadinessCategoryBreakdown(record, savedReferenceCount).reduce(
    (sum, item) => sum + item.score,
    0,
  );
}

export function buildReadinessEvaluation(
  record: ProjectRecord,
  savedReferenceCount = 0,
): ReadinessEvaluation {
  const categories = computeReadinessCategoryBreakdown(
    record,
    savedReferenceCount,
  );
  return {
    overallScore: categories.reduce((sum, item) => sum + item.score, 0),
    categories,
    actions: buildReadinessActions(record, savedReferenceCount),
    source: READINESS_SCORE_SOURCE,
  };
}
