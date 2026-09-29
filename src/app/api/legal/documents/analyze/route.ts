import { NextResponse } from "next/server";
import {
  buildDocumentAnalysisFallback,
  DOCUMENT_ANALYSIS_TEXT_LIMIT,
  LEGAL_DOCUMENT_ANALYSIS_PROMPT,
  parseDocumentAnalysis,
} from "@/lib/legal/documentAnalysis";
import { runLegalModel } from "@/lib/legal/model";
import { wrapUntrustedUserData } from "@/lib/security/aiUserContent";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import {
  assertTextWithinLimit,
  limitErrorResponse,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";

type AnalyzeBody = {
  fileName?: unknown;
  text?: unknown;
  truncated?: unknown;
};

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "legal-document-analyze", {
    limit: 12,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  try {
    const body = (await readJsonWithLimit(request, 80_000)) as AnalyzeBody;
    const fileName = typeof body.fileName === "string" ? body.fileName.trim().slice(0, 180) : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const truncated = body.truncated === true;

    assertTextWithinLimit(text, 60_000);
    if (!text) {
      return NextResponse.json({ error: "No extracted document text was provided." }, { status: 422 });
    }

    const analysisText = text.slice(0, DOCUMENT_ANALYSIS_TEXT_LIMIT);
    const payload = wrapUntrustedUserData({
      fileName: fileName || "uploaded document",
      sourceWasTruncated: truncated || text.length > DOCUMENT_ANALYSIS_TEXT_LIMIT,
      documentText: analysisText,
    });

    try {
      const raw = await runLegalModel({
        system: LEGAL_DOCUMENT_ANALYSIS_PROMPT,
        messages: [{ role: "user", content: payload }],
        maxTokens: 2200,
      });
      return NextResponse.json({
        analysis: parseDocumentAnalysis(raw, analysisText),
        mode: "ai",
        analysisWasTruncated: truncated || text.length > DOCUMENT_ANALYSIS_TEXT_LIMIT,
      });
    } catch (error) {
      logServerError("legal.document.analyze.ai_fallback", error, {
        route: "api/legal/documents/analyze",
      });
      return NextResponse.json({
        analysis: buildDocumentAnalysisFallback(analysisText),
        mode: "fallback",
        analysisWasTruncated: truncated || text.length > DOCUMENT_ANALYSIS_TEXT_LIMIT,
      });
    }
  } catch (error) {
    const limitedResponse = limitErrorResponse(error);
    if (limitedResponse) return limitedResponse;

    logServerError("legal.document.analyze", error, {
      route: "api/legal/documents/analyze",
    });
    return NextResponse.json(
      { error: "SmartProBono could not analyze this document right now." },
      { status: 500 },
    );
  }
}
