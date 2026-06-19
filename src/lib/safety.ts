const FORBIDDEN = [
  /\byou\s+need\s+a\s+patent\b/i,
  /\bis\s+patentable\b/i,
  /\byour\s+idea\s+is\s+protectable\b/i,
  /\byou\s+should\s+(file|patent|trademark|copyright)\b/i,
  /\bwe\s+recommend\s+filing\b/i,
  /\byou\s+have\s+a\s+(valid|strong)\s+(patent|trademark|claim)\b/i,
  /\bthis\s+is\s+(patentable|protectable|copyrightable)\b/i,
  /\bwe\s+provide\s+legal\s+advice\b/i,
];

export function containsForbiddenLanguage(text: string): boolean {
  return FORBIDDEN.some((re) => re.test(text));
}

export function assertSafeLanguage(text: string, field = "output"): void {
  if (containsForbiddenLanguage(text)) {
    throw new Error(`Unsafe language detected in ${field}`);
  }
}

export function collectProfileText(fields: {
  ideaSummary: string;
  suggestedNextStep: string;
  publicDisclosureNote: string;
  completeInfo: string[];
  missingInfo: string[];
  expertQuestions: string[];
}): string {
  return [
    fields.ideaSummary,
    fields.suggestedNextStep,
    fields.publicDisclosureNote,
    ...fields.completeInfo,
    ...fields.missingInfo,
    ...fields.expertQuestions,
  ].join(" \n ");
}
