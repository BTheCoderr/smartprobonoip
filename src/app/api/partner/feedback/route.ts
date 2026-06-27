import { NextResponse } from "next/server";
import { computeFeedbackMetrics } from "@/lib/feedbackMetrics";
import { listFeedbackRecords } from "@/lib/db/feedback";
import { verifyPartnerSecret } from "@/lib/db/records";
import {
  GENERIC_UNAUTHORIZED,
  readPartnerSecretHeader,
} from "@/lib/security/api";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const limited = enforceRateLimit(
    request,
    "partner-feedback",
    RATE_LIMITS.partner,
  );
  if (limited) return limited;

  if (!verifyPartnerSecret(readPartnerSecretHeader(request))) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 401 });
  }

  const feedback = await listFeedbackRecords();
  const metrics = computeFeedbackMetrics(feedback);
  return NextResponse.json({ feedback, metrics });
}
