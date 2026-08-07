import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ConcurrentRecoveryLedger,
  RECOVERY_CLAIM_ALREADY_USED_MESSAGE,
  RECOVERY_CLAIM_INVALID_MESSAGE,
  evaluateRecoveryClaim,
  normalizeRecoveryTokenInput,
  recoveryClaimErrorMessage,
} from "@/lib/security/recoveryClaim";
import { hashRecoveryToken } from "@/lib/security/recoveryHash";

const MIGRATION = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/021_single_use_recovery_tokens.sql",
  ),
  "utf8",
);

describe("recovery claim gate", () => {
  it("rejects missing, revoked, expired, and unclaimable projects as invalid", () => {
    assert.equal(
      evaluateRecoveryClaim({
        found: false,
        revoked: false,
        expired: false,
        singleUse: true,
        consumed: false,
        projectClaimable: true,
      }),
      "invalid",
    );
    assert.equal(
      evaluateRecoveryClaim({
        found: true,
        revoked: true,
        expired: false,
        singleUse: true,
        consumed: false,
        projectClaimable: true,
      }),
      "invalid",
    );
    assert.equal(
      evaluateRecoveryClaim({
        found: true,
        revoked: false,
        expired: true,
        singleUse: true,
        consumed: false,
        projectClaimable: true,
      }),
      "invalid",
    );
    assert.equal(
      evaluateRecoveryClaim({
        found: true,
        revoked: false,
        expired: false,
        singleUse: true,
        consumed: false,
        projectClaimable: false,
      }),
      "invalid",
    );
  });

  it("returns already_used only for consumed single-use tokens", () => {
    assert.equal(
      evaluateRecoveryClaim({
        found: true,
        revoked: false,
        expired: false,
        singleUse: true,
        consumed: true,
        projectClaimable: true,
      }),
      "already_used",
    );
    // Legacy multi-use tokens stay claimable even if consumed_at were set.
    assert.equal(
      evaluateRecoveryClaim({
        found: true,
        revoked: false,
        expired: false,
        singleUse: false,
        consumed: true,
        projectClaimable: true,
      }),
      "ok",
    );
  });

  it("allows a fresh single-use token", () => {
    assert.equal(
      evaluateRecoveryClaim({
        found: true,
        revoked: false,
        expired: false,
        singleUse: true,
        consumed: false,
        projectClaimable: true,
      }),
      "ok",
    );
  });

  it("uses a distinct message for already-used without changing the invalid message", () => {
    assert.equal(
      recoveryClaimErrorMessage("already_used"),
      RECOVERY_CLAIM_ALREADY_USED_MESSAGE,
    );
    assert.equal(
      recoveryClaimErrorMessage("invalid"),
      RECOVERY_CLAIM_INVALID_MESSAGE,
    );
    assert.match(RECOVERY_CLAIM_ALREADY_USED_MESSAGE, /already been used/i);
    assert.doesNotMatch(RECOVERY_CLAIM_INVALID_MESSAGE, /already been used/i);
    assert.doesNotMatch(RECOVERY_CLAIM_INVALID_MESSAGE, /not found/i);
    assert.doesNotMatch(RECOVERY_CLAIM_INVALID_MESSAGE, /revoked/i);
  });
});

describe("single-use claim concurrency", () => {
  it("allows only one of two simultaneous claims to succeed", async () => {
    const ledger = new ConcurrentRecoveryLedger();
    const hash = hashRecoveryToken("concurrent-single-use-token");
    ledger.seed(hash, { singleUse: true });

    const [first, second] = await Promise.all([
      ledger.claim(hash),
      ledger.claim(hash),
    ]);

    const outcomes = [first, second].sort();
    assert.deepEqual(outcomes, ["already_used", "ok"]);
  });

  it("fails a second sequential claim after a successful single-use claim", async () => {
    const ledger = new ConcurrentRecoveryLedger();
    const hash = hashRecoveryToken("sequential-single-use-token");
    ledger.seed(hash, { singleUse: true });

    assert.equal(await ledger.claim(hash), "ok");
    assert.equal(await ledger.claim(hash), "already_used");
    assert.equal(await ledger.claim(hash), "already_used");
  });

  it("allows legacy multi-use tokens to be claimed twice", async () => {
    const ledger = new ConcurrentRecoveryLedger();
    const hash = hashRecoveryToken("legacy-multi-use-token");
    ledger.seed(hash, { singleUse: false });

    const [first, second] = await Promise.all([
      ledger.claim(hash),
      ledger.claim(hash),
    ]);

    assert.deepEqual([first, second].sort(), ["ok", "ok"]);
  });

  it("does not let a second concurrent claim win under load", async () => {
    const ledger = new ConcurrentRecoveryLedger();
    const hash = hashRecoveryToken("burst-single-use-token");
    ledger.seed(hash, { singleUse: true });

    const results = await Promise.all(
      Array.from({ length: 20 }, () => ledger.claim(hash)),
    );

    assert.equal(results.filter((status) => status === "ok").length, 1);
    assert.equal(
      results.filter((status) => status === "already_used").length,
      19,
    );
  });
});

describe("recovery token hashing contract", () => {
  it("still stores only SHA-256 digests", () => {
    const token = "example-recovery-token-value-0123456789";
    const hash = hashRecoveryToken(token);
    assert.equal(hash, createHash("sha256").update(token.trim()).digest("hex"));
    assert.notEqual(hash, token);
  });

  it("extracts a token from a pasted recovery URL", () => {
    const token = "abc123_recovery_token_value";
    assert.equal(
      normalizeRecoveryTokenInput(
        `https://example.com/recover?token=${encodeURIComponent(token)}`,
      ),
      token,
    );
    assert.equal(normalizeRecoveryTokenInput(`  ${token}  `), token);
    assert.equal(normalizeRecoveryTokenInput(""), "");
  });
});

describe("single-use recovery migration contract", () => {
  it("adds consumed_at and single_use with legacy-safe defaults", () => {
    assert.match(MIGRATION, /add column if not exists consumed_at/);
    assert.match(
      MIGRATION,
      /add column if not exists single_use boolean not null default false/,
    );
  });

  it("claims under a row lock and consumes only single-use tokens", () => {
    assert.match(MIGRATION, /for update/i);
    assert.match(MIGRATION, /single_use and v_token\.consumed_at is not null/);
    assert.match(
      MIGRATION,
      /consumed_at = case\s+when v_token\.single_use then v_now/i,
    );
  });

  it("keeps project and session scopes distinct in the claim function", () => {
    assert.match(MIGRATION, /v_scope = 'session'/);
    assert.match(MIGRATION, /array\[v_project_id\]/);
  });

  it("revokes EXECUTE from PUBLIC and client roles, grants service_role only", () => {
    assert.match(
      MIGRATION,
      /revoke all on function public\.claim_smartprobonoip_recovery_token\(text, text\) from public/i,
    );
    assert.match(
      MIGRATION,
      /revoke all on function public\.claim_smartprobonoip_recovery_token\(text, text\) from anon, authenticated/i,
    );
    assert.match(
      MIGRATION,
      /grant execute on function public\.claim_smartprobonoip_recovery_token\(text, text\) to service_role/i,
    );
  });
});
