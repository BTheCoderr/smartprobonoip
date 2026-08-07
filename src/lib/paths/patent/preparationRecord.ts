import type { ProjectRecord } from "@/lib/types";

export const AI_PREP_TOOL_DISCLAIMER =
  "This line records how SmartProBonoIP helped organize the inventor's own descriptions. It is not an inventorship determination, a USPTO disclosure, or a legal conclusion about AI use in creating the invention.";

/**
 * Factual record that the inventor used SmartProBonoIP's AI-assisted preparation
 * features — distinct from inventorship AI-assistance notes on the invention itself.
 */
export function buildAiPreparationToolRecord(record: ProjectRecord): string | null {
  if (record.profile.generator !== "ai") {
    return null;
  }
  return "The inventor used SmartProBonoIP's AI-assisted preparation tool to help organize their own invention descriptions into this packet. All sections remain editable drafts for review with a professional.";
}
