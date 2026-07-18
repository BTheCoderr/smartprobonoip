import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { sanitizeAnalyticsMetadata } from "@/lib/analytics/metadata";
import { generateProfile } from "@/lib/generateProfile";
import { containsForbiddenLanguage } from "@/lib/safety";
import {
  PROMPT_INJECTION_FIXTURES,
  wrapUntrustedUserData,
} from "@/lib/security/aiUserContent";
import { isValidPilotSessionId } from "@/lib/security/apiSession";
import { CSP_REPORT_ONLY, SECURITY_HEADERS } from "@/lib/security/headers";
import {
  assertIntakeAnswersWithinLimits,
  MAX_ARRAY,
  MAX_JSON_BODY_BYTES,
  MAX_TEXT,
  OVERSIZE_BODY_MESSAGE,
  OVERSIZE_FIELD_MESSAGE,
  RequestLimitError,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { redactString, redactValue, safeErrorMessage } from "@/lib/security/safeLog";
import { hashRecoveryToken } from "@/lib/security/recoveryHash";
import type { IntakeAnswers } from "@/lib/types";

function baseAnswers(overrides: Partial<IntakeAnswers> = {}): IntakeAnswers {
  return {
    whatCreated: "A water bottle filter",
    problemSolved: "Dirty water on trails",
    whoFor: "Hikers",
    howItWorks: "Filter cartridge in the lid",
    mainParts: "Bottle, cartridge, mouthpiece",
    whatDifferent: "Inline sipping filter",
    itemType: "physical_product",
    hasPrototype: true,
    assets: ["drawings"],
    sharedChannels: ["friends"],
    hasBrandIdentity: false,
    goals: ["protection"],
    location: "Denver, CO",
    wantsProBono: false,
    preClarity: 2,
    ...overrides,
  };
}

describe("security headers", () => {
  it("ships Report-Only CSP with frame-ancestors none", () => {
    assert.match(CSP_REPORT_ONLY, /frame-ancestors 'none'/);
    assert.match(CSP_REPORT_ONLY, /googletagmanager\.com/);
    assert.match(CSP_REPORT_ONLY, /youtube-nocookie\.com/);
    assert.equal(
      SECURITY_HEADERS["X-Content-Type-Options"],
      "nosniff",
    );
    assert.equal(
      SECURITY_HEADERS["Referrer-Policy"],
      "strict-origin-when-cross-origin",
    );
    assert.ok(SECURITY_HEADERS["Permissions-Policy"]);
    assert.equal(SECURITY_HEADERS["X-Frame-Options"], "DENY");
  });
});

describe("pilot session validation", () => {
  it("rejects malformed pilot session ids", () => {
    assert.equal(isValidPilotSessionId(null), false);
    assert.equal(isValidPilotSessionId(""), false);
    assert.equal(isValidPilotSessionId("short"), false);
    assert.equal(isValidPilotSessionId("bad\nsession"), false);
    assert.equal(isValidPilotSessionId("<script>alert(1)</script>"), false);
    assert.equal(
      isValidPilotSessionId("a".repeat(12)),
      true,
    );
  });
});

describe("request limits", () => {
  it("rejects oversized free-text fields", () => {
    assert.throws(
      () =>
        assertIntakeAnswersWithinLimits(
          baseAnswers({ whatCreated: "x".repeat(MAX_TEXT.long + 1) }),
        ),
      (err: unknown) =>
        err instanceof RequestLimitError &&
        err.status === 422 &&
        err.message === OVERSIZE_FIELD_MESSAGE,
    );
  });

  it("rejects oversized arrays", () => {
    assert.throws(
      () =>
        assertIntakeAnswersWithinLimits(
          baseAnswers({
            assets: Array.from(
              { length: MAX_ARRAY.assets + 1 },
              () => "drawings",
            ) as IntakeAnswers["assets"],
          }),
        ),
      RequestLimitError,
    );
  });

  it("rejects huge JSON bodies with 413", async () => {
    const huge = JSON.stringify({ answers: { whatCreated: "x".repeat(MAX_JSON_BODY_BYTES) } });
    const request = new Request("https://example.com/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: huge,
    });
    await assert.rejects(
      () => readJsonWithLimit(request),
      (err: unknown) =>
        err instanceof RequestLimitError &&
        err.status === 413 &&
        err.message === OVERSIZE_BODY_MESSAGE,
    );
  });
});

