import "server-only";
import type { InterestLeadInput } from "@/lib/interest";
import { sanitizeInterestText } from "@/lib/interest";
import { getSupabaseService } from "@/lib/supabaseServer";

export async function saveInterestLead(input: InterestLeadInput): Promise<void> {
  const sb = getSupabaseService();
  const attr = input.attribution ?? {};

  const { error } = await sb.from("smartprobonoip_interest_leads").insert({
    name: sanitizeInterestText(input.name, 120),
    email: input.email.trim().slice(0, 254),
    organization: sanitizeInterestText(input.organization, 200),
    role: sanitizeInterestText(input.role, 120),
    interest_type: input.interestType.trim().slice(0, 64),
    message: sanitizeInterestText(input.message, 2000),
    source: sanitizeInterestText(attr.source, 120),
    campaign: sanitizeInterestText(attr.campaign, 120),
    medium: sanitizeInterestText(attr.medium, 120),
    referrer: sanitizeInterestText(attr.referrer, 200),
    landing_page: sanitizeInterestText(attr.landingPage, 200),
  });

  if (error) throw new Error(error.message);
}

export async function sendInterestNotification(input: InterestLeadInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RECOVERY_FROM_EMAIL;
  const notifyTo = process.env.INTEREST_NOTIFY_EMAIL;
  if (!apiKey || !from || !notifyTo) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [notifyTo],
      subject: `SmartProBonoIP interest: ${input.interestType}`,
      text: [
        `Interest type: ${input.interestType}`,
        `Name: ${input.name ?? "(not provided)"}`,
        `Email: ${input.email}`,
        `Organization: ${input.organization ?? "(not provided)"}`,
        `Role: ${input.role ?? "(not provided)"}`,
        "",
        input.message ?? "(no message)",
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send interest notification");
  }
}
