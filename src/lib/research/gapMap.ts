import { REFERENCE_REVIEW_DISCLAIMER, containsForbiddenLanguage } from "@/lib/safety";
import type { GapMapFields, GapMapOutput } from "./types";

export const GAP_MAP_FIELD_LABELS: { key: keyof GapMapFields; label: string; hint: string }[] = [
  {
    key: "sameProblem",
    label: "Same problem or user need?",
    hint: "Note if this reference appears to solve a similar problem — user observation only.",
  },
  {
    key: "sameTargetUser",
    label: "Same target user/customer?",
    hint: "Who seems to use this reference vs. your idea?",
  },
  {
    key: "sameMainParts",
    label: "Same main parts/components?",
    hint: "List parts or features that may look similar in plain language.",
  },
  {
    key: "sameTriggerMechanism",
    label: "Same trigger/sensor/mechanism?",
    hint: "Describe any mechanism, sensor, or trigger that may overlap.",
  },
  {
    key: "sameUsage",
    label: "Same way it is used?",
    hint: "How is the reference used compared to your idea?",
  },
  {
    key: "sameVisualDesign",
    label: "Same visual design/product appearance?",
    hint: "Note look-and-feel similarities — not a design-rights conclusion.",
  },
  {
    key: "appearsDifferent",
    label: "What appears different?",
    hint: "Your description of differences you want an expert to review.",
  },
  {
    key: "expertReviewDifference",
    label: "What difference should an expert review?",
    hint: "Turn your notes into a question for professional review.",
  },
];

export function buildGapMapOutput(fields: GapMapFields): GapMapOutput {
  const possibleSimilarity: string[] = [];
  const possibleDifference: string[] = [];
  const documentNext: string[] = [];
  const expertQuestions: string[] = [];

  if (fields.sameProblem?.trim()) {
    possibleSimilarity.push(
      `You noted a possible overlap in problem or user need: ${fields.sameProblem.trim().slice(0, 200)}`,
    );
  }
  if (fields.sameTargetUser?.trim()) {
    possibleSimilarity.push(
      `You noted a possible overlap in target user or customer: ${fields.sameTargetUser.trim().slice(0, 200)}`,
    );
  }
  if (fields.sameMainParts?.trim()) {
    possibleSimilarity.push(
      `You noted possible overlap in main parts or components: ${fields.sameMainParts.trim().slice(0, 200)}`,
    );
  }
  if (fields.sameUsage?.trim()) {
    possibleSimilarity.push(
      `You noted possible overlap in how it is used: ${fields.sameUsage.trim().slice(0, 200)}`,
    );
  }

  if (fields.appearsDifferent?.trim()) {
    possibleDifference.push(fields.appearsDifferent.trim().slice(0, 300));
  }
  if (fields.expertReviewDifference?.trim()) {
    possibleDifference.push(
      `Difference to review with an expert: ${fields.expertReviewDifference.trim().slice(0, 300)}`,
    );
  }
  if (fields.sameVisualDesign?.trim()) {
    possibleDifference.push(
      `Visual or appearance notes you wrote: ${fields.sameVisualDesign.trim().slice(0, 200)}`,
    );
  }

  if (!fields.sameTriggerMechanism?.trim()) {
    documentNext.push("Consider noting whether any trigger, sensor, or mechanism appears similar.");
  } else {
    documentNext.push(
      `Trigger/mechanism notes to bring to review: ${fields.sameTriggerMechanism.trim().slice(0, 200)}`,
    );
  }
  documentNext.push("Save links, screenshots, or reference numbers for each possible similar reference.");
  documentNext.push("Bring your IP Readiness Packet PDF to your expert conversation.");

  expertQuestions.push(
    "Which parts of this reference may overlap with my description, based on what I wrote?",
    "Which differences I noted should a professional review first?",
    "What additional materials would help compare this reference to my packet?",
    "What preparation gaps should I fill before sharing more publicly?",
  );

  const output: GapMapOutput = {
    possibleSimilarity: possibleSimilarity.slice(0, 5),
    possibleDifference: possibleDifference.slice(0, 5),
    documentNext: documentNext.slice(0, 4),
    expertQuestions: expertQuestions.slice(0, 5),
    disclaimer: REFERENCE_REVIEW_DISCLAIMER,
  };

  const text = [
    ...output.possibleSimilarity,
    ...output.possibleDifference,
    ...output.documentNext,
    ...output.expertQuestions,
    output.disclaimer,
  ].join(" ");

  if (containsForbiddenLanguage(text)) {
    throw new Error("Gap map output failed safety check");
  }

  return output;
}

export const EMPTY_GAP_MAP_FIELDS: GapMapFields = {
  sameProblem: "",
  sameTargetUser: "",
  sameMainParts: "",
  sameTriggerMechanism: "",
  sameUsage: "",
  sameVisualDesign: "",
  appearsDifferent: "",
  expertReviewDifference: "",
};
