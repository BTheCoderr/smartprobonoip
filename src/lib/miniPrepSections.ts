import { buildOwnershipAgreementPrep } from "./ownership";
import { containsForbiddenLanguage } from "./safety";
import type { IntakeAnswers, ProjectRecord } from "./types";

export type MiniPrepSectionId =
  | "trademark_brand"
  | "copyright_creative"
  | "nda_confidentiality"
  | "ownership_agreement";

export interface MiniPrepSection {
  id: MiniPrepSectionId;
  title: string;
  subtitle: string;
  whyItMatters: string;
  whatToGather: string[];
  questionsToAsk: string[];
  suggestedResourceType: string;
  disclaimer: string;
  personalizedNotes?: { label: string; value: string }[];
}

export const MINI_PREP_DISCLAIMER =
  "Preparation only — not legal advice and not a legal conclusion. A professional may want to review your notes before next steps.";

function includesAny(
  answers: IntakeAnswers,
  ...keys: NonNullable<IntakeAnswers["ideaIncludes"]>[number][]
): boolean {
  const selected = answers.ideaIncludes ?? [];
  return keys.some((key) => selected.includes(key));
}

export function shouldTriggerTrademarkPrep(record: ProjectRecord): boolean {
  const { profile, answers } = record;
  if (
    profile.signals.includes("trademark_brand") ||
    profile.signals.includes("domain_digital_identity")
  ) {
    return true;
  }
  if (answers.hasBrandIdentity || answers.itemType === "brand") return true;
  if (includesAny(answers, "brand_name", "online_identity")) return true;
  if (
    profile.signals.includes("design_appearance") &&
    (answers.itemType === "physical_product" ||
      answers.itemType === "design" ||
      answers.assets.includes("photos"))
  ) {
    return true;
  }
  return false;
}

export function shouldTriggerCopyrightPrep(record: ProjectRecord): boolean {
  return (
    record.profile.signals.includes("copyright_creative") ||
    record.profile.signals.includes("software_code")
  );
}

export function shouldTriggerNdaPrep(record: ProjectRecord): boolean {
  return (
    record.profile.signals.includes("nda_confidentiality") ||
    record.profile.signals.includes("trade_secret")
  );
}

export function shouldTriggerOwnershipPrep(record: ProjectRecord): boolean {
  return record.profile.signals.includes("ownership_collaborator");
}

function buildTrademarkPrep(): MiniPrepSection {
  return {
    id: "trademark_brand",
    title: "Trademark / brand prep",
    subtitle:
      "Organize brand-related details before a professional conversation — preparation only.",
    whyItMatters:
      "Because your idea includes a name, logo, slogan, app name, product identity, or online presence, brand topics may be relevant to discuss with a professional.",
    whatToGather: [
      "How you use the name, logo, or slogan today",
      "Where the brand appears (website, packaging, app store, social profiles)",
      "Domain names, social handles, and app or product names you plan to use",
      "Sketches, logo files, or packaging images if you have them",
    ],
    questionsToAsk: [
      "What brand materials should I gather before a review?",
      "Are there similar names in my field I should note for a professional?",
      "What questions should I ask about app names, domains, or packaging identity?",
      "What should I clarify before sharing brand files with partners?",
    ],
    suggestedResourceType: "Trademark search resources or IP clinic",
    disclaimer: MINI_PREP_DISCLAIMER,
  };
}

function buildCopyrightPrep(): MiniPrepSection {
  return {
    id: "copyright_creative",
    title: "Copyright / creative work prep",
    subtitle:
      "Organize creative materials and sharing history — preparation only, not a rights determination.",
    whyItMatters:
      "Because your idea includes creative content, written work, images, music, videos, code, designs, or other creative assets, copyright topics may be relevant to discuss.",
    whatToGather: [
      "What files exist (drafts, images, recordings, code, designs, course material)",
      "Approximate creation dates or version history if you have it",
      "Contributors who helped create the work",
      "Where the work has been shared publicly or privately",
    ],
    questionsToAsk: [
      "What files and dates should I organize before a review?",
      "How should I describe contributors and their roles?",
      "What should I note about where my work has been shared?",
      "What materials would help a professional understand my creative assets?",
    ],
    suggestedResourceType: "Copyright resources or IP clinic",
    disclaimer: MINI_PREP_DISCLAIMER,
  };
}

