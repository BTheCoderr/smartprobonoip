import "server-only";
import type { InterestLead, InterestLeadInput } from "@/lib/interest";
import { sanitizeInterestText } from "@/lib/interest";
import { getSupabaseService } from "@/lib/supabaseServer";

export type { InterestLead };

interface InterestLeadRow {
  id: string;
  name: string | null;
  email: string;
  organization: string | null;
  role: string | null;
  interest_type: string | null;
  message: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  referrer: string | null;
  landing_page: string | null;
  created_at: string;
}

function mapLead(row: InterestLeadRow): InterestLead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    organization: row.organization,
    role: row.role,
    interestType: row.interest_type,
    message: row.message,
    source: row.source,
    medium: row.medium,
    campaign: row.campaign,
    referrer: row.referrer,
    landingPage: row.landing_page,
    createdAt: row.created_at,
  };
}

const LEAD_SELECT =
  "id,name,email,organization,role,interest_type,message,source,medium,campaign,referrer,landing_page,created_at";

export async function saveInterestLead(input: InterestLeadInput): Promise<string> {
  const sb = getSupabaseService();
  const attr = input.attribution ?? {};

  const { data, error } = await sb
    .from("smartprobonoip_interest_leads")
    .insert({
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
    })
    .select("created_at")
    .single();

  if (error || !data?.created_at) {
    throw new Error(error?.message ?? "Failed to save interest lead");
  }

  return data.created_at as string;
}

export async function listInterestLeads(): Promise<InterestLead[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_interest_leads")
    .select(LEAD_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as InterestLeadRow[]).map(mapLead);
}

function displayValue(value: string | null | undefined, fallback = "(not provided)"): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export async function sendInterestNotification(
  input: InterestLeadInput,
  createdAt: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RECOVERY_FROM_EMAIL;
  const notifyTo = process.env.INTEREST_NOTIFY_EMAIL?.trim();
  if (!apiKey || !from || !notifyTo) return;

  const attr = input.attribution ?? {};

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [notifyTo],
      subject: "New SmartProBonoIP interest form submission",
      text: [
        "New SmartProBonoIP interest form submission",
        "",
        `Name: ${displayValue(input.name)}`,
        `Email: ${input.email.trim()}`,
        `Organization: ${displayValue(input.organization)}`,
        `Role: ${displayValue(input.role)}`,
        `Interest type: ${displayValue(input.interestType)}`,
        `Message: ${displayValue(input.message, "(no message)")}`,
        "",
        `Source: ${displayValue(attr.source)}`,
        `Medium: ${displayValue(attr.medium)}`,
        `Campaign: ${displayValue(attr.campaign)}`,
        `Referrer: ${displayValue(attr.referrer)}`,
        `Landing page: ${displayValue(attr.landingPage)}`,
        "",
        `Created at: ${createdAt}`,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send interest notification");
  }
}

export const INTEREST_LEAD_CSV_HEADERS = [
  "name",
  "email",
  "organization",
  "role",
  "interest_type",
  "message",
  "source",
  "medium",
  "campaign",
  "referrer",
  "landing_page",
  "created_at",
] as const;

export function interestLeadCsvRow(lead: InterestLead): (string | null)[] {
  return [
    lead.name,
    lead.email,
    lead.organization,
    lead.role,
    lead.interestType,
    lead.message,
    lead.source,
    lead.medium,
    lead.campaign,
    lead.referrer,
    lead.landingPage,
    lead.createdAt,
  ];
}
