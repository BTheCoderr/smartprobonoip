import "server-only";

export type LegalModelMessage = {
  role: "user" | "assistant";
  content: string;
};

type RunLegalModelInput = {
  system: string;
  messages: LegalModelMessage[];
  maxTokens?: number;
};

export async function runLegalModel({
  system,
  messages,
  maxTokens = 1600,
}: RunLegalModelInput): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.25,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Legal model request failed (${response.status})${detail ? `: ${detail.slice(0, 240)}` : ""}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Legal model returned an empty response");
  }

  return content;
}
