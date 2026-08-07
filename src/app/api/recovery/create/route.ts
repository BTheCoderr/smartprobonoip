import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { createRecoveryLink, isRecoveryScope } from "@/lib/db/recovery";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import {
  assertTextWithinLimit,
  limitErrorResponse,
  MAX_TEXT,
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
    "recovery-create",
    RATE_LIMITS.recoveryCreate,
    pilotSession,
  );
  if (limited) return limited;

  try {
    const body = (await readJsonWithLimit(request)) as {
      projectId?: string;
      email?: string;
      scope?: unknown;
    };
    assertTextWithinLimit(body.email, MAX_TEXT.email);

    if (!body.projectId?.trim()) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }

    const result = await createRecoveryLink({
      projectId: body.projectId.trim(),
      pilotSessionId: pilotSession,
      email: body.email,
      scope: isRecoveryScope(body.scope) ? body.scope : "project",
    });

    await trackServerEvent("recovery_link_created", {
      projectId: body.projectId.trim(),
      pilotSessionId: pilotSession,
      anonymousId: request.headers.get("x-anonymous-id"),
      metadata: { recoveryCreated: true },
    });
    if (body.email?.trim()) {
      await trackServerEvent("recovery_email_requested", {
        projectId: body.projectId.trim(),
        pilotSessionId: pilotSession,
        anonymousId: request.headers.get("x-anonymous-id"),
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    const oversized = limitErrorResponse(err);
    if (oversized) return oversized;

    const message = err instanceof Error ? err.message : "";
    if (message.includes("not found") || message.includes("Packet not found")) {
      return NextResponse.json({ error: "Packet not found" }, { status: 404 });
    }
    if (message.includes("Demo packets")) {
      return NextResponse.json(
        { error: "Demo packets cannot create recovery links" },
        { status: 400 },
      );
    }
    logServerError("recovery.create", err, { route: "recovery/create" });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