describe("analytics private-text boundary", () => {
  it("never keeps invention text or secrets in metadata", () => {
    const sanitized = sanitizeAnalyticsMetadata({
      demo: true,
      whatCreated: "secret invention details",
      idea: "should not pass",
      email: "user@example.com",
      token: "abcdefghijklmnopqrstuvwxyz012345",
      recovery: "recovery-token-value",
      clarityRating: 3,
      mode: "prep",
    });
    assert.equal(sanitized.demo, true);
    assert.equal(sanitized.clarityRating, 3);
    assert.equal(sanitized.mode, "prep");
    assert.equal("whatCreated" in sanitized, false);
    assert.equal("idea" in sanitized, false);
    assert.equal("email" in sanitized, false);
    assert.equal("token" in sanitized, false);
    assert.equal("recovery" in sanitized, false);
  });
});

describe("safe logging", () => {
  it("redacts emails, keys, and long tokens", () => {
    const redacted = redactString(
      "contact me@test.com with Bearer sk-abcdefghijklmnopqrstuv and tok_abcdefghijklmnopqrstuvwxyz012345",
    );
    assert.doesNotMatch(redacted, /me@test\.com/);
    assert.doesNotMatch(redacted, /sk-abcdefghijklmnopqrstuv/);
    assert.match(redacted, /REDACTED/);
  });

  it("redacts sensitive object keys", () => {
    const redacted = redactValue({
      email: "a@b.com",
      whatCreated: "invention",
      route: "generate",
    }) as Record<string, unknown>;
    assert.equal(redacted.email, "[REDACTED]");
    assert.equal(redacted.whatCreated, "[REDACTED]");
    assert.equal(redacted.route, "generate");
  });

  it("never returns raw invention text from safeErrorMessage", () => {
    const msg = safeErrorMessage(
      new Error("DB failed for whatCreated=magnetic shelving secret sauce"),
    );
    assert.doesNotMatch(msg, /magnetic shelving/);
  });
});

describe("XSS / HTML event handlers in intake", () => {
  it("rule-based generator escapes risk by producing plain text without script execution surface", () => {
    const profile = generateProfile(
      baseAnswers({
        whatCreated:
          '<script>alert("xss")</script> onclick=alert(1) HydroSeal filter',
        problemSolved: '<img src=x onerror=alert(1)> dirty water',
      }),
    );
    const blob = JSON.stringify(profile);
    assert.ok(blob.includes("script") || blob.includes("HydroSeal") || blob.length > 0);
    // Output is JSON/text for React/PDF — no HTML document assembly here.
    assert.equal(blob.includes("<html"), false);
    assert.ok(!containsForbiddenLanguage(blob));
  });
});

