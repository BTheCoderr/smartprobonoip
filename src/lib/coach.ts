import { SHARING_LABELS } from "./labels";
import {
  buildExpertHandoff,
  buildMaterialsChecklist,
  buildPatentPrepChecklist,
  DEVELOPMENT_TIMELINE_FIELDS,
  getIdeaLabel,
} from "./packet";
import {
  buildPatentSearchPrep,
  PATENT_SEARCH_PREP_DISCLAIMER,
  WORKSHEET_HEADERS,
} from "./patentSearchPrep";
import { containsForbiddenLanguage } from "./safety";
import type { ProjectRecord } from "./types";

export type CoachMode =
  | "missing_info"
  | "expert_questions"
  | "explain_better"
  | "difference_map"
  | "timeline_prep"
  | "materials_checklist"
  | "expert_handoff"
  | "search_terms"
  | "compare_reference"
  | "similar_ref_questions"
  | "user_differences"
  | "prior_art_checklist";

export interface CoachAction {
  mode: CoachMode;
  label: string;
}

export const COACH_ACTIONS: CoachAction[] = [
  { mode: "missing_info", label: "What information am I missing?" },
  { mode: "expert_questions", label: "What might an expert ask me?" },
  { mode: "explain_better", label: "Help me explain my idea better" },
  {
    mode: "difference_map",
    label: "Help me describe what makes this different",
  },
  { mode: "timeline_prep", label: "Help me prepare my development timeline" },
  {
    mode: "materials_checklist",
    label: "Help me organize drawings and materials",
  },
  { mode: "expert_handoff", label: "Create a short expert handoff summary" },
  { mode: "search_terms", label: "Generate patent search terms" },
  {
    mode: "compare_reference",
    label: "Help me compare my idea to a similar patent",
  },
  {
    mode: "similar_ref_questions",
    label: "What should I ask an expert about similar references?",
  },
  {
    mode: "user_differences",
    label: "Help me describe user-stated differences",
  },
  { mode: "prior_art_checklist", label: "Create a prior art prep checklist" },
];

export const COACH_INTRO =
  "Need help preparing for your expert conversation? Ask the AI Packet Coach to help you clarify your answers, identify missing information, and prepare for a patent agent, attorney, clinic, mentor, or innovation partner.";

export const COACH_SAFETY_NOTE =
  "This is preparation help only — not legal advice and not a legal conclusion. A professional may want to review the details with you.";

export type CoachGenerator = "rule" | "ai";

export interface CoachResponse {
  mode: CoachMode | "custom";
  title: string;
  intro: string;
  bullets: string[];
  note: string;
  generator: CoachGenerator;
}

const MODE_TITLES: Record<CoachMode, string> = {
  missing_info: "Information you may want to add",
  expert_questions: "Questions you may want to prepare for",
  explain_better: "Ways to explain your idea more clearly",
  difference_map: "Describing what makes your idea different",
  timeline_prep: "Preparing your development timeline",
  materials_checklist: "Organizing your drawings and materials",
  expert_handoff: "A short expert handoff summary",
  search_terms: "Patent search terms to try",
  compare_reference: "Comparing your idea to a similar reference",
  similar_ref_questions: "Questions about similar references",
  user_differences: "Describing user-stated differences for comparison",
  prior_art_checklist: "Prior art prep checklist",
};

function text(v: string | undefined): string {
  return v?.trim() ?? "";
}

function ruleMissingInfo(record: ProjectRecord): string[] {
  const fromProfile = record.profile.missingInfo.filter(
    (m) => m.trim().length > 0,
  );
  if (fromProfile.length > 0) return fromProfile;

  const gaps = buildPatentPrepChecklist(record)
    .filter((row) => !row.complete)
    .map((row) => `Consider adding: ${row.label.toLowerCase()}.`);
  return gaps.length > 0
    ? gaps
    : [
        "Based on your packet, the core sections look filled in. Consider adding more detail anywhere your answers feel short.",
      ];
}

function ruleExpertQuestions(record: ProjectRecord): string[] {
  const questions = record.profile.expertQuestions.filter(
    (q) => q.trim().length > 0,
  );
  if (questions.length > 0) return questions;
  return [
    "How would you describe what your idea does, in one or two sentences?",
    "Which parts of your idea do you think are most original?",
    "Where and when have you shared your idea so far?",
  ];
}