function buildNdaPrep(record: ProjectRecord): MiniPrepSection {
  const { answers } = record;
  const shareChannels = answers.sharedChannels.filter((c) => c !== "none");
  const personalizedNotes: { label: string; value: string }[] = [];

  if (shareChannels.length > 0) {
    personalizedNotes.push({
      label: "Sharing channels you noted",
      value: shareChannels.join(", "),
    });
  }
  if (includesAny(answers, "keep_private")) {
    personalizedNotes.push({
      label: "Keep private signal",
      value: "You indicated some details may need to stay private.",
    });
  }

  return {
    id: "nda_confidentiality",
    title: "NDA / confidentiality prep",
    subtitle:
      "Organize sharing plans and privacy boundaries — preparation only, not a contract review.",
    whyItMatters:
      "Because you may share with contractors, manufacturers, investors, collaborators, designers, developers, agencies, or partners — or want to keep something private — confidentiality preparation may be relevant.",
    whatToGather: [
      "Who you plan to share with (roles or organizations, not legal names required)",
      "What you plan to show or demo",
      "What you want to keep private or limit access to",
      "Whether any written agreement already exists (yes / no / not sure)",
    ],
    questionsToAsk: [
      "What should I prepare before sharing technical or business details?",
      "What should I clarify about what stays private vs. what can be shown?",
      "Should a professional review any existing agreements before I share more?",
      "What questions should I ask about contractor or partner conversations?",
    ],
    suggestedResourceType: "Business legal support or IP clinic",
    disclaimer: MINI_PREP_DISCLAIMER,
    personalizedNotes: personalizedNotes.length > 0 ? personalizedNotes : undefined,
  };
}

function buildOwnershipPrep(record: ProjectRecord): MiniPrepSection {
  const prep = buildOwnershipAgreementPrep(record);
  const personalizedNotes: { label: string; value: string }[] = [
    { label: "Contributors / helpers", value: prep.contributorsSummary },
    { label: "What they helped with", value: prep.helpSummary },
    { label: "Agreements you noted", value: prep.agreementsSummary },
    {
      label: "Employer / school / grant / contractor flag",
      value: prep.institutionFlag,
    },
  ];
  if (prep.optionalNote) {
    personalizedNotes.push({ label: "Your notes", value: prep.optionalNote });
  }

  return {
    id: "ownership_agreement",
    title: "Ownership / agreement prep",
    subtitle:
      "Organize contributor and agreement details — preparation only, not an ownership determination.",
    whyItMatters:
      "Because cofounders, freelancers, contractors, employers, schools, grants, designers, developers, or manufacturers may be involved — or agreements may be unclear — ownership topics may be worth reviewing before next steps.",
    whatToGather: [
      "Contributors and what each person helped with",
      "Whether written agreements exist (and agreement types if known)",
      "Employer, school, or grant involvement if applicable",
      "Notes about unclear or informal arrangements",
    ],
    questionsToAsk: prep.expertQuestions,
    suggestedResourceType:
      "Business legal support, IP clinic, law school clinic, or startup/legal mentor",
    disclaimer: prep.disclaimer,
    personalizedNotes,
  };
}

export function getTriggeredMiniPrepSections(
  record: ProjectRecord,
): MiniPrepSection[] {
  const sections: MiniPrepSection[] = [];
  if (shouldTriggerTrademarkPrep(record)) sections.push(buildTrademarkPrep());
  if (shouldTriggerCopyrightPrep(record)) sections.push(buildCopyrightPrep());
  if (shouldTriggerNdaPrep(record)) sections.push(buildNdaPrep(record));
  if (shouldTriggerOwnershipPrep(record)) {
    sections.push(buildOwnershipPrep(record));
  }
  return sections;
}

export function hasMiniPrepSections(record: ProjectRecord): boolean {
  return getTriggeredMiniPrepSections(record).length > 0;
}

export function assertMiniPrepSectionsSafe(): void {
  const sample = [buildTrademarkPrep(), buildCopyrightPrep()];
  const text = sample
    .flatMap((s) => [
      s.title,
      s.subtitle,
      s.whyItMatters,
      ...s.whatToGather,
      ...s.questionsToAsk,
      s.suggestedResourceType,
      s.disclaimer,
    ])
    .join(" \n ");
  if (containsForbiddenLanguage(text)) {
    throw new Error("Mini prep sections contain forbidden language");
  }
}
