import assert from "node:assert/strict";
import { test } from "node:test";

/** Minimal browser globals so the client tracker can run under node:test. */
function installBrowser(): { calls: string[] } {
  const calls: string[] = [];
  const storage = () => {
    const map = new Map<string, string>();
    return {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    };
  };
  const g = globalThis as Record<string, unknown>;
  g.window = {
    localStorage: storage(),
    sessionStorage: storage(),
    location: { pathname: "/start", search: "" },
  };
  g.document = { referrer: "" };
  g.fetch = (url: string) => {
    calls.push(String(url));
    return Promise.resolve(new Response(null, { status: 204 }));
  };
  return { calls };
}

test("regression: browser does not post server-recorded milestones", async () => {
  const { calls } = installBrowser();
  const { trackEvent } = await import("./client");
  trackEvent("intake_completed", { projectId: "p1", metadata: { demo: false } });
  trackEvent("recovery_link_created", { projectId: "p1" });
  assert.deepEqual(calls, []);
});

test("browser still posts client-only events", async () => {
  const { calls } = installBrowser();
  const { trackEvent } = await import("./client");
  trackEvent("intake_started", { metadata: { demo: false } });
  assert.deepEqual(calls, ["/api/analytics/track"]);
});
