import type { IntakeAnswers, ReadinessProfile } from "./types";

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function generateProfileAI(
  _answers: IntakeAnswers,
): Promise<ReadinessProfile> {
  void _answers;
  throw new Error("AI generation not yet implemented");
}