function ruleExplainBetter(record: ProjectRecord): string[] {
  const a = record.answers;
  const tips: string[] = [];
  if (text(a.whatCreated).length < 80) {
    tips.push(
      "You may want to expand what you created — add what it physically is or does.",
    );
  }
  if (text(a.problemSolved).length < 80) {
    tips.push(
      "Consider clarifying the problem it solves and who feels that problem most.",
    );
  }
  if (text(a.howItWorks).length < 80) {
    tips.push(
      "Consider describing how it works step by step, as if explaining to someone new.",
    );
  }
  if (text(a.whoFor).length < 40) {
    tips.push("You may want to name a specific user or customer it is for.");
  }
  if (tips.length === 0) {
    tips.push(
      "Your summary already reads clearly. Consider reading it aloud and trimming any jargon.",
    );
  }
  tips.push(
    "Try this structure: what it is, the problem it solves, who it is for, and how it works.",
  );
  return tips;
}

function ruleDifferenceMap(record: ProjectRecord): string[] {
  const described = text(record.answers.whatDifferent);
  const bullets: string[] = [];
  if (described.length > 0) {
    bullets.push(`You described this difference: "${described}".`);
  }
  bullets.push(
    "For each difference, note the existing option or current way people solve this.",
    "Then note what your idea does differently.",
    "Then note why that difference matters to the user or customer.",
    "These are user-described differences only. A professional would need to review whether they matter legally.",
  );
  return bullets;
}

function ruleTimelinePrep(record: ProjectRecord): string[] {
  const shared = record.answers.sharedChannels.filter((c) => c !== "none");
  const bullets = DEVELOPMENT_TIMELINE_FIELDS.map(
    (field) => `${field}: (fill in the date you remember — approximate is fine)`,
  );
  if (shared.length > 0) {
    bullets.push(
      `You reported sharing through: ${shared
        .map((c) => SHARING_LABELS[c])
        .join(", ")}. Try to recall when each first happened.`,
    );
  }
  return bullets;
}

function ruleMaterialsChecklist(record: ProjectRecord): string[] {
  const items = buildMaterialsChecklist(record);
  const have = items.filter((i) => i.available).map((i) => i.label);
  const need = items.filter((i) => !i.available).map((i) => i.label);
  const bullets: string[] = [];
  if (have.length > 0) {
    bullets.push(`Already noted: ${have.join(", ")}.`);
  }
  if (need.length > 0) {
    bullets.push(`Consider gathering: ${need.join(", ")}.`);
  }
  bullets.push(
    "Keep dated copies of each item in one folder so they are easy to hand to a professional.",
  );
  return bullets;
}

function ruleExpertHandoff(record: ProjectRecord): string[] {
  const h = buildExpertHandoff(record);
  const bullets = [
    `Idea: ${h.idea}`,
    `Problem: ${h.problem}`,
    `Main components: ${h.mainComponents}`,
    `How it works: ${h.howItWorks}`,
    `User-described differences: ${h.differences}`,
    `Prototype status: ${h.prototypeStatus}`,
    `Public sharing: ${h.publicSharingTimeline}`,
    `Materials available: ${h.materialsAvailable}`,
  ];
  if (h.expertQuestions.length > 0) {
    bullets.push(`Questions to ask: ${h.expertQuestions.join(" / ")}`);
  }
  return bullets;
}

function ruleSearchTerms(record: ProjectRecord): string[] {
  const prep = buildPatentSearchPrep(record);
  const bullets = [
    `Search keywords from your packet: ${prep.searchKeywords.slice(0, 12).join(", ") || "(add more detail to your packet first)"}.`,
    "Suggested search queries to try:",
    ...prep.suggestedQueries.map((q) => `• ${q}`),
    "Try these on Google Patents or USPTO Patent Public Search — possible similar references only, not a legal conclusion.",
  ];
  return bullets;
}

