import {
  buildExpertHandoff,
  buildMaterialsChecklist,
  buildPatentPrepChecklist,
  getIdeaLabel,
} from "./packet";
import { buildPatentSearchPrep } from "./patentSearchPrep";
import {
  COACH_SAFETY_NOTE,
  isCoachResponseSafe,
  type CoachMode,
  type CoachResponse,
} from "./coach";
import { SIGNAL_LABELS } from "./labels";
import type { ProjectRecord } from "./types";

const SYSTEM_PROMPT = `You are the AI Packet Coach for SmartProBonoIP, an educational IP readiness tool for overlooked inventors and creators.
Your ONLY job is to help the user organize, clarify, and prepare their existing idea packet before they talk to a real expert (patent agent, attorney, clinic, mentor, or innovation partner).

You are NOT a lawyer and you do NOT give legal advice. You must answer based on the user's ACTUAL packet/intake/profile context provided to you — not as a general chatbot.

STRICT SAFETY RULES (never break these):
- NEVER say "you need a patent", "your idea is patentable", "you should file", "this is protectable", or "this is not protectable".
- NEVER make any legal conclusion or decide whether something can be protected.
- Only use safe framing such as: "Based on your packet...", "A professional may want to review...", "Consider preparing...", "This may be relevant to discuss with...", "You may want to clarify...".
- Be encouraging, plain-language, specific to the user's answers, and concise.

You help with: missing details, clearer explanations, possible expert questions, public sharing timeline preparation, user-described differences from existing solutions, prototype/materials checklist, plain-language summary improvement, expert handoff summaries, patent search terms, prior art prep, and comparing possible similar references.

For patent search / prior art modes: use "possible similar references", "search terms to try", and "not a legal conclusion". NEVER say something blocks a patent, proves novelty, or clears infringement.

Respond with ONLY a JSON object with these keys:
- title: string (short heading)
- intro: string (one sentence that references the user's packet)
- bullets: string[] (3-7 concrete, packet-specific preparation points)`;

function buildContext(record: ProjectRecord) {
  const { answers, profile } = record;
  return {
    ideaLabel: getIdeaLabel(answers),
    intake: {
      whatCreated: answers.whatCreated,
      problemSolved: answers.problemSolved,
      whoFor: answers.whoFor,
      howItWorks: answers.howItWorks,
      mainParts: answers.mainParts,
      whatDifferent: answers.whatDifferent,
      itemType: answers.itemType,
      hasPrototype: answers.hasPrototype,
      assets: answers.assets,
      sharedChannels: answers.sharedChannels,
      hasBrandIdentity: answers.hasBrandIdentity,
      goals: answers.goals,
    },
    profile: {
      ideaSummary: profile.ideaSummary,
      signals: profile.signals.map((s) => SIGNAL_LABELS[s]),
      completeInfo: profile.completeInfo,
      missingInfo: profile.missingInfo,
      publicDisclosure: profile.publicDisclosure,
      expertQuestions: profile.expertQuestions,
    },
    derived: {
      checklistGaps: buildPatentPrepChecklist(record)
        .filter((row) => !row.complete)
        .map((row) => row.label),
      materialsToGather: buildMaterialsChecklist(record)
        .filter((m) => !m.available)
        .map((m) => m.label),
      expertHandoff: buildExpertHandoff(record),
      patentSearchPrep: (() => {
        const prep = buildPatentSearchPrep(record);
        return {
          searchKeywords: prep.searchKeywords,
          suggestedQueries: prep.suggestedQueries,
          expertPrepQuestions: prep.expertPrepQuestions,
        };
      })(),
    },
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
}

export async function generateCoachAI(
  record: ProjectRecord,
  mode: CoachMode | "custom",
  question?: string,
): Promise<CoachResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const userPrompt = JSON.stringify({
    coachMode: mode,
    userQuestion: question ?? null,
    packetContext: buildContext(record),
  });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");

  const parsed = JSON.parse(content) as {
    title?: unknown;
    intro?: unknown;
    bullets?: unknown;
  };

  const bullets = asStringArray(parsed.bullets);
  if (bullets.length === 0) throw new Error("AI returned no bullets");

  const response: CoachResponse = {
    mode,
    title: typeof parsed.title === "string" ? parsed.title : "Preparation help",
    intro:
      typeof parsed.intro === "string" && parsed.intro.trim().length > 0
        ? parsed.intro
        : "Based on your packet:",
    bullets,
    note: COACH_SAFETY_NOTE,
    generator: "ai",
  };

  if (!isCoachResponseSafe(response)) {
    throw new Error("Coach AI output failed safety check");
  }

  return response;
}
