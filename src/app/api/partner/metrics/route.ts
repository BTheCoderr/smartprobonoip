import { NextResponse } from "next/server";
import { listLiveRecords } from "@/lib/db/records";
import { getResearchMetricsForLiveRecords } from "@/lib/db/research";
import { computeMetrics } from "@/lib/metrics";
import { redactRecordsForPartnerMetrics } from "@/lib/security/partnerRecordRedaction";
import { GENERIC_UNAUTHORIZED } from "@/lib/security/api";
import { authorizePartnerAdminRequest } from "@/lib/security/partnerAdminAuth";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const limited = enforceRateLimit(request, "partner-metrics", RATE_LIMITS.partner);
  if (limited) return limited;

  if (!(await authorizePartnerAdminRequest(request))) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 401 });
  }

  const records = await listLiveRecords();
  const metrics = computeMetrics(records);
  const researchMetrics = await getResearchMetricsForLiveRecords();
  return NextResponse.json({
    records: redactRecordsForPartnerMetrics(records),
    metrics,
    researchMetrics,
  });
}