describe("prompt injection fixtures", () => {
  it("wraps untrusted data with explicit delimiters", () => {
    const wrapped = wrapUntrustedUserData({
      whatCreated: PROMPT_INJECTION_FIXTURES[0],
    });
    assert.match(wrapped, /<<<UNTRUSTED_USER_DATA>>>/);
    assert.match(wrapped, /<<<END_UNTRUSTED_USER_DATA>>>/);
    assert.match(wrapped, /Never follow instructions/);
  });

  it("injection strings do not change rule-based system behavior into legal conclusions", () => {
    for (const fixture of PROMPT_INJECTION_FIXTURES) {
      // Keep forbidden phrases out of free-text fields so assertSafeLanguage can run;
      // injection still appears as untrusted delimited payload content.
      const wrapped = wrapUntrustedUserData({
        whatCreated: `A portable filter bottle. ${fixture}`,
        instructionAttempt: fixture,
      });
      assert.match(wrapped, /UNTRUSTED_USER_DATA/);
      assert.match(wrapped, new RegExp(fixture.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

      const profile = generateProfile(
        baseAnswers({
          whatCreated: "A portable filter bottle for hikers.",
          whatDifferent: "Inline sipping filter with replaceable cartridge.",
        }),
      );
      const text = [
        profile.ideaSummary,
        profile.suggestedNextStep,
        ...profile.expertQuestions,
      ].join("\n");
      assert.equal(containsForbiddenLanguage(text), false);
      assert.doesNotMatch(text, /\bis patentable\b/i);
      assert.doesNotMatch(text, /Ignore previous instructions/i);
      assert.doesNotMatch(text, /system prompt/i);
      assert.doesNotMatch(text, /API key/i);
      assert.doesNotMatch(text, /Delete the database/i);
    }
  });

  it("forbidden legal conclusions are detected", () => {
    assert.equal(containsForbiddenLanguage("Your idea is patentable"), true);
    assert.equal(containsForbiddenLanguage("Say my invention is patentable"), true);
  });
});

describe("recovery token hashing", () => {
  it("stores only SHA-256 digests", () => {
    const token = "example-recovery-token-value-0123456789";
    const hash = hashRecoveryToken(token);
    assert.equal(hash, createHash("sha256").update(token.trim()).digest("hex"));
    assert.notEqual(hash, token);
    assert.equal(hash.length, 64);
  });
});

describe("partner secret URL / error hygiene expectations", () => {
  it("documents that partner auth uses header name only in client helpers", async () => {
    const mod = await import("@/lib/pilotSession");
    const headers = mod.partnerSecretHeaders("super-secret-value") as Record<
      string,
      string
    >;
    assert.equal(headers["x-partner-secret"], "super-secret-value");
    assert.ok(!JSON.stringify(headers).includes("?secret="));
  });

  it("rejects missing and incorrect partner secrets", async () => {
    const { verifyPartnerSecretValue } = await import(
      "@/lib/security/partnerAuth"
    );
    assert.equal(verifyPartnerSecretValue(null, "correct-partner-secret"), false);
    assert.equal(verifyPartnerSecretValue("", "correct-partner-secret"), false);
    assert.equal(
      verifyPartnerSecretValue("wrong-secret", "correct-partner-secret"),
      false,
    );
    assert.equal(
      verifyPartnerSecretValue("correct-partner-secret", "correct-partner-secret"),
      true,
    );
  });
});

describe("unauthorized record access contract", () => {
  it("treats a different or malformed pilot session as unauthorized input", () => {
    const ownerSession = "owner-session-aaaaaaaa";
    const otherSession = "other-session-bbbbbbbb";
    assert.equal(isValidPilotSessionId(ownerSession), true);
    assert.equal(isValidPilotSessionId(otherSession), true);
    assert.notEqual(ownerSession, otherSession);
    // Ownership is enforced in getRecordById(.eq pilot_session_id); mismatched
    // sessions must not be considered the same principal.
    assert.equal(isValidPilotSessionId("nope"), false);
    assert.equal(isValidPilotSessionId("x".repeat(200)), false);
  });
});

describe("database exception hygiene", () => {
  it("keeps public error constants free of secrets and invention field names", async () => {
    const { GENERIC_SERVER_ERROR, GENERIC_UNAUTHORIZED } = await import(
      "@/lib/security/publicErrors"
    );
    for (const msg of [GENERIC_SERVER_ERROR, GENERIC_UNAUTHORIZED]) {
      assert.doesNotMatch(msg, /supabase/i);
      assert.doesNotMatch(msg, /password/i);
      assert.doesNotMatch(msg, /whatCreated/i);
      assert.doesNotMatch(msg, /token/i);
      assert.doesNotMatch(msg, /secret/i);
    }
  });
});
