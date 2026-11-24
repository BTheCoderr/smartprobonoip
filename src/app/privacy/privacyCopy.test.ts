import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("live privacy page contains no internal drafting notes", () => {
  const page = readFileSync("src/app/privacy/page.tsx", "utf8");
  assert.doesNotMatch(page, /update before production/i);
});

test(".env.example documents every email setting the server reads", () => {
  const example = readFileSync(".env.example", "utf8");
  for (const key of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "RESEND_API_KEY", "RECOVERY_FROM_EMAIL", "INTEREST_NOTIFY_EMAIL"]) {
    assert.match(example, new RegExp(`\\b${key}=`), key);
  }
});
