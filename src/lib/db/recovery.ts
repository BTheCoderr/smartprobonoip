import "server-only";
import { randomBytes } from "crypto";
import { appPath } from "@/lib/appUrl";
import { recordProjectEvent } from "@/lib/db/events";
import { getRecordById } from "@/lib/db/records";
import { ROUTES } from "@/lib/routes";
import {
  RECOVERY_CLAIM_ALREADY_USED_MESSAGE,
  RECOVERY_CLAIM_INVALID_MESSAGE,
  normalizeRecoveryTokenInput,
  recoveryClaimErrorMessage,
  type RecoveryClaimStatus,
} from "@/lib/security/recoveryClaim";
import { hashRecoveryToken } from "@/lib/security/recoveryHash";
import { getSupabaseService } from "@/lib/supabaseServer";
import type { ProjectRecord } from "@/lib/types";

export { hashRecoveryToken, normalizeRecoveryTokenInput };
export {
  RECOVERY_CLAIM_ALREADY_USED_MESSAGE,
  RECOVERY_CLAIM_INVALID_MESSAGE,
};

const TOKEN_BYTES = 32;
const DEFAULT_EXPIRY_DAYS = 90;

/**
 * 'project' restores one packet and is the default, matching every token issued
 * before portfolios existed. 'session' restores the whole portfolio.
 */
export type RecoveryScope = "project" | "session";

export function isRecoveryScope(value: unknown): value is RecoveryScope {
  return value === "project" || value === "session";
}

export function generateRecoveryToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function buildRecoveryUrl(token: string): string {
  return appPath(`${ROUTES.recover}?token=${encodeURIComponent(token)}`);
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RECOVERY_FROM_EMAIL);
}

async function sendRecoveryEmail(
  to: string,
  recoveryUrl: string,
  scope: RecoveryScope,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RECOVERY_FROM_EMAIL;
  if (!apiKey || !from) return;

  const isSession = scope === "session";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: isSession
        ? "Your SmartProBonoIP portfolio access link"
        : "Your SmartProBonoIP packet recovery link",
      text: [
        isSession
          ? "You requested a private link to return to your inventor workspace."
          : "You requested a private link to return to your IP Readiness Packet.",
        "",
        recoveryUrl,
        "",
        isSession
          ? "Keep this link private. Anyone with it can access every invention in your portfolio. The link works once."
          : "Keep this link private. Anyone with it can access your packet. The link works once.",
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
  scope?: RecoveryScope;
}): Promise<{ recoveryUrl: string; emailSent: boolean }> {
  const { projectId, pilotSessionId, email, scope = "project" } = input;
  const owned = await getRecordById(projectId, pilotSessionId);
  if (!owned) throw new Error("Packet not found");
  if (owned.isDemo) throw new Error("Demo packets cannot create recovery links");

  const sb = getSupabaseService();
  const token = generateRecoveryToken();
  const tokenHash = hashRecoveryToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DEFAULT_EXPIRY_DAYS);

  // Only supersede links of the same scope, so creating a portfolio link does
  // not silently break a single-packet link already shared with someone.
  await sb
    .from("smartprobonoip_recovery_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("project_id", projectId)
    .eq("scope", scope)
    .is("revoked_at", null)
    .is("consumed_at", null);

  const { error } = await sb.from("smartprobonoip_recovery_tokens").insert({
    project_id: projectId,
    token_hash: tokenHash,
    email: email?.trim() || null,
    expires_at: expiresAt.toISOString(),
    scope,
    // Newly issued tokens burn on first successful claim. Legacy rows stay
    // multi-use because the column defaults to false.
    single_use: true,
  });

  if (error) throw new Error(error.message);

  const recoveryUrl = buildRecoveryUrl(token);
  let emailSent = false;
  if (email?.trim() && isEmailConfigured()) {
    await sendRecoveryEmail(email.trim(), recoveryUrl, scope);
    emailSent = true;
  }

  return { recoveryUrl, emailSent };
}

export interface RecoveryClaimResult {
  record: ProjectRecord;
  scope: RecoveryScope;
  /** How many inventions were reattached to the claiming session. */
  restoredCount: number;
}

export class RecoveryClaimError extends Error {
  status: Exclude<RecoveryClaimStatus, "ok">;

  constructor(status: Exclude<RecoveryClaimStatus, "ok">) {
    super(recoveryClaimErrorMessage(status));
    this.name = "RecoveryClaimError";
    this.status = status;
  }
}

interface ClaimRpcResult {
  status?: string;
  project_id?: string;
  scope?: string;
  restored_ids?: string[];
  restored_count?: number;
}

/**
 * Atomically validates, rebinds, and (for single-use tokens) consumes a recovery
 * link via the Postgres claim function. Concurrent claims serialize on the
 * token row lock; only one can return status = ok.
 */
export async function claimRecoveryToken(input: {
  token: string;
  pilotSessionId: string;
}): Promise<RecoveryClaimResult> {
  const raw = normalizeRecoveryTokenInput(input.token);
  if (!raw) {
    throw new RecoveryClaimError("invalid");
  }

  const tokenHash = hashRecoveryToken(raw);
  const sb = getSupabaseService();

  const { data, error } = await sb.rpc("claim_smartprobonoip_recovery_token", {
    p_token_hash: tokenHash,
    p_new_pilot_session_id: input.pilotSessionId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = (data ?? {}) as ClaimRpcResult;
  const status = result.status;

  if (status === "already_used") {
    throw new RecoveryClaimError("already_used");
  }
  if (status !== "ok" || !result.project_id) {
    throw new RecoveryClaimError("invalid");
  }

  const scope: RecoveryScope = result.scope === "session" ? "session" : "project";
  const restoredIds = Array.isArray(result.restored_ids)
    ? result.restored_ids.filter((id): id is string => typeof id === "string")
    : [result.project_id];
  const restoredCount =
    typeof result.restored_count === "number"
      ? result.restored_count
      : restoredIds.length;

  const now = new Date().toISOString();
  await Promise.all(
    restoredIds.map((id) =>
      recordProjectEvent({
        projectId: id,
        pilotSessionId: input.pilotSessionId,
        type: "recovered",
        source: "user",
        occurredAt: now,
      }),
    ),
  );

  const record = await getRecordById(result.project_id, input.pilotSessionId);
  if (!record) {
    throw new RecoveryClaimError("invalid");
  }

  return { record, scope, restoredCount };
}
