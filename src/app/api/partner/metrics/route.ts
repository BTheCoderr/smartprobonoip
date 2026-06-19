import { NextResponse } from "next/server";
import { listLiveRecords, verifyPartnerSecret } from "@/lib/db/records";
import { computeMetrics } from "@/lib/metrics";
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

  const secret = readSecret(request);
  if (!verifyPartnerSecret(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await listLiveRecords();
  const metrics = computeMetrics(records);
  return NextResponse.json({ records, metrics });
}
