import { normalizeAnswersForPacket } from "./intakeValidation";
import { containsForbiddenLanguage } from "./safety";
import type { IntakeAnswers, IpSignal } from "./types";

export interface SignalGuide {
  label: string;
  whyItMatters: string;
  whatToPrepare: string;
  suggestedResourceType: string;
}

export const SIGNAL_KEYS: IpSignal[] = [
  "patent_invention",
  "trademark_brand",
  "copyright_creative",
  "software_code",
  "trade_secret",
  "nda_confidentiality",
  "public_disclosure",
  "licensing_commercialization",
  "business_formation",
  "domain_digital_identity",
  "design_appearance",
  "prior_art_search",
  "expert_review",
];

export const SIGNAL_CATALOG: Record<IpSignal, SignalGuide> = {
  patent_invention: {
    label: "Patent / invention",
    whyItMatters:
      "Because your idea includes how something works or is built, a professional may want to review the details.",
    whatToPrepare:
      "Consider preparing a clear description of how it works, main parts, and what makes it different.",
    suggestedResourceType:
      "Patent and Trademark Resource Center (PTRC) or patent agent / attorney",
  },
  trademark_brand: {
    label: "Trademark / brand",
    whyItMatters:
      "Because your idea includes a name, logo, or brand identity, brand topics may be relevant to discuss.",
    whatToPrepare:
      "Consider preparing how you use the name or logo and where it appears.",
    suggestedResourceType: "Trademark search resources or IP clinic",
  },
  copyright_creative: {
    label: "Copyright / creative work",
    whyItMatters:
      "Because your idea includes creative files or content, copyright topics may be relevant to discuss.",
    whatToPrepare:
      "Consider organizing drafts, artwork, photos, scripts, or other creative materials with dates.",
    suggestedResourceType: "Copyright registration resources or IP clinic",
  },
  software_code: {
    label: "Software code / app assets",
    whyItMatters:
      "Because your idea includes software, app screens, or technical documentation, a professional may want to review how it is described.",
    whatToPrepare:
      "Consider preparing screenshots, wireframes, code notes, and a plain-language workflow summary.",
    suggestedResourceType: "IP clinic, PTRC, or software-focused IP resources",
  },
  trade_secret: {
    label: "Trade secret / confidential know-how",
    whyItMatters:
      "Because parts of your idea may be kept private, confidential know-how topics may be relevant.",
    whatToPrepare:
      "Consider noting what you keep private, who has access, and how you share information.",
    suggestedResourceType: "IP clinic or business legal support",
  },
  nda_confidentiality: {
    label: "NDA / confidentiality",
    whyItMatters:
      "Because you may share with partners, manufacturers, investors, or collaborators, confidentiality preparation may be relevant.",
    whatToPrepare:
      "Consider preparing who you plan to share with and what you will show them.",
    suggestedResourceType: "Business legal support or IP clinic",
  },
  public_disclosure: {
    label: "Public disclosure / timing",
    whyItMatters:
      "Because your answers suggest public sharing may have happened or is planned, timing may be relevant to discuss.",
    whatToPrepare:
      "Consider preparing when and how you shared or plan to share the idea.",
    suggestedResourceType: "Patent resource or IP clinic for timing review",
  },
  licensing_commercialization: {
    label: "Licensing / commercialization",
    whyItMatters:
      "Because you may license, sell rights, or partner commercially, commercialization preparation may be relevant.",
    whatToPrepare:
      "Consider preparing your goals, audience, and any terms you have in mind to discuss.",
    suggestedResourceType: "Business accelerator or IP clinic",
  },
  business_formation: {
    label: "Business formation / contracts",
    whyItMatters:
      "Because you may need entity, founder, or contractor support, business formation topics may be relevant.",
    whatToPrepare:
      "Consider preparing founder roles, contractor relationships, and basic business documents you may need.",
    suggestedResourceType: "Business legal support or law school clinic",
  },
  domain_digital_identity: {
    label: "Domain / digital identity",
    whyItMatters:
      "Because your idea includes an online name, app name, or digital identity, naming conflicts may be worth reviewing.",
    whatToPrepare:
      "Consider preparing domain names, social handles, and app store names you plan to use.",
    suggestedResourceType: "Trademark search or business support resources",
  },
  design_appearance: {
    label: "Design / product appearance",
    whyItMatters:
      "Because your idea includes how something looks, packaging, or visual design, appearance topics may be relevant.",
    whatToPrepare:
      "Consider preparing sketches, photos, or UI mockups that show the look and feel.",
    suggestedResourceType: "Design-focused IP resources or IP clinic",
  },
  prior_art_search: {
    label: "Prior art / similar reference search",
    whyItMatters:
      "Because your idea includes technical or functional details, similar reference preparation may help before an expert conversation.",
    whatToPrepare:
      "Consider preparing search terms, possible similar products, and questions for review — not a legal conclusion.",
    suggestedResourceType: "PTRC, Google Patents, or USPTO search resources",
  },
  expert_review: {
    label: "Expert review needed",
    whyItMatters:
      "Based on your answers, a patent agent, attorney, clinic, mentor, or innovation partner may want to review the details with you.",
    whatToPrepare:
      "Consider bringing this packet, your materials, and your top questions.",
    suggestedResourceType: "IP clinic, PTRC, pro bono program, or patent professional",
  },
};

