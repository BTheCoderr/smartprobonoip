import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

function storage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

beforeEach(() => {
  (globalThis as Record<string, unknown>).window = {
    localStorage: storage(),
    sessionStorage: storage(),
  };
});

test("legacy boolean acknowledgement is not treated as recorded consent", async () => {
  const ack = await import("./ack");
  const win = (globalThis as unknown as { window: { localStorage: Storage } }).window;
  win.localStorage.setItem("smartprobonoip:disclaimer-ack", "true");
  assert.equal(ack.hasAcknowledgedDisclaimer(), false);
  assert.equal(ack.getIntakeConsent(), null);
});

test("accepting the disclaimer stores a versioned consent record in localStorage", async () => {
  const ack = await import("./ack");
  const { INTAKE_CONSENT_VERSION } = await import("./consent");
  ack.acknowledgeDisclaimer();
  assert.equal(ack.hasAcknowledgedDisclaimer(), true);
  const consent = ack.getIntakeConsent();
  assert.ok(consent);
  assert.equal(consent.version, INTAKE_CONSENT_VERSION);
  assert.equal(consent.educational, true);
  assert.equal(consent.confidential, true);
  ack.clearAcknowledgement();
  assert.equal(ack.getIntakeConsent(), null);
});
