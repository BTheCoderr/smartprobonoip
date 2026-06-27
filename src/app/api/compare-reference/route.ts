import { NextResponse } from "next/server";
import {
  assertCompareOutputSafe,
  buildCompareReference,
} from "@/lib/compareReference";
import { containsForbiddenLanguage } from "@/lib/safety";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
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

  if (!body.referenceTitle?.trim() && !body.referenceAbstract?.trim()) {
    return NextResponse.json(
      { error: "Reference title or notes required" },
      { status: 422 },
    );
  }

  try {
    const comparison = buildCompareReference({
      ideaSummary: "",
      problemSolved: body.problemSolved ?? "",
      howItWorks: body.howItWorks ?? "",
      mainParts: body.mainParts ?? "",
      userDescribedDifferences: body.userDescribedDifferences ?? "",
      referenceTitle: body.referenceTitle ?? "",
      referenceAbstract: body.referenceAbstract ?? "",
    });

    assertCompareOutputSafe(comparison);

    if (containsForbiddenLanguage(JSON.stringify(comparison))) {
      return NextResponse.json(
        { error: "Unsafe language in comparison output" },
        { status: 500 },
      );
    }

    return NextResponse.json({ comparison });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Comparison failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
