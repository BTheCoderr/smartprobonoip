import { DISCLAIMER } from "./disclaimer";
import { normalizeAnswersForPacket } from "./intakeValidation";
import { assertSafeLanguage, collectProfileText } from "./safety";
import { ITEM_TYPE_LABELS } from "./labels";
import {
  assertSignalCatalogSafe,
  deriveSignals,
} from "./signals";
import { resolveBrandName } from "./brandName";
import {
  cleanText,
  joinSentences,
  preserveBrandInText,
} from "./textCleanup";
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

function stripTrailingPunctuation(value: string): string {
  return value.replace(/[.!?]+$/, "").trim();
}

function buildSummary(answers: IntakeAnswers): string {
  const brand = resolveBrandName(answers);
  const createdRaw = hasText(answers.whatCreated)
    ? stripTrailingPunctuation(clean(answers.whatCreated))
    : "";
  const created =
    createdRaw && !/https?:\/\//i.test(createdRaw) && !/smartprobonoip/i.test(createdRaw)
      ? preserveBrandInText(createdRaw, brand)
      : "your idea";

  const parts: string[] = [`You described ${lowerFirst(created)}`];

  if (hasText(answers.problemSolved)) {
    parts.push(
      `It aims to address ${lowerFirst(stripTrailingPunctuation(clean(answers.problemSolved)))}`,
    );
  }
  if (hasText(answers.whoFor)) {
    parts.push(
      `It is intended for ${lowerFirst(stripTrailingPunctuation(clean(answers.whoFor)))}`,
    );
  }
  parts.push(
    `It is described as a ${ITEM_TYPE_LABELS[answers.itemType].toLowerCase()}`,
  );

  return preserveBrandInText(joinSentences(parts), brand);
}

function lowerFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function snippet(value: string, max = 72): string {
  const trimmed = clean(value);
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function deriveExpertQuestions(
  answers: IntakeAnswers,
  signals: IpSignal[],
): string[] {
  const questions: string[] = [];
  if (signals.includes("patent_invention")) {
    questions.push(
      hasText(answers.mainParts)
        ? `I broke my idea into these parts: ${snippet(answers.mainParts)} — which details should I document more clearly before a patent conversation?`
        : "Which parts of how my idea works should I describe in more detail before meeting with a patent professional?",
    );
  }
  if (signals.includes("trademark_brand")) {
    questions.push(
      answers.hasBrandIdentity
        ? "I already use a name or logo — what should I check before investing further in branding?"
        : "If I plan to use a product name or logo, what should I prepare before committing to it?",
    );
  }
  if (signals.includes("copyright_creative")) {
    questions.push(
      "What creative files or content should I organize and date before talking with an expert?",
    );
  }
  if (signals.includes("software_code")) {
    questions.push(
      hasText(answers.howItWorks)
        ? `My app or software works like this: ${snippet(answers.howItWorks)} — what technical documentation would be useful to bring?`
        : "What technical documentation should I gather for my software or app idea?",
    );
  }
  if (signals.includes("trade_secret")) {
    questions.push(
      "What should stay confidential, and how should I handle early conversations about the idea?",
    );
  }
  if (signals.includes("nda_confidentiality")) {
    questions.push(
      "Who am I planning to share this with next, and what should I prepare before those conversations?",
    );
  }
  if (signals.includes("public_disclosure") || isPubliclyShared(answers)) {
    questions.push(
      "I shared this idea publicly — how might timing affect what I should prepare or ask about next?",
    );
  }
  if (signals.includes("prior_art_search")) {
    questions.push(
      hasText(answers.whatDifferent)
        ? `I think my idea differs because: ${snippet(answers.whatDifferent)} — what similar products or references should I bring to discuss?`
        : "What search terms or similar products should I bring when discussing possible references?",
    );
  }
  questions.push(
    hasText(answers.problemSolved)
      ? `Given the problem I'm solving (${snippet(answers.problemSolved, 48)}), what is the most useful next preparation step for me?`
      : "Given my situation, what is the most useful next preparation step before expert review?",
  );
  return questions;
}

function deriveResources(
  answers: IntakeAnswers,
  signals: IpSignal[],
): ResourceCategory[] {
  const resources = new Set<ResourceCategory>(["education"]);

  if (
    signals.includes("patent_invention") ||
    signals.includes("prior_art_search")
  ) {
    resources.add("ptrc");
    resources.add(answers.wantsProBono ? "patent_pro_bono" : "patent_agent_attorney");
  }
  if (
    signals.includes("trademark_brand") ||
    signals.includes("domain_digital_identity")
  ) {
    resources.add("trademark_search");
  }
  if (signals.includes("copyright_creative")) {
    resources.add("copyright_registration");
  }
  if (
    signals.includes("nda_confidentiality") ||
    signals.includes("business_formation") ||
    signals.includes("licensing_commercialization") ||
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

function buildNextStep(
  answers: IntakeAnswers,
  signals: IpSignal[],
  missingCount: number,
): string {
  if (missingCount >= 3) {
    return "Based on your answers, your next preparation step may be to fill in the missing details above — especially how your idea works and what makes it different — so an expert can quickly understand it.";
  }
  if (signals.includes("patent_invention")) {
    const disclosurePhrase = isPubliclyShared(answers)
      ? "before any additional public disclosure or filing decision"
      : "before public disclosure";
    return `Based on your answers, your next preparation step may be to organize a clear written and visual description of how your idea works and consider discussing it with a patent resource ${disclosurePhrase}.`;
  }
  if (signals.includes("trademark_brand") && signals.length === 1) {
    return "Based on your answers, your next preparation step may be to run an informal trademark search and consider discussing brand protection with a professional.";
  }
  return "Based on your answers, your next preparation step may be to gather your materials and consider discussing them with one of the recommended resources below.";
}

export function generateProfile(rawAnswers: IntakeAnswers): ReadinessProfile {
  assertSignalCatalogSafe();
  const answers = normalizeAnswersForPacket(rawAnswers);
  const signals = deriveSignals(answers);
  const completeInfo = deriveComplete(answers);
  const missingInfo = deriveMissing(answers);
  const publicDisclosure = isPubliclyShared(answers);

  const profile: ReadinessProfile = {
    ideaSummary: cleanText(buildSummary(answers)),
    signals,
    completeInfo,
    missingInfo,
    publicDisclosure,
    publicDisclosureNote: publicDisclosure
      ? "Your answers indicate this idea may already have been shared publicly. A professional may want to review when and how it was shared before any additional public disclosure or filing decision."
      : "Your answers do not indicate public sharing yet. If you plan to share it, consider discussing timing with a professional before public disclosure.",
    suggestedNextStep: buildNextStep(answers, signals, missingInfo.length),
    expertQuestions: deriveExpertQuestions(answers, signals),
    recommendedResources: deriveResources(answers, signals),
    disclaimer: DISCLAIMER,
    generator: "rule",
  };

  assertSafeLanguage(collectProfileText(profile), "rule-based profile");
  return profile;
}
