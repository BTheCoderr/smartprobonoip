const FORBIDDEN = [
  /\byou\s+need\s+a\s+patent\b/i,
  /\bis\s+patentable\b/i,
  /\byour\s+idea\s+is\s+patentable\b/i,
  /\byour\s+idea\s+is\s+protectable\b/i,
  /\byou\s+should\s+(file|patent|trademark|copyright)\b/i,
  /\bwe\s+recommend\s+filing\b/i,
  /\byou\s+have\s+a\s+(valid|strong)\s+(patent|trademark|claim)\b/i,
  /\bthis\s+is\s+(patentable|protectable|copyrightable)\b/i,
  /\bthis\s+blocks\s+your\s+patent\b/i,
  /\bblocks\s+your\s+patent\b/i,
  /\byou\s+are\s+clear\s+to\s+file\b/i,
  /\bclear\s+to\s+file\b/i,
  /\bproves\s+novelty\b/i,
  /\b(this|it)\s+infringes\b/i,
  /\bdoes\s+not\s+infringe\b/i,
  /\bclearance\s+opinion\b/i,
  /\bnot\s+protectable\b/i,
  /\bthis\s+protects\s+your\s+idea\b/i,
  /\byou\s+need\s+this\s+protection\b/i,
  /\bthis\s+protects\s+you\b/i,
  /\bthis\s+proves\s+ownership\b/i,
  /\bthis\s+clears\s+your\s+brand\b/i,
  /\bthis\s+contract\s+is\s+valid\b/i,
  /\byou\s+should\s+sign\b/i,
  /\byou\s+own\s+this\b/i,
  /\bthey\s+own\s+this\b/i,
  /\bwe\s+provide\s+legal\s+advice\b/i,
];

export const REFERENCE_REVIEW_DISCLAIMER =
  "These comparisons are preparation notes only. They are not a legal opinion, patentability analysis, infringement analysis, or clearance opinion. A qualified professional should review any references before decisions are made.";

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
