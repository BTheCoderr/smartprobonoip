import { DISCLAIMER } from "./disclaimer";
import { ITEM_TYPE_LABELS } from "./labels";
import type {
  IntakeAnswers,
  IpSignal,
  ReadinessProfile,
  ResourceCategory,
} from "./types";

function clean(value: string): string {
  return value.trim();
}

function hasText(value: string): boolean {
  return clean(value).length > 0;
}

function isPubliclyShared(answers: IntakeAnswers): boolean {
  return answers.sharedChannels.some((c) => c !== "none");
}

function isConfidential(answers: IntakeAnswers): boolean {
  return (
    !isPubliclyShared(answers) &&
    (answers.sharedChannels.length === 0 ||
      answers.sharedChannels.every((c) => c === "none"))
  );
}

function buildSummary(answers: IntakeAnswers): string {
  const created = hasText(answers.whatCreated)
    ? clean(answers.whatCreated)
    : "an idea";
  const problem = hasText(answers.problemSolved)
    ? ` It aims to address ${lowerFirst(clean(answers.problemSolved))}.`
    : "";
  const audience = hasText(answers.whoFor)
    ? ` It is intended for ${lowerFirst(clean(answers.whoFor))}.`
    : "";
  const kind = `It is described as a ${ITEM_TYPE_LABELS[answers.itemType].toLowerCase()}.`;
  return `You described ${lowerFirst(created)}.${problem}${audience} ${kind}`.trim();
}

function lowerFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function deriveSignals(answers: IntakeAnswers): IpSignal[] {
  const signals = new Set<IpSignal>();

  const functional =
    ["physical_product", "process", "recipe", "design"].includes(
      answers.itemType,
    ) ||
    (hasText(answers.howItWorks) && hasText(answers.mainParts));
  if (functional) signals.add("patent_invention");

  if (answers.hasBrandIdentity || answers.itemType === "brand") {
    signals.add("trademark_brand");
  }

  if (
    answers.itemType === "creative_work" ||
    answers.itemType === "software" ||
    answers.assets.includes("code")
  ) {
    signals.add("copyright_creative_software");
  }

  if (isConfidential(answers) && (hasText(answers.howItWorks) || hasText(answers.mainParts))) {
    signals.add("trade_secret");
  }

  const wantsSharing = answers.goals.some((g) =>
    ["funding", "licensing", "business_support"].includes(g),
  );
  const willShare = answers.sharedChannels.some((c) =>
    ["investors", "customers", "pitch"].includes(c),
  );
  if (wantsSharing || willShare) {
    signals.add("nda_business_support");
  }

  if (
    answers.goals.includes("expert_review") ||
    answers.goals.includes("protection") ||
    signals.size === 0
  ) {
    signals.add("expert_review");
  }

  return Array.from(signals);
}

function deriveComplete(answers: IntakeAnswers): string[] {
  const out: string[] = [];
  if (hasText(answers.whatCreated)) out.push("A description of what you created");
  if (hasText(answers.problemSolved)) out.push("The problem it aims to solve");
  if (hasText(answers.whoFor)) out.push("Who it is for");
  if (hasText(answers.howItWorks)) out.push("How it works");
  if (hasText(answers.mainParts)) out.push("Its main parts or components");
  if (hasText(answers.whatDifferent)) out.push("What makes it different");
  if (answers.hasPrototype) out.push("A prototype exists");
  if (answers.assets.length > 0) out.push("Supporting materials (drawings, notes, code, etc.)");
  if (hasText(answers.location)) out.push("Your location for matching local resources");
  return out;
}

function deriveMissing(answers: IntakeAnswers): string[] {
  const out: string[] = [];
  if (!hasText(answers.howItWorks))
    out.push("A clear explanation of how it works");
  if (!hasText(answers.mainParts))
    out.push("A breakdown of the main parts or components");
  if (!hasText(answers.whatDifferent))
    out.push("What makes it different from existing solutions");
  if (!answers.hasPrototype)
    out.push("A prototype or working demonstration");
  if (answers.assets.length === 0)
    out.push("Supporting materials such as drawings, diagrams, or notes");
  if (answers.goals.length === 0)
    out.push("Clarity on what kind of support you are looking for");
  return out;
}

