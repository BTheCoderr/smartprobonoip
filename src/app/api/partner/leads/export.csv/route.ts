import { NextResponse } from "next/server";
import {
  INTEREST_LEAD_CSV_HEADERS,
  interestLeadCsvRow,
  listInterestLeads,
} from "@/lib/db/interest";
import { verifyPartnerSecret } from "@/lib/db/records";
import { escapeCsvField } from "@/lib/security/csv";
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
    "partner-leads-export-csv",
    RATE_LIMITS.partner,
  );
  if (limited) return limited;

  if (!verifyPartnerSecret(readPartnerSecretHeader(request))) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 401 });
  }

  const leads = await listInterestLeads();
  const rows = leads.map((lead) =>
    interestLeadCsvRow(lead).map(escapeCsvField).join(","),
  );
  const csv = [INTEREST_LEAD_CSV_HEADERS.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="smartprobonoip-interest-leads.csv"',
    },
  });
}