function ruleCompareReference(record: ProjectRecord): string[] {
  const different = text(record.answers.whatDifferent);
  const bullets = [
    "When you find a possible similar reference, use your Similar Reference Worksheet:",
    ...WORKSHEET_HEADERS.map((h) => `• ${h}`),
    "Note what looks similar and what seems different — user-described differences only.",
  ];
  if (different.length > 0) {
    bullets.push(`Your user-stated difference to highlight: "${different}".`);
  }
  bullets.push(
    "A professional may want to review how you explain the comparison — this may help prepare your expert conversation.",
  );
  return bullets;
}

function ruleSimilarRefQuestions(record: ProjectRecord): string[] {
  return buildPatentSearchPrep(record).expertPrepQuestions;
}

function ruleUserDifferences(record: ProjectRecord): string[] {
  const described = text(record.answers.whatDifferent);
  const bullets: string[] = [];
  if (described.length > 0) {
    bullets.push(`You described: "${described}".`);
  } else {
    bullets.push(
      "You may want to clarify what your idea does differently from existing options.",
    );
  }
  bullets.push(
    "When comparing to a possible similar reference, describe:",
    "• The existing option or current way people solve this",
    "• What your idea does differently (user-described only)",
    "• Why that difference matters to you or your customer",
    "These are user-described differences only — a professional would need to review whether they matter legally.",
    PATENT_SEARCH_PREP_DISCLAIMER,
  );
  return bullets;
}

function rulePriorArtChecklist(record: ProjectRecord): string[] {
  const prep = buildPatentSearchPrep(record);
  return [
    "Consider preparing the following before searching for possible similar references:",
    "☐ Review your search keywords and suggested queries in your packet",
    "☐ Try 2–3 searches on Google Patents or USPTO Patent Public Search",
    "☐ Fill in your Similar Reference Worksheet for each reference you find",
    "☐ Note user-described differences — not a legal conclusion",
    "☐ Bring your worksheet and materials to your expert conversation",
    `Suggested queries to start: ${prep.suggestedQueries.slice(0, 3).join(" / ")}`,
    "A professional may want to review any possible similar references with you.",
  ];
}

const RULE_BUILDERS: Record<CoachMode, (r: ProjectRecord) => string[]> = {
  missing_info: ruleMissingInfo,
  expert_questions: ruleExpertQuestions,
  explain_better: ruleExplainBetter,
  difference_map: ruleDifferenceMap,
  timeline_prep: ruleTimelinePrep,
  materials_checklist: ruleMaterialsChecklist,
  expert_handoff: ruleExpertHandoff,
  search_terms: ruleSearchTerms,
  compare_reference: ruleCompareReference,
  similar_ref_questions: ruleSimilarRefQuestions,
  user_differences: ruleUserDifferences,
  prior_art_checklist: rulePriorArtChecklist,
};

export function buildRuleCoachResponse(
  record: ProjectRecord,
  mode: CoachMode | "custom",
  question?: string,
): CoachResponse {
  const ideaLabel = getIdeaLabel(record.answers);

  if (mode === "custom") {
    const q = text(question);
    const bullets = [
      "Based on your packet, here is how to prepare for that question:",
      "Review the matching section of your IP Readiness Packet and add any missing detail.",
      "Write down what you are unsure about so you can ask a professional.",
      "A professional may want to review the specifics with you.",
    ];
    return {
      mode: "custom",
      title: q.length > 0 ? "Preparing your question" : "Preparing your packet",
      intro:
        q.length > 0
          ? `You asked: "${q}". Here are safe preparation suggestions based on your packet for "${ideaLabel}".`
          : `Here are safe preparation suggestions based on your packet for "${ideaLabel}".`,
      bullets,
      note: COACH_SAFETY_NOTE,
      generator: "rule",
    };
  }

  return {
    mode,
    title: MODE_TITLES[mode],
    intro: `Based on your packet for "${ideaLabel}":`,
    bullets: RULE_BUILDERS[mode](record),
    note: COACH_SAFETY_NOTE,
    generator: "rule",
  };
}

export function coachResponseText(response: CoachResponse): string {
  return [response.title, response.intro, ...response.bullets, response.note].join(
    " \n ",
  );
}

export function isCoachResponseSafe(response: CoachResponse): boolean {
  return !containsForbiddenLanguage(coachResponseText(response));
}

export function isCoachMode(value: unknown): value is CoachMode {
  return (
    typeof value === "string" &&
    COACH_ACTIONS.some((a) => a.mode === (value as CoachMode))
  );
}
