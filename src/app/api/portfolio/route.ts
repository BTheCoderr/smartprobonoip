import { NextResponse } from "next/server";
import { getPlatformAuth } from "@/lib/account/auth";
import { getPortfolioSnapshot } from "@/lib/db/portfolio";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const pilotSession = readPilotSession(request);
  const auth = await getPlatformAuth().catch(() => null);
  const validPilotSession = isValidPilotSessionId(pilotSession)
    ? pilotSession
    : null;

  if (!validPilotSession && !auth) {
    return NextResponse.json({ error: "Missing workspace identity" }, { status: 401 });
  }

  try {
    const snapshot = await getPortfolioSnapshot(validPilotSession, auth?.userId ?? null);
    return NextResponse.json({ snapshot });
  } catch (err) {
    logServerError("portfolio.get", err, { route: "portfolio" });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
