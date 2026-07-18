import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { claimRecoveryToken } from "@/lib/db/recovery";
import {
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import {
  limitErrorResponse,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  const limited = enforceRateLimit(
    request,
    "recovery-claim",
    RATE_LIMITS.recoveryClaim,
  );
  if (limited) return limited;

  try {
    const body = (await readJsonWithLimit(request)) as { token?: string };
    const token = body.token?.trim();
    if (!token) {
      return NextResponse.json({ error: "Missing recovery token" }, { status: 400 });
    }

    const record = await claimRecoveryToken({
      token,
      pilotSessionId: pilotSession,
    });

    await trackServerEvent("recovery_claim_succeeded", {
      projectId: record.id,
      pilotSessionId: pilotSession,
      anonymousId: request.headers.get("x-anonymous-id"),
      partnerSlug: record.partnerSlug,
      partnerName: record.partnerName,
      source: record.source,
      campaign: record.campaign,
    });

    return NextResponse.json({ record });
  } catch (err) {
    const oversized = limitErrorResponse(err);
    if (oversized) return oversized;

    logServerError("recovery.claim", err, { route: "recovery/claim" });
    await trackServerEvent("recovery_claim_failed", {
      pilotSessionId: pilotSession,
      anonymousId: request.headers.get("x-anonymous-id"),
      metadata: { errorCode: "claim_failed" },
    });
    return NextResponse.json(
      { error: "Invalid or expired recovery link" },
      { status: 400 },
    );
  }
}
