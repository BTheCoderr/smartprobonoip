import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import robots, { PRIVATE_CRAWL_PREFIXES } from "./robots";

function fakeRequest(path: string, cookie?: string) {
  const url = new URL(path, "https://smartprobono.org");
  return {
    url: url.href,
    nextUrl: url,
    headers: new Headers(),
    cookies: {
      get: (name: string) => (cookie && name === "spb_has_portfolio" ? { name, value: cookie } : undefined),
      getAll: () => [],
      set: () => {},
    },
  };
}

test("regression: /ip page no longer reads cookies, so it can be statically rendered", () => {
  const page = readFileSync("src/app/ip/page.tsx", "utf8");
  assert.doesNotMatch(page, /from "next\/headers"/);
  assert.doesNotMatch(page, /cookies\(/);
});

test("middleware sends returning inventors from /ip to their workspace", async () => {
  const { middleware } = await import("../middleware");
  const res = await middleware(fakeRequest("/ip", "1") as never);
  assert.equal(res.status, 307);
  assert.equal(res.headers.get("location"), "https://smartprobono.org/workspace");
  assert.ok(res.headers.get("x-frame-options"), "security headers still applied");
});

test("middleware leaves first-time visitors on /ip", async () => {
  const { middleware } = await import("../middleware");
  const res = await middleware(fakeRequest("/ip") as never);
  assert.equal(res.headers.get("location"), null);
});

test("robots.txt exists, allows public pages and disallows private routes", () => {
  const out = robots();
  const rule = Array.isArray(out.rules) ? out.rules[0] : out.rules;
  assert.equal(rule.allow, "/");
  for (const p of ["/profile/", "/recover", "/workspace", "/api/", "/organization"]) {
    assert.ok(PRIVATE_CRAWL_PREFIXES.includes(p), p);
  }
  assert.ok(!PRIVATE_CRAWL_PREFIXES.some((p) => ["/", "/ip", "/learn", "/sample"].includes(p)));
});
