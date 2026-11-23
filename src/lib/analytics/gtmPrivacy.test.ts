import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { shouldLoadGtm } from "./gtm";

const PRIVATE_PATHS = [
  "/recover",
  "/smartprobonoip/recover",
  "/profile/1d2c3b4a-0000-4000-8000-000000000000",
  "/profile/1d2c3b4a-0000-4000-8000-000000000000/research",
  "/profile/1d2c3b4a-0000-4000-8000-000000000000/handoff",
  "/workspace",
  "/dashboard",
  "/leads",
  "/organization",
  "/organization/referrals/abc",
  "/sign-in",
  "/pilot-tracker",
  "/legal/ask-ermi",
  "/legal/document",
];

const PUBLIC_PATHS = ["/", "/ip", "/legal", "/learn", "/sample", "/pilot", "/for-professionals", "/disclaimer", "/start", "/protect/patent", "/privacy"];

test("regression: GTM never loads on private routes", () => {
  for (const path of PRIVATE_PATHS) {
    assert.equal(shouldLoadGtm(path), false, path);
  }
  assert.equal(shouldLoadGtm(null), false);
});

test("GTM still loads on public landing and funnel pages", () => {
  for (const path of PUBLIC_PATHS) {
    assert.equal(shouldLoadGtm(path), true, path);
  }
});

test("GtmProvider gates the container script and the layout has no global noscript tag", () => {
  const provider = readFileSync("src/components/analytics/GtmProvider.tsx", "utf8");
  assert.match(provider, /const allowed = shouldLoadGtm\(pathname\)/);
  assert.match(provider, /\{allowed \? \(/);
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  assert.doesNotMatch(layout, /googletagmanager\.com\/ns\.html/);
});

test("recover page strips the token from the address bar", () => {
  const source = readFileSync("src/app/recover/page.tsx", "utf8");
  assert.match(source, /history\.replaceState\(/);
});
