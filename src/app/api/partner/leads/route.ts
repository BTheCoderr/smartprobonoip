import { NextResponse } from "next/server";
import { listInterestLeads } from "@/lib/db/interest";
import { GENERIC_UNAUTHORIZED } from "@/lib/security/api";
import { authorizePartnerAdminRequest } from "@/lib/security/partnerAdminAuth";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const limited = enforceRateLimit(request, "partner-leads", RATE_LIMITS.partner);
  if (limited) return limited;

  if (!(await authorizePartnerAdminRequest(request))) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 401 });
  }

  const leads = await listInterestLeads();
  return NextResponse.json({ total: leads.length, leads });
}
