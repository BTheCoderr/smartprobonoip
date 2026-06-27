import type { InterestLeadInput } from "@/lib/interest";

export const NETLIFY_INTEREST_FORM_NAME = "smartprobonoip-interest";

/** Best-effort Netlify Forms mirror — Supabase API remains source of truth. */
export async function submitInterestToNetlify(
  input: InterestLeadInput,
  botField = "",
): Promise<void> {
  if (typeof window === "undefined" || botField.trim()) return;

  const params = new URLSearchParams();
  params.set("form-name", NETLIFY_INTEREST_FORM_NAME);
  params.set("bot-field", "");
  if (input.name?.trim()) params.set("name", input.name.trim().slice(0, 200));
  params.set("email", input.email.trim().slice(0, 254));
  if (input.organization?.trim()) {
    params.set("organization", input.organization.trim().slice(0, 200));
  }
  if (input.role?.trim()) params.set("role", input.role.trim().slice(0, 200));
  params.set("interest_type", String(input.interestType).slice(0, 80));
  if (input.message?.trim()) {
    params.set("message", input.message.trim().slice(0, 500));
  }
  if (input.attribution?.source) params.set("source", input.attribution.source.slice(0, 120));
  if (input.attribution?.medium) params.set("medium", input.attribution.medium.slice(0, 120));
  if (input.attribution?.campaign) {
    params.set("campaign", input.attribution.campaign.slice(0, 120));
  }
  if (input.attribution?.landingPage) {
    params.set("landing_page", input.attribution.landingPage.slice(0, 200));
  }

  try {
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
  } catch {
    // Non-blocking — Supabase submission is authoritative.
  }
}
