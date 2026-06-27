import { DISCLAIMER } from "./disclaimer";
import { generateProfile } from "./generateProfile";
import { RESOURCE_LABELS } from "./labels";
import {
  normalizeProfileSignals,
  SIGNAL_KEYS,
} from "./signals";

import { containsForbiddenLanguage } from "./safety";
import type {
  IntakeAnswers,
  ReadinessProfile,
  ResourceCategory,
} from "./types";

const RESOURCE_KEYS = Object.keys(RESOURCE_LABELS) as ResourceCategory[];

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

interface AiProfileShape {
  ideaSummary: string;
  signals: string[];
  completeInfo: string[];
  missingInfo: string[];
  publicDisclosureNote: string;
  suggestedNextStep: string;
  expertQuestions: string[];
  recommendedResources: string[];
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

function containsForbidden(text: string): boolean {
  return containsForbiddenLanguage(text);
}

const SYSTEM_PROMPT = `You are an assistant for SmartProBonoIP, an educational IP readiness tool for overlooked inventors and creators.
You help people ORGANIZE and PREPARE their idea before they reach a real expert. You are NOT a lawyer and you do NOT give legal advice.

STRICT SAFETY RULES (never break these):
- NEVER say "you need a patent", "your idea is patentable", "you should file", or any legal conclusion.
- NEVER claim something is or is not protectable.
- Only use safe framing such as: "This may be relevant to...", "Consider discussing this with...", "A professional may want to review...", "Based on your answers, your next preparation step may be...".
- Be encouraging, plain-language, and concise.

You will receive intake answers and a rule-based draft. Improve the clarity and helpfulness of the narrative fields while staying strictly within the safety rules.

Respond with ONLY a JSON object with these keys:
- ideaSummary: string (plain-language, 2-4 sentences)
- signals: string[] (subset of the allowed signal keys)
- completeInfo: string[]
- missingInfo: string[]
- publicDisclosureNote: string
- suggestedNextStep: string (must start with a safe-framing phrase)
- expertQuestions: string[]
- recommendedResources: string[] (subset of the allowed resource keys)`;

export async function generateProfileAI(
  answers: IntakeAnswers,
): Promise<ReadinessProfile> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const ruleDraft = generateProfile(answers);
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const userPrompt = JSON.stringify({
    allowedSignals: SIGNAL_KEYS,
    allowedResources: RESOURCE_KEYS,
    intakeAnswers: answers,
    ruleBasedDraft: {
      ideaSummary: ruleDraft.ideaSummary,
      signals: ruleDraft.signals,
      completeInfo: ruleDraft.completeInfo,
      missingInfo: ruleDraft.missingInfo,
      suggestedNextStep: ruleDraft.suggestedNextStep,
      expertQuestions: ruleDraft.expertQuestions,
      recommendedResources: ruleDraft.recommendedResources,
    },
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

  const parsed = JSON.parse(content) as Partial<AiProfileShape>;

  const parsedSignals = normalizeProfileSignals(
    asStringArray(parsed.signals),
    answers,
  );

  const profile: ReadinessProfile = {
    ideaSummary: typeof parsed.ideaSummary === "string" ? parsed.ideaSummary : ruleDraft.ideaSummary,
    signals: parsedSignals.length > 0 ? parsedSignals : ruleDraft.signals,
    completeInfo: asStringArray(parsed.completeInfo).length
      ? asStringArray(parsed.completeInfo)
      : ruleDraft.completeInfo,
    missingInfo: asStringArray(parsed.missingInfo).length
      ? asStringArray(parsed.missingInfo)
      : ruleDraft.missingInfo,
    publicDisclosure: ruleDraft.publicDisclosure,
    publicDisclosureNote:
      typeof parsed.publicDisclosureNote === "string"
        ? parsed.publicDisclosureNote
        : ruleDraft.publicDisclosureNote,
    suggestedNextStep:
      typeof parsed.suggestedNextStep === "string"
        ? parsed.suggestedNextStep
        : ruleDraft.suggestedNextStep,
    expertQuestions: asStringArray(parsed.expertQuestions).length
      ? asStringArray(parsed.expertQuestions)
      : ruleDraft.expertQuestions,
    recommendedResources: (() => {
      const recommendedResources = asStringArray(
        parsed.recommendedResources,
      ).filter((r): r is ResourceCategory =>
        RESOURCE_KEYS.includes(r as ResourceCategory),
      );
      return recommendedResources.length > 0
        ? recommendedResources
        : ruleDraft.recommendedResources;
    })(),
    disclaimer: DISCLAIMER,
    generator: "ai",
  };

  const safetyCheck = [
    profile.ideaSummary,
    profile.suggestedNextStep,
    profile.publicDisclosureNote,
    ...profile.completeInfo,
    ...profile.missingInfo,
    ...profile.expertQuestions,
  ].join(" \n ");

  if (containsForbidden(safetyCheck)) {
    throw new Error("AI output failed safety check");
  }

  return profile;
}
