import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDocumentAnalysisFallback,
  formatDocumentSummary,
  parseDocumentAnalysis,
} from "@/lib/legal/documentAnalysis";

describe("legal document analysis", () => {
  it("extracts deterministic date and action language without making legal conclusions", () => {
    const analysis = buildDocumentAnalysisFallback(
      "NOTICE\nYou must provide a written response within 10 days. A hearing is listed for October 14, 2026. This notice was sent by Example Housing LLC.",
    );

    assert.ok(analysis.dateReferences.some((item) => /within 10 days/i.test(item)));
    assert.ok(analysis.dateReferences.some((item) => /October 14, 2026/i.test(item)));
    assert.ok(analysis.actionLanguage.some((item) => /must provide/i.test(item)));
    assert.match(analysis.caution, /confirm/i);
    assert.doesNotMatch(analysis.overview, /you are required by law|legal deadline/i);
  });

  it("parses bounded JSON returned by the legal model", () => {
    const analysis = parseDocumentAnalysis(
      JSON.stringify({
        overview: "This appears to be a written notice requesting a response.",
        keyPoints: ["The document requests a written response."],
        peopleAndOrganizations: ["Example LLC"],
        dateReferences: ["October 14, 2026"],
        actionLanguage: ["Provide a written response."],
        questionsToConfirm: ["Confirm whether the stated date is a legal deadline."],
        caution: "Confirm rights and deadlines with an authoritative source.",
      }),
      "fallback text",
    );

    assert.equal(analysis.peopleAndOrganizations[0], "Example LLC");
    assert.equal(analysis.dateReferences[0], "October 14, 2026");
  });

  it("formats a downloadable preparation summary", () => {
    const text = formatDocumentSummary(
      "notice.pdf",
      buildDocumentAnalysisFallback("You must respond by October 14, 2026."),
    );
    assert.match(text, /SMARTPROBONO — DOCUMENT PREPARATION SUMMARY/);
    assert.match(text, /notice\.pdf/);
    assert.match(text, /not legal advice/i);
  });
});
