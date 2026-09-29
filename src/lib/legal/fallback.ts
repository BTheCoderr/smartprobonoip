import type { LegalModelMessage } from "@/lib/legal/model";

function lastUserMessage(messages: LegalModelMessage[]): string {
  return [...messages].reverse().find((message) => message.role === "user")?.content.trim() ?? "";
}

function mentionsUrgency(text: string): boolean {
  return /\b(today|tomorrow|deadline|hearing|court date|eviction|lockout|arrest|served|summons|emergency|unsafe|threat|restraining order)\b/i.test(text);
}

export function buildLegalChatFallback(
  messages: LegalModelMessage[],
  handoff?: string,
): string {
  const latest = lastUserMessage(messages);
  const urgency = mentionsUrgency(latest);

  return [
    "I can still help you get organized even though the AI drafting service is unavailable right now.",
    "",
    "Start with these facts:",
    "1. What happened, in date order?",
    "2. What documents, notices, messages, receipts, agreements, or court papers do you have?",
    "3. Who is involved, and what did each person or organization actually say or do?",
    "4. What outcome are you trying to reach?",
    "5. What facts are you unsure about or still need to verify?",
    "",
    "Questions to prepare for a court, legal-aid office, or qualified attorney:",
    "- What rules or deadlines apply in my jurisdiction?",
    "- What documents should I bring or preserve?",
    "- Is there anything I should avoid doing before I get advice?",
    "- What is the next procedural step I should confirm?",
    urgency
      ? ""
      : null,
    urgency
      ? "Because your message may involve a deadline, hearing, safety issue, or time-sensitive notice, confirm the timing promptly with the relevant court, agency, legal-aid provider, or qualified attorney."
      : null,
    handoff?.trim()
      ? ""
      : null,
    handoff?.trim()
      ? "I also received preparation context from another SmartProBono tool. Keep that context with your documents so a professional can review it."
      : null,
    latest
      ? ""
      : null,
    latest
      ? "I have not made a legal conclusion from your message. This checklist is preparation support only."
      : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function buildLegalDraftFallback(input: {
  documentType: string;
  jurisdiction: string;
  facts: string;
  goal: string;
  tone: string;
}): string {
  return [
    "DRAFT — FOR REVIEW",
    "",
    input.documentType.toUpperCase(),
    "",
    `Jurisdiction: ${input.jurisdiction || "[TO CONFIRM]"}`,
    `Tone requested: ${input.tone || "Professional and factual"}`,
    "",
    "Purpose",
    input.goal || "[TO CONFIRM]",
    "",
    "Facts provided by the user",
    input.facts || "[TO CONFIRM]",
    "",
    "Requested next step",
    "Please review the facts above and respond or advise on the appropriate next step.",
    "",
    "Items to confirm before sending or filing",
    "- Names, dates, addresses, amounts, and document references are accurate.",
    "- Any deadline, filing rule, legal requirement, or jurisdiction-specific language has been confirmed with an authoritative source or qualified professional.",
    "- Any missing material fact is added before the draft is used.",
    "",
    "Prepared with SmartProBono for factual organization and review. This draft is not legal advice or attorney work product.",
  ].join("\n");
}
