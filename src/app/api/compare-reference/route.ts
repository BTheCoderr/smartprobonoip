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
  readPilotSession,
} from "@/lib/security/api";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const pilotSession = readPilotSession(request);
  if (!pilotSession) {
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
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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
  } catch {
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
