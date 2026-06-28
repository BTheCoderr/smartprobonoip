import "server-only";
import net from "node:net";
import tls from "node:tls";
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

  const connection = await createSmtpConnection(host, port, secure);

  try {
    await expectSmtp(connection, 220);
    await sendSmtpCommand(connection, `EHLO ${clientName}`, 250);

    if (!secure) {
      await sendSmtpCommand(connection, "STARTTLS", 220);
      const tlsConnection = tls.connect({ socket: connection, servername: host });
      await onceSecure(tlsConnection);
      await sendSmtpCommand(tlsConnection, `EHLO ${clientName}`, 250);
      await authenticateAndSend(tlsConnection, user, pass, fromAddress, toAddress, message);
      return;
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
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("SMTP connection timed out"));
    }, 15_000);

    socket.once("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("secureConnect", () => {
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
