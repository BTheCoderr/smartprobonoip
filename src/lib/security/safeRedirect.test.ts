import assert from "node:assert/strict";
import { test } from "node:test";
import { safeRelativeRedirect } from "./safeRedirect";

const FALLBACK = "/workspace";
const APP = "https://smartprobono.org/api/auth/callback";

function resolvedHost(next: string): string {
  return new URL(safeRelativeRedirect(next, FALLBACK), APP).host;
}

test("keeps ordinary same-origin paths, query and hash", () => {
  assert.equal(safeRelativeRedirect("/workspace", FALLBACK), "/workspace");
  assert.equal(safeRelativeRedirect("/dashboard", FALLBACK), "/dashboard");
  assert.equal(safeRelativeRedirect("/profile/abc?tab=ip#packet", FALLBACK), "/profile/abc?tab=ip#packet");
});

test("falls back for missing or non-path values", () => {
  for (const value of [null, undefined, "", "workspace", "javascript:alert(1)"]) {
    assert.equal(safeRelativeRedirect(value, FALLBACK), FALLBACK);
  }
});

test("regression: backslash form no longer resolves to another host", () => {
  assert.equal(new URL("/\\evil.example", APP).host, "evil.example");
  assert.equal(safeRelativeRedirect("/\\evil.example", FALLBACK), FALLBACK);
  assert.equal(safeRelativeRedirect("/\\/evil.example", FALLBACK), FALLBACK);
  assert.equal(resolvedHost("/\\evil.example"), "smartprobono.org");
});

test("rejects absolute and protocol-relative URLs", () => {
  for (const value of ["https://evil.example", "http://evil.example/workspace", "//evil.example", "///evil.example"]) {
    assert.equal(safeRelativeRedirect(value, FALLBACK), FALLBACK, value);
    assert.equal(resolvedHost(value), "smartprobono.org", value);
  }
});

test("rejects control characters that URL parsers strip", () => {
  for (const value of ["/\t/evil.example", "/\n/evil.example", "/\r\n/evil.example", "/\u0000x"]) {
    assert.equal(safeRelativeRedirect(value, FALLBACK), FALLBACK, JSON.stringify(value));
  }
});

test("percent-encoded backslash stays a literal same-origin path", () => {
  const out = safeRelativeRedirect("/%5Cevil.example", FALLBACK);
  assert.equal(resolvedHost(out), "smartprobono.org");
});

test("rejects overlong values", () => {
  assert.equal(safeRelativeRedirect(`/${"a".repeat(3000)}`, FALLBACK), FALLBACK);
});