export const SIGNAL_LABELS: Record<IpSignal, string> = Object.fromEntries(
  SIGNAL_KEYS.map((key) => [key, SIGNAL_CATALOG[key].label]),
) as Record<IpSignal, string>;

/** @deprecated Use SIGNAL_CATALOG[key].whyItMatters for display */
export const SIGNAL_DESCRIPTIONS: Record<IpSignal, string> = Object.fromEntries(
  SIGNAL_KEYS.map((key) => [key, SIGNAL_CATALOG[key].whyItMatters]),
) as Record<IpSignal, string>;

const LEGACY_SIGNAL_MAP: Record<string, IpSignal[]> = {
  copyright_creative_software: ["copyright_creative", "software_code"],
  nda_business_support: ["nda_confidentiality", "business_formation"],
};

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function textBlob(answers: IntakeAnswers): string {
  return [
    answers.whatCreated,
    answers.problemSolved,
    answers.howItWorks,
    answers.mainParts,
    answers.whatDifferent,
  ]
    .join(" ")
    .toLowerCase();
}

function mentions(text: string, ...terms: string[]): boolean {
  return terms.some((term) => {
    if (term.length <= 3) {
      return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
        text,
      );
    }
    return text.includes(term);
  });
}

function includesAny(
  answers: IntakeAnswers,
  ...keys: NonNullable<IntakeAnswers["ideaIncludes"]>[number][]
): boolean {
  const selected = answers.ideaIncludes ?? [];
  return keys.some((key) => selected.includes(key));
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

export function suggestIdeaIncludes(answers: IntakeAnswers): NonNullable<IntakeAnswers["ideaIncludes"]> {
  const suggested = new Set<NonNullable<IntakeAnswers["ideaIncludes"]>[number]>();

  if (answers.hasBrandIdentity || answers.itemType === "brand") {
    suggested.add("brand_name");
  }
  if (answers.itemType === "software") {
    suggested.add("software_app");
  }
  if (hasText(answers.howItWorks) || hasText(answers.mainParts)) {
    suggested.add("how_it_works");
  }
  if (
    answers.itemType === "creative_work" ||
    answers.assets.some((a) =>
      ["photos", "recordings", "drawings", "notes"].includes(a),
    )
  ) {
    suggested.add("creative_files");
  }
  if (isConfidential(answers) && hasText(answers.howItWorks)) {
    suggested.add("keep_private");
  }
  if (
    answers.sharedChannels.some((c) =>
      ["investors", "customers", "pitch", "event"].includes(c),
    )
  ) {
    suggested.add("share_with_partners");
  }
  if (answers.goals.includes("licensing")) {
    suggested.add("license_commercialize");
  }
  if (answers.itemType === "design" || answers.assets.includes("wireframes")) {
    suggested.add("look_and_design");
  }
  if (answers.hasBrandIdentity && answers.itemType === "software") {
    suggested.add("online_identity");
  }

  return Array.from(suggested);
}

export function deriveSignals(rawAnswers: IntakeAnswers): IpSignal[] {
  const answers = normalizeAnswersForPacket(rawAnswers);
  const signals = new Set<IpSignal>();
  const blob = textBlob(answers);

  const functional =
    includesAny(answers, "how_it_works") ||
    ["physical_product", "process", "recipe"].includes(answers.itemType) ||
    (answers.itemType === "software" &&
      hasText(answers.howItWorks) &&
      hasText(answers.mainParts)) ||
    (answers.itemType === "design" && hasText(answers.howItWorks));

  if (functional) signals.add("patent_invention");

  if (
    includesAny(answers, "brand_name", "online_identity") ||
    answers.hasBrandIdentity ||
    answers.itemType === "brand" ||
    mentions(blob, "logo", "slogan", "brand", "name")
  ) {
    signals.add("trademark_brand");
  }

  if (
    includesAny(answers, "creative_files") ||
    answers.itemType === "creative_work" ||
    answers.itemType === "software" ||
    (answers.itemType !== "physical_product" &&
      answers.assets.some((a) => ["photos", "recordings", "drawings"].includes(a)))
  ) {
    signals.add("copyright_creative");
  }

  if (
    includesAny(answers, "software_app") ||
    answers.itemType === "software" ||
    answers.assets.some((a) => ["code", "wireframes", "screenshots"].includes(a)) ||
    (answers.assets.includes("diagrams") &&
      ["software", "process", "design"].includes(answers.itemType))
  ) {
    signals.add("software_code");
  }

  if (
    includesAny(answers, "keep_private") ||
    (isConfidential(answers) &&
      ["process", "recipe"].includes(answers.itemType) &&
      (hasText(answers.howItWorks) || hasText(answers.mainParts)))
  ) {
    signals.add("trade_secret");
  }

  if (
    includesAny(answers, "share_with_partners") ||
    answers.sharedChannels.some((c) =>
      ["investors", "customers", "pitch", "event"].includes(c),
    ) ||
    answers.goals.some((g) => ["funding", "licensing"].includes(g))
  ) {
    signals.add("nda_confidentiality");
  }

  if (isPubliclyShared(answers)) {
    signals.add("public_disclosure");
  }

  if (
    includesAny(answers, "license_commercialize") ||
    answers.goals.includes("licensing") ||
    mentions(blob, "license", "white-label", "franchise", "commercialize")
  ) {
    signals.add("licensing_commercialization");
  }

  if (
    answers.goals.includes("business_support") ||
    includesAny(answers, "license_commercialize") ||
    mentions(blob, "llc", "founder", "contractor", "operating agreement", "terms of service")
  ) {
    signals.add("business_formation");
  }

  if (
    includesAny(answers, "online_identity") ||
    mentions(blob, "domain", "app store", "social handle", "username", "website name")
  ) {
    signals.add("domain_digital_identity");
  }

  if (
    includesAny(answers, "look_and_design") ||
    answers.itemType === "design" ||
    (answers.assets.includes("wireframes") && answers.itemType !== "software") ||
    mentions(blob, "packaging", "ornamental", "shape", "look and feel", "ui")
  ) {
    signals.add("design_appearance");
  }

  if (
    signals.has("patent_invention") ||
    includesAny(answers, "how_it_works") ||
    answers.goals.includes("protection")
  ) {
    signals.add("prior_art_search");
  }

  if (
    answers.goals.includes("expert_review") ||
    answers.goals.includes("protection") ||
    signals.size >= 4
  ) {
    signals.add("expert_review");
  }

  return SIGNAL_KEYS.filter((key) => signals.has(key));
}

export function normalizeLegacySignals(
  signals: string[],
  answers?: IntakeAnswers,
): IpSignal[] {
  const out = new Set<IpSignal>();

  for (const signal of signals) {
    if (SIGNAL_KEYS.includes(signal as IpSignal)) {
      out.add(signal as IpSignal);
      continue;
    }
    const mapped = LEGACY_SIGNAL_MAP[signal];
    if (mapped) {
      mapped.forEach((s) => out.add(s));
    }
  }

  if (signals.includes("copyright_creative_software") && answers) {
    if (answers.itemType !== "software") out.delete("software_code");
    if (answers.itemType === "software" && !answers.assets.includes("code")) {
      out.add("software_code");
    }
  }

  if (signals.includes("nda_business_support") && answers) {
    if (!answers.goals.includes("business_support") && !answers.wantsProBono) {
      out.delete("business_formation");
    }
  }

  return SIGNAL_KEYS.filter((key) => out.has(key));
}

export function normalizeProfileSignals(
  signals: string[],
  answers?: IntakeAnswers,
): IpSignal[] {
  const normalized = normalizeLegacySignals(signals, answers);
  return normalized.length > 0 ? normalized : deriveSignals(answers ?? ({} as IntakeAnswers));
}

export function assertSignalCatalogSafe(): void {
  const text = Object.values(SIGNAL_CATALOG)
    .flatMap((entry) => [
      entry.label,
      entry.whyItMatters,
      entry.whatToPrepare,
      entry.suggestedResourceType,
    ])
    .join(" \n ");
  if (containsForbiddenLanguage(text)) {
    throw new Error("Signal catalog contains forbidden language");
  }
}
