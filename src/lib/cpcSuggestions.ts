import type { ProjectRecord } from "./types";

const CPC_KEYWORD_RULES: { pattern: RegExp; code: string; label: string }[] = [
  {
    pattern: /\b(filter|filtration|purif|cartridge|membrane)\b/i,
    code: "B01D",
    label: "Separation / filters",
  },
  {
    pattern: /\b(hiker|outdoor|camping|backpack|travel gear)\b/i,
    code: "A45F",
    label: "Travel or outdoor articles",
  },
  {
    pattern: /\b(software|app|algorithm|database|cloud)\b/i,
    code: "G06F",
    label: "Computing arrangements",
  },
  {
    pattern: /\b(medical|diagnostic|therapy|patient)\b/i,
    code: "A61B",
    label: "Medical diagnosis / monitoring",
  },
  {
    pattern: /\b(chemical|compound|formulation|polymer)\b/i,
    code: "C07C",
    label: "Organic chemistry",
  },
  {
    pattern: /\b(mechanical|gear|engine|motor|pump)\b/i,
    code: "F16H",
    label: "Gearing / mechanical transmission",
  },
];

export interface CpcSuggestion {
  code: string;
  label: string;
}

export function suggestCpcCodes(record: ProjectRecord): CpcSuggestion[] {
  const corpus = [
    record.answers.whatCreated,
    record.answers.mainParts,
    record.answers.howItWorks,
    record.answers.problemSolved,
  ].join(" ");

  const seen = new Set<string>();
  const results: CpcSuggestion[] = [];
  for (const rule of CPC_KEYWORD_RULES) {
    if (!rule.pattern.test(corpus) || seen.has(rule.code)) continue;
    seen.add(rule.code);
    results.push({ code: rule.code, label: rule.label });
  }
  return results.slice(0, 6);
}
