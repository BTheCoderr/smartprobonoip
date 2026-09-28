import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLegalChatFallback,
  buildLegalDraftFallback,
} from "@/lib/legal/fallback";

describe("legal deterministic fallbacks", () => {
  it("keeps chat fallback preparation-focused", () => {
    const text = buildLegalChatFallback([
      { role: "user", content: "I have a hearing tomorrow and received a notice." },
    ]);
    assert.match(text, /facts/i);
    assert.match(text, /deadline|hearing|time-sensitive/i);
    assert.match(text, /preparation support only/i);
    assert.doesNotMatch(text, /you should file|you will win|you are eligible/i);
  });

  it("builds a review-labeled draft from supplied facts only", () => {
    const text = buildLegalDraftFallback({
      documentType: "Factual summary",
      jurisdiction: "",
      facts: "I received a written notice on September 1.",
      goal: "Bring a neutral summary to a professional.",
      tone: "Professional and factual",
    });
    assert.match(text, /^DRAFT — FOR REVIEW/);
    assert.match(text, /I received a written notice on September 1/);
    assert.match(text, /\[TO CONFIRM\]/);
    assert.match(text, /not legal advice/i);
  });
});
