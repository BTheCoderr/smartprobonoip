import { REFERENCE_REVIEW_DISCLAIMER, assertSafeLanguage, containsForbiddenLanguage } from "./safety";
import type { CompareReferenceOutput } from "./research/types";

export interface CompareReferenceInput {
  ideaSummary: string;
  problemSolved: string;
  howItWorks: string;
  mainParts: string;
  userDescribedDifferences: string;
  referenceTitle: string;
  referenceAbstract: string;
}

export function buildCompareReference(
  input: CompareReferenceInput,
): CompareReferenceOutput {
  const related: string[] = [];
  if (input.referenceTitle.trim()) {
    related.push(
      `The reference titled "${input.referenceTitle}" may share topic areas with your packet.`,
    );
  }
  if (input.referenceAbstract.trim()) {
    related.push(
      "Based on the reference abstract, a professional may want to review overlapping subject matter with your description.",
    );
  }
  if (input.problemSolved.trim()) {
    related.push(
      `Your packet describes this problem: ${input.problemSolved.slice(0, 120)}${input.problemSolved.length > 120 ? "…" : ""}`,
    );
  }

  const clarify: string[] = [];
  if (!input.howItWorks.trim()) {
    clarify.push("Consider clarifying how your idea works step by step.");
  }
  if (!input.mainParts.trim()) {
    clarify.push("Consider listing the main parts or components more clearly.");
  }
  clarify.push(
    "Note which features you believe are user-described differences — not a legal conclusion.",
  );

  const differences: string[] = [];
  if (input.userDescribedDifferences.trim()) {
    differences.push(input.userDescribedDifferences.trim());
  } else {
    differences.push(
      "You may want to write what your idea does differently from this possible similar reference.",
    );
  }
  differences.push(
    "These are user-described differences only. A professional would need to review whether they matter legally.",
  );

  const expertQuestions = [
    "How should I explain the differences between my idea and this reference?",
    "Which parts of my description should I clarify before sharing more publicly?",
    "What materials should I bring to make this comparison easier for review?",
    "What preparation gaps should I fill in before an expert conversation?",
  ];

  const materials = [
    "Your saved reference title, number, and link",
    "Your IP Readiness Packet PDF",
    "Sketches, diagrams, or notes that show how your idea works",
    "A written list of user-described differences",
  ];

  const output: CompareReferenceOutput = {
    whatAppearsRelated: related.slice(0, 4),
    clarifyFurther: clarify.slice(0, 4),
    userDescribedDifferences: differences.slice(0, 4),
    expertQuestions: expertQuestions.slice(0, 5),
    materialsToGather: materials,
    disclaimer: REFERENCE_REVIEW_DISCLAIMER,
  };

  const text = [
    ...output.whatAppearsRelated,
    ...output.clarifyFurther,
    ...output.userDescribedDifferences,
    ...output.expertQuestions,
    ...output.materialsToGather,
    output.disclaimer,
  ].join(" \n ");

  if (containsForbiddenLanguage(text)) {
    throw new Error("Compare output failed safety check");
  }

  return output;
}

export function assertCompareOutputSafe(output: CompareReferenceOutput): void {
  const text = [
    ...output.whatAppearsRelated,
    ...output.clarifyFurther,
    ...output.userDescribedDifferences,
    ...output.expertQuestions,
    ...output.materialsToGather,
    output.disclaimer,
  ].join(" \n ");
  assertSafeLanguage(text, "compare-reference");
}
