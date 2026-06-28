import "server-only";
import * as net from "node:net";
import * as tls from "node:tls";
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

export async function sendInterestNotification(input: InterestLeadInput): Promise<void> {
  const notifyTo = process.env.INTEREST_NOTIFY_EMAIL;
  if (!notifyTo) return;

  const subject = `SmartProBonoIP interest: ${sanitizeHeaderValue(input.interestType)}`;
  const text = buildInterestEmailText(input);

  if (isSmtpConfigured()) {
    await sendSmtpEmail({
      to: notifyTo,
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "",
      subject,
      text,
    });
    return;
  }

  // Backward-compatible optional fallback if Resend is still configured.
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RECOVERY_FROM_EMAIL;
  if (!apiKey || !from) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [notifyTo],
      subject,
      text,
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

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  );
}

function buildInterestEmailText(input: InterestLeadInput): string {
  const attr = input.attribution ?? {};

  return [
    "New SmartProBonoIP interest form submission",
    "",
    `Interest type: ${safeLine(input.interestType)}`,
    `Name: ${safeLine(input.name) || "(not provided)"}`,
    `Email: ${safeLine(input.email)}`,
    `Organization: ${safeLine(input.organization) || "(not provided)"}`,
    `Role: ${safeLine(input.role) || "(not provided)"}`,
    "",
    "Message:",
    safeLine(input.message) || "(no message)",
    "",
    "Attribution:",
    `Source: ${safeLine(attr.source) || "(not provided)"}`,
    `Medium: ${safeLine(attr.medium) || "(not provided)"}`,
    `Campaign: ${safeLine(attr.campaign) || "(not provided)"}`,
    `Referrer: ${safeLine(attr.referrer) || "(not provided)"}`,
    `Landing page: ${safeLine(attr.landingPage) || "(not provided)"}`,
    "",
    "Reminder: Do not treat this submission as legal advice intake. Users were warned not to submit highly confidential invention details through this form.",
  ].join("\n");
}

function safeLine(value: string | undefined): string {
  return sanitizeInterestText(value, 2000).replace(/[\r\n]+/g, " ").trim();
}

function sanitizeHeaderValue(value: string | undefined): string {
  return safeLine(value).replace(/[<>]/g, "").slice(0, 120);
}

type SmtpMessage = {
  to: string;
  from: string;
  subject: string;
  text: string;
};

async function sendSmtpEmail(message: SmtpMessage): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass || !message.from) {
    throw new Error("SMTP notification is missing required configuration");
  }

  const fromAddress = extractEmailAddress(message.from);
  const toAddress = extractEmailAddress(message.to);
  const clientName = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "smartprobono.org";

  let connection = await createSmtpConnection(host, port, secure);

  try {
    await expectSmtp(connection, 220);
    await sendSmtpCommand(connection, `EHLO ${clientName}`, 250);

    if (!secure) {
      await sendSmtpCommand(connection, "STARTTLS", 220);
      connection = tls.connect({ socket: connection, servername: host });
      await onceSecure(connection as tls.TLSSocket);
      await sendSmtpCommand(connection, `EHLO ${clientName}`, 250);
    }

    await authenticateAndSend(connection, user, pass, fromAddress, toAddress, message);
  } finally {
    connection.end();
  }
}

async function authenticateAndSend(
  connection: net.Socket | tls.TLSSocket,
  user: string,
  pass: string,
  fromAddress: string,
  toAddress: string,
  message: SmtpMessage,
): Promise<void> {
  await sendSmtpCommand(connection, "AUTH LOGIN", 334);
  await sendSmtpCommand(connection, Buffer.from(user).toString("base64"), 334);
  await sendSmtpCommand(connection, Buffer.from(pass).toString("base64"), 235);
  await sendSmtpCommand(connection, `MAIL FROM:<${fromAddress}>`, 250);
  await sendSmtpCommand(connection, `RCPT TO:<${toAddress}>`, 250);
  await sendSmtpCommand(connection, "DATA", 354);
  await sendSmtpCommand(connection, buildSmtpData(message), 250);
  await sendSmtpCommand(connection, "QUIT", 221);
}

function createSmtpConnection(host: string, port: number, secure: boolean): Promise<net.Socket | tls.TLSSocket> {
  return new Promise((resolve, reject) => {
    const socket = secure ? tls.connect({ host, port, servername: host }) : net.connect({ host, port });
    const readyEvent = secure ? "secureConnect" : "connect";
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("SMTP connection timed out"));
    }, 15_000);

    socket.once(readyEvent, () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("error", reject);
  });
}

function onceSecure(socket: tls.TLSSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.once("secureConnect", resolve);
    socket.once("error", reject);
  });
}

function sendSmtpCommand(
  connection: net.Socket | tls.TLSSocket,
  command: string,
  expectedCode: number,
): Promise<string> {
  connection.write(`${command}\r\n`);
  return expectSmtp(connection, expectedCode);
}

function expectSmtp(connection: net.Socket | tls.TLSSocket, expectedCode: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP response timed out"));
    }, 15_000);

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1];
      if (!lastLine || !/^\d{3} /.test(lastLine)) return;

      cleanup();
      const code = Number(lastLine.slice(0, 3));
      if (code !== expectedCode) {
        reject(new Error(`SMTP expected ${expectedCode} but received ${code}`));
        return;
      }
      resolve(buffer);
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      clearTimeout(timer);
      connection.off("data", onData);
      connection.off("error", onError);
    };

    connection.on("data", onData);
    connection.once("error", onError);
  });
}

function buildSmtpData(message: SmtpMessage): string {
  const from = sanitizeHeaderValue(message.from);
  const to = sanitizeHeaderValue(message.to);
  const subject = sanitizeHeaderValue(message.subject);
  const text = message.text.replace(/^\./gm, "..");

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    ".",
  ].join("\r\n");
}

function extractEmailAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim();
}
