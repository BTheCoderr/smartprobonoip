import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { safeRelativeRedirect } from "./safeRedirect";

const FILE = "src/app/api/organization/auth/callback/route.ts";
const APP = "https://smartprobono.org/api/organization/auth/callback";

test("regression: organization callback validates next before redirecting", () => {
  const source = readFileSync(FILE, "utf8");
  assert.match(source, /safeRelativeRedirect\(\s*requestUrl\.searchParams\.get\("next"\)/);
  assert.doesNotMatch(source, /searchParams\.get\("next"\)\s*\?\?/);
});

test("absolute next values no longer leave the app origin", () => {
  for (const value of ["https://evil.example/login", "//evil.example", "/\\evil.example"]) {
    const next = safeRelativeRedirect(value, "/organization");
    assert.equal(next, "/organization", value);
    assert.equal(new URL(next, APP).host, "smartprobono.org", value);
  }
});

test("organization portal paths still pass", () => {
  assert.equal(safeRelativeRedirect("/organization/referrals/abc", "/organization"), "/organization/referrals/abc");
});
