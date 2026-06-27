import "server-only";
import { createHash, randomBytes } from "crypto";
import { getRecordById } from "@/lib/db/records";
import { getSupabaseService } from "@/lib/supabaseServer";
import type { ProjectRecord } from "@/lib/types";

const TOKEN_BYTES = 32;
const DEFAULT_EXPIRY_DAYS = 365;

export function generateRecoveryToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashRecoveryToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function buildRecoveryUrl(token: string): string {
  return `${appBaseUrl()}/smartprobonoip/recover?token=${encodeURIComponent(token)}`;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RECOVERY_FROM_EMAIL);
}

async function sendRecoveryEmail(to: string, recoveryUrl: string): Promise<void> {
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
      to: [to],
      subject: "Your SmartProBonoIP packet recovery link",
      text: [
        "You requested a private link to return to your IP Readiness Packet.",
        "",
        recoveryUrl,
        "",
        "Keep this link private. Anyone with it can access your packet.",
        "",
        "This is preparation help only — not legal advice.",
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send recovery email");
  }
}

export async function createRecoveryLink(input: {
  projectId: string;
  pilotSessionId: string;
  email?: string;
}): Promise<{ recoveryUrl: string; emailSent: boolean }> {
  const { projectId, pilotSessionId, email } = input;
  const owned = await getRecordById(projectId, pilotSessionId);
  if (!owned) throw new Error("Packet not found");
  if (owned.isDemo) throw new Error("Demo packets cannot create recovery links");

  const sb = getSupabaseService();
  const token = generateRecoveryToken();
  const tokenHash = hashRecoveryToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DEFAULT_EXPIRY_DAYS);

  await sb
    .from("smartprobonoip_recovery_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("project_id", projectId)
    .is("revoked_at", null);

  const { error } = await sb.from("smartprobonoip_recovery_tokens").insert({
    project_id: projectId,
    token_hash: tokenHash,
    email: email?.trim() || null,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw new Error(error.message);

  const recoveryUrl = buildRecoveryUrl(token);
  let emailSent = false;
  if (email?.trim() && isEmailConfigured()) {
    await sendRecoveryEmail(email.trim(), recoveryUrl);
    emailSent = true;
  }

  return { recoveryUrl, emailSent };
}

export async function claimRecoveryToken(input: {
  token: string;
  pilotSessionId: string;
}): Promise<ProjectRecord> {
  const tokenHash = hashRecoveryToken(input.token);
  const sb = getSupabaseService();

  const { data: row, error } = await sb
    .from("smartprobonoip_recovery_tokens")
    .select("id, project_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (error || !row) {
    throw new Error("Invalid or expired recovery link");
  }

  if (row.expires_at && new Date(row.expires_at as string) < new Date()) {
    throw new Error("Invalid or expired recovery link");
  }

  const projectId = row.project_id as string;
  const projectRes = await sb
    .from("smartprobonoip_projects")
    .select("id, is_demo")
    .eq("id", projectId)
    .maybeSingle();

  if (projectRes.error || !projectRes.data) {
    throw new Error("Invalid or expired recovery link");
  }
  if (projectRes.data.is_demo) {
    throw new Error("Invalid or expired recovery link");
  }

  const { error: attachError } = await sb
    .from("smartprobonoip_projects")
    .update({
      pilot_session_id: input.pilotSessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (attachError) throw new Error(attachError.message);

  await sb
    .from("smartprobonoip_recovery_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id as string);

  const record = await getRecordById(projectId, input.pilotSessionId);
  if (!record) throw new Error("Recovery failed");
  return record;
}