function deriveExpertQuestions(
  answers: IntakeAnswers,
  signals: IpSignal[],
): string[] {
  const questions: string[] = [];
  if (signals.includes("patent_invention")) {
    questions.push(
      "Which parts of how my idea works might be most important to describe in detail?",
    );
  }
  if (signals.includes("trademark_brand")) {
    questions.push(
      "What should I check before committing to my name, logo, or slogan?",
    );
  }
  if (signals.includes("copyright_creative_software")) {
    questions.push(
      "How should I document and organize my creative work or code?",
    );
  }
  if (signals.includes("trade_secret")) {
    questions.push(
      "What should I keep confidential, and how should I handle conversations about it?",
    );
  }
  if (isPubliclyShared(answers)) {
    questions.push(
      "I have already shared this publicly — how might that affect my options and timing?",
    );
  }
  questions.push(
    "Given my situation, what is the most useful next preparation step for me?",
  );
  return questions;
}

function deriveResources(
  answers: IntakeAnswers,
  signals: IpSignal[],
): ResourceCategory[] {
  const resources = new Set<ResourceCategory>(["education"]);

  if (signals.includes("patent_invention")) {
    resources.add("ptrc");
    resources.add(answers.wantsProBono ? "patent_pro_bono" : "patent_agent_attorney");
  }
  if (signals.includes("trademark_brand")) {
    resources.add("trademark_search");
  }
  if (signals.includes("copyright_creative_software")) {
    resources.add("copyright_registration");
  }
  if (
    signals.includes("nda_business_support") ||
    answers.goals.includes("funding") ||
    answers.goals.includes("business_support")
  ) {
    resources.add("business_accelerator");
  }
  if (answers.wantsProBono) {
    resources.add("law_school_clinic");
  }
  return Array.from(resources);
}

function buildNextStep(
  answers: IntakeAnswers,
  signals: IpSignal[],
  missingCount: number,
): string {
  if (missingCount >= 3) {
    return "Based on your answers, your next preparation step may be to fill in the missing details above — especially how your idea works and what makes it different — so an expert can quickly understand it.";
  }
  if (signals.includes("patent_invention")) {
    return "Based on your answers, your next preparation step may be to organize a clear written and visual description of how your idea works and consider discussing it with a patent resource before any public disclosure.";
  }
  if (signals.includes("trademark_brand") && signals.length === 1) {
    return "Based on your answers, your next preparation step may be to run an informal trademark search and consider discussing brand protection with a professional.";
  }
  return "Based on your answers, your next preparation step may be to gather your materials and consider discussing them with one of the recommended resources below.";
}

export function generateProfile(answers: IntakeAnswers): ReadinessProfile {
  const signals = deriveSignals(answers);
  const completeInfo = deriveComplete(answers);
  const missingInfo = deriveMissing(answers);
  const publicDisclosure = isPubliclyShared(answers);

  return {
    ideaSummary: buildSummary(answers),
    signals,
    completeInfo,
    missingInfo,
    publicDisclosure,
    publicDisclosureNote: publicDisclosure
      ? "Your answers indicate this idea may already have been shared publicly. Public sharing can affect timing and options in some situations, so a professional may want to review when and how it was shared."
      : "Your answers do not indicate public sharing yet. If you plan to share it, consider discussing timing with a professional first.",
    suggestedNextStep: buildNextStep(answers, signals, missingInfo.length),
    expertQuestions: deriveExpertQuestions(answers, signals),
    recommendedResources: deriveResources(answers, signals),
    disclaimer: DISCLAIMER,
    generator: "rule",
  };
}
