import { NextResponse } from "next/server";
import { computeAnalyticsDashboard } from "@/lib/analyticsMetrics";
import { listAnalyticsEvents } from "@/lib/db/analytics";
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
    "partner-analytics",
    RATE_LIMITS.partner,
  );
  if (limited) return limited;

  if (!verifyPartnerSecret(readPartnerSecretHeader(request))) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 401 });
  }

  const url = new URL(request.url);
  const filters = {
    partner: url.searchParams.get("partner") ?? "all",
    source: url.searchParams.get("source") ?? "all",
    campaign: url.searchParams.get("campaign") ?? "all",
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
  };

  const events = await listAnalyticsEvents(filters);
  const analytics = computeAnalyticsDashboard(events);
  return NextResponse.json({ analytics, eventCount: events.length });
}
