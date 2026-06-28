import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { saveInterestLead, sendInterestNotification } from "@/lib/db/interest";
import { validateInterestInput, isInterestHoneypotTriggered, type InterestLeadInput } from "@/lib/interest";
import { GENERIC_SERVER_ERROR } from "@/lib/security/api";
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
    body = (await request.json()) as InterestLeadInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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
      console.warn(
        "Interest notification failed",
        error instanceof Error ? error.message : "Unknown email notification error",
      );
    }

    await trackServerEvent("interest_submitted", {
      metadata: { interestType: body.interestType },
    });

    return NextResponse.json({
      ok: true,
      message: "Thanks — we received your interest. We'll follow up soon.",
    });
  } catch {
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
