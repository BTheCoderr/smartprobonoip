import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { saveInterestLead, sendInterestNotification } from "@/lib/db/interest";
import { validateInterestInput, isInterestHoneypotTriggered, type InterestLeadInput } from "@/lib/interest";
import { GENERIC_SERVER_ERROR } from "@/lib/security/api";
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

  const limited = enforceRateLimit(request, "interest", RATE_LIMITS.interest);
  if (limited) return limited;

  let body: InterestLeadInput;
  try {
    body = (await readJsonWithLimit(request)) as InterestLeadInput;
    assertTextWithinLimit(body.email, MAX_TEXT.email);
    assertTextWithinLimit(body.name, MAX_TEXT.interestName);
    assertTextWithinLimit(body.message, MAX_TEXT.interestMessage);
  } catch (err) {
    return (
      limitErrorResponse(err) ??
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    );
  }

  const validationError = validateInterestInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }

  if (isInterestHoneypotTriggered(body)) {
    return NextResponse.json({
      ok: true,
      message: "Thanks — we received your interest. We'll follow up soon.",
    });
  }

  try {
    await saveInterestLead(body);
    try {
      await sendInterestNotification(body);
      console.info("Interest notification sent");
    } catch (error) {
      // Notification is optional. Do not fail the lead capture if SMTP/email is down.
      logServerError("interest.notification", error, { route: "interest" });
    }

    await trackServerEvent("interest_submitted", {
      metadata: { interestType: body.interestType },
    });

    return NextResponse.json({
      ok: true,
      message: "Thanks — we received your interest. We'll follow up soon.",
    });
  } catch (err) {
    logServerError("interest", err, { route: "interest" });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
