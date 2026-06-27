import { NextResponse } from "next/server";
import { computeAnalyticsDashboard } from "@/lib/analyticsMetrics";
import { listAnalyticsEvents } from "@/lib/db/analytics";
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
