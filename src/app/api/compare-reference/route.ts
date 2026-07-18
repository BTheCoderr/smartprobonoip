import { NextResponse } from "next/server";
import {
  assertCompareOutputSafe,
  buildCompareReference,
} from "@/lib/compareReference";
import { getRecordById } from "@/lib/db/records";
import { containsForbiddenLanguage } from "@/lib/safety";
import {
  GENERIC_SERVER_ERROR,
  GENERIC_UNAUTHORIZED,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import {
  assertTextWithinLimit,
  limitErrorResponse,
  MAX_TEXT,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 401 });
  }

  const limited = enforceRateLimit(
    request,
    "compare-reference",
    RATE_LIMITS.compareReference,
    pilotSession,
  );
  if (limited) return limited;

  let body: {
    projectId?: string;
    problemSolved?: string;
    howItWorks?: string;
    mainParts?: string;
    userDescribedDifferences?: string;
    referenceTitle?: string;
    referenceAbstract?: string;
  };

  try {
    body = (await readJsonWithLimit(request)) as typeof body;
    assertTextWithinLimit(body.problemSolved, MAX_TEXT.long);
    assertTextWithinLimit(body.howItWorks, MAX_TEXT.long);
    assertTextWithinLimit(body.mainParts, MAX_TEXT.long);
    assertTextWithinLimit(body.userDescribedDifferences, MAX_TEXT.long);
    assertTextWithinLimit(body.referenceTitle, MAX_TEXT.researchTitle);
    assertTextWithinLimit(body.referenceAbstract, MAX_TEXT.researchNotes);
  } catch (err) {
    return (
      limitErrorResponse(err) ??
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    );
  }

  if (!body.projectId?.trim()) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  const record = await getRecordById(body.projectId.trim(), pilotSession);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.referenceTitle?.trim() && !body.referenceAbstract?.trim()) {
    return NextResponse.json(
      { error: "Reference title or notes required" },
      { status: 422 },
    );
  }

  try {
    const comparison = buildCompareReference({
      ideaSummary: "",
      problemSolved: body.problemSolved ?? record.answers.problemSolved,
      howItWorks: body.howItWorks ?? record.answers.howItWorks,
      mainParts: body.mainParts ?? record.answers.mainParts,
      userDescribedDifferences:
        body.userDescribedDifferences ?? record.answers.whatDifferent ?? "",
      referenceTitle: body.referenceTitle ?? "",
      referenceAbstract: body.referenceAbstract ?? "",
    });

    assertCompareOutputSafe(comparison);

    if (containsForbiddenLanguage(JSON.stringify(comparison))) {
      return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
    }

    return NextResponse.json({ comparison });
  } catch (err) {
    logServerError("compare-reference", err, { route: "compare-reference" });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
