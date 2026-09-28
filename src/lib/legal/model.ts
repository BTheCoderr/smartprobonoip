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

type ChatCompletionPayload = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

async function runChatCompletion({
  url,
  apiKey,
  model,
  system,
  messages,
  maxTokens,
}: {
  url: string;
  apiKey: string;
  model: string;
  system: string;
  messages: LegalModelMessage[];
  maxTokens: number;
}): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Legal model request failed (${response.status})${detail ? `: ${detail.slice(0, 240)}` : ""}`,
    );
  }

  const data = (await response.json()) as ChatCompletionPayload;
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Legal model returned an empty response");
  }

  return content;
}

/**
 * Use Groq when explicitly configured for the legal experience, otherwise
 * reuse the platform's existing OpenAI server key. This lets the unified app
 * work with the current SmartProBonoIP deployment configuration while still
 * supporting the provider used by the legacy legal app.
 */
export async function runLegalModel({
  system,
  messages,
  maxTokens = 1600,
}: RunLegalModelInput): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return runChatCompletion({
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      system,
      messages,
      maxTokens,
    });
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    return runChatCompletion({
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: openAiKey,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      system,
      messages,
      maxTokens,
    });
  }

  throw new Error("No legal AI provider is configured");
}
