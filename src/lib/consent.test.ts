import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  consentVersionFor,
  createIntakeConsent,
  INTAKE_CONSENT_VERSION,
  parseIntakeConsent,
} from "./consent";
import { CONSENT_CONFIDENTIAL, CONSENT_EDUCATIONAL, DISCLAIMER, PRIVACY_NOTICE } from "./disclaimer";

const NOW = new Date("2026-11-23T20:00:00.000Z");

test("a freshly created consent round-trips through validation", () => {
  const consent = createIntakeConsent(NOW);
  assert.deepEqual(parseIntakeConsent(JSON.parse(JSON.stringify(consent)), NOW), consent);
});

test("rejects missing, malformed, partial, or stale consent", () => {
  const good = createIntakeConsent(NOW);
  const cases: unknown[] = [
    null,
    undefined,
    "yes",
    {},
    { ...good, version: "ip-intake-v1:00000000" },
    { ...good, educational: false },
    { ...good, confidential: "true" },
    { ...good, consentedAt: "not a date" },
    { ...good, consentedAt: new Date(NOW.getTime() + 60 * 60_000).toISOString() },
    { ...good, consentedAt: new Date(NOW.getTime() - 400 * 24 * 60 * 60_000).toISOString() },
  ];
  for (const value of cases) {
    assert.equal(parseIntakeConsent(value, NOW), null, JSON.stringify(value));
  }
});

test("version is tied to the exact copy shown on /disclaimer", () => {
  const texts = [DISCLAIMER, PRIVACY_NOTICE, CONSENT_EDUCATIONAL, CONSENT_CONFIDENTIAL];
  assert.equal(consentVersionFor(texts), INTAKE_CONSENT_VERSION);
  assert.notEqual(consentVersionFor([...texts.slice(0, 3), `${CONSENT_CONFIDENTIAL} `]), INTAKE_CONSENT_VERSION);
});

test("regression: packet creation requires and persists consent server-side", () => {
  const route = readFileSync("src/app/api/records/route.ts", "utf8");
  assert.match(route, /const consent = parseIntakeConsent\(body\.consent\)/);
  assert.match(route, /if \(!isDemo && !consent\)/);
  assert.match(route, /code: "consent_required"/);
  assert.match(route, /metadata: consent \? \{ consent \} : undefined/);
  const form = readFileSync("src/components/intake/IntakeForm.tsx", "utf8");
  assert.match(form, /consent: getIntakeConsent\(\)/);
});
