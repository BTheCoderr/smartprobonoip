import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedPlatformAdmin } from "./partnerAdminPolicy";
const owner = { id: "owner-id", email: "Owner@Example.com", emailConfirmed: true };
test("requires explicit allowlist", () => {
  assert.equal(isAllowedPlatformAdmin(owner, undefined), false);
  assert.equal(isAllowedPlatformAdmin(owner, ""), false);
  assert.equal(isAllowedPlatformAdmin(owner, "other@example.com"), false);
});
test("matches exact verified email, normalized for case and whitespace", () => {
  assert.equal(isAllowedPlatformAdmin(owner, " other@example.com, OWNER@example.com "), true);
  assert.equal(isAllowedPlatformAdmin(owner, "owner@example.com.evil"), false);
});
test("denies unconfirmed, missing and unsigned identities", () => {
  assert.equal(isAllowedPlatformAdmin({ ...owner, emailConfirmed: false }, owner.email), false);
  assert.equal(isAllowedPlatformAdmin({ ...owner, id: "" }, owner.email), false);
  assert.equal(isAllowedPlatformAdmin({ ...owner, email: null }, owner.email), false);
  assert.equal(isAllowedPlatformAdmin(null, owner.email), false);
});
