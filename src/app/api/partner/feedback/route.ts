import { NextResponse } from "next/server";
import { computeFeedbackMetrics } from "@/lib/feedbackMetrics";
import { listFeedbackRecords } from "@/lib/db/feedback";
import { verifyPartnerSecret } from "@/lib/db/records";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

function readSecret(request: Request): string | null {
  return (
    request.headers.get("x-partner-secret") ??
    new URL(request.url).searchParams.get("secret")
  );
}

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  if (!verifyPartnerSecret(readSecret(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feedback = await listFeedbackRecords();
  const metrics = computeFeedbackMetrics(feedback);
  return NextResponse.json({ feedback, metrics });
}
