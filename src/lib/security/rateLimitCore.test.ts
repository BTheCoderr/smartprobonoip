import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { checkRequestRateLimit, resetRateLimitsForTests } from "./rateLimitCore";

const CONFIG = { limit: 2, windowMs: 60_000 };

function req(ip: string): Request {
  return new Request("https://smartprobono.org/api/generate", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
  });
}

beforeEach(() => resetRateLimitsForTests());

test("per-session limit still applies", () => {
  const r = req("203.0.113.1");
  assert.equal(checkRequestRateLimit(r, "generate", CONFIG, "session-aaaaaaaaaaaa").allowed, true);
  assert.equal(checkRequestRateLimit(r, "generate", CONFIG, "session-aaaaaaaaaaaa").allowed, true);
  assert.equal(checkRequestRateLimit(r, "generate", CONFIG, "session-aaaaaaaaaaaa").allowed, false);
});

test("regression: rotating the session header no longer bypasses the limit", () => {
  const r = req("203.0.113.2");
  let allowed = 0;
  for (let i = 0; i < 20; i += 1) {
    if (checkRequestRateLimit(r, "generate", CONFIG, `session-rotated-${i}-0000`).allowed) allowed += 1;
  }
  assert.equal(allowed, CONFIG.limit * 3);
});

test("different IPs and routes have independent buckets", () => {
  for (let i = 0; i < 6; i += 1) checkRequestRateLimit(req("203.0.113.3"), "generate", CONFIG, `s-${i}-000000000`);
  assert.equal(checkRequestRateLimit(req("203.0.113.4"), "generate", CONFIG, "s-x-000000000").allowed, true);
  assert.equal(checkRequestRateLimit(req("203.0.113.3"), "coach", CONFIG, "s-y-000000000").allowed, true);
});

test("IP-only routes behave as before", () => {
  const r = req("203.0.113.5");
  assert.equal(checkRequestRateLimit(r, "legal-chat", CONFIG).allowed, true);
  assert.equal(checkRequestRateLimit(r, "legal-chat", CONFIG).allowed, true);
  assert.equal(checkRequestRateLimit(r, "legal-chat", CONFIG).allowed, false);
});
