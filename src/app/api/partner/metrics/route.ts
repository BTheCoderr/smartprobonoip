import { NextResponse } from "next/server";
import { listLiveRecords, verifyPartnerSecret } from "@/lib/db/records";
import { getResearchMetricsForLiveRecords } from "@/lib/db/research";
import { computeMetrics } from "@/lib/metrics";
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

  const limited = enforceRateLimit(request, "partner-metrics", RATE_LIMITS.partner);
  if (limited) return limited;

  const secret = readPartnerSecretHeader(request);
  if (!verifyPartnerSecret(secret)) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 401 });
  }

  const records = await listLiveRecords();
  const metrics = computeMetrics(records);
  const researchMetrics = await getResearchMetricsForLiveRecords();
  return NextResponse.json({ records, metrics, researchMetrics });
}
