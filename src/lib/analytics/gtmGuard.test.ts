import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { buildGtmBootstrapScript } from "./gtmGuard";
import { publicGtmPaths } from "./gtm";

const ORIGIN = "https://smartprobono.org";

function runBootstrap(startHref: string) {
  const assigned: string[] = [];
  let reloaded = 0;
  let current = new URL(startHref);
  const inserted: string[] = [];
  const pushed: string[] = [];
  const popListeners: Array<() => void> = [];
  const location = {
    get href() { return current.href; },
    get origin() { return current.origin; },
    assign(url: string) { assigned.push(url); },
    reload() { reloaded += 1; },
  };
  const history = {
    pushState(_s: unknown, _t: string, url?: string | null) {
      if (url != null) { current = new URL(url, current.href); pushed.push(current.href); }
    },
    replaceState(_s: unknown, _t: string, url?: string | null) {
      if (url != null) { current = new URL(url, current.href); pushed.push(current.href); }
    },
  };
  const window: Record<string, unknown> = {
    location,
    history,
    addEventListener: (name: string, fn: () => void) => { if (name === "popstate") popListeners.push(fn); },
  };
  const document = {
    getElementsByTagName: () => [{ parentNode: { insertBefore: (el: { src: string }) => inserted.push(el.src) } }],
    createElement: () => ({ async: false, src: "" }),
  };
  const script = buildGtmBootstrapScript({
    containerId: "GTM-N9W7LTKD",
    publicPaths: publicGtmPaths(),
    ga4MeasurementId: "G-Q2MD6ESG15",
  });
  vm.runInNewContext(script, { window, document, URL });
  return {
    window,
    assigned,
    inserted,
    pushed,
    get reloaded() { return reloaded; },
    navigateBack(to: string) { current = new URL(to, ORIGIN); popListeners.forEach((fn) => fn()); },
  };
}

test("GTM loads on public landing pages", () => {
  for (const href of [`${ORIGIN}/`, `${ORIGIN}/ip`, `${ORIGIN}/learn?utm_source=li`, `${ORIGIN}/disclaimer?demo=1`]) {
    assert.equal(runBootstrap(href).inserted.length, 1, href);
  }
});

test("GTM is never requested on private URLs, including private query keys", () => {
  for (const href of [
    `${ORIGIN}/recover?token=abc`,
    `${ORIGIN}/profile/1d2c3b4a-0000-4000-8000-000000000000`,
    `${ORIGIN}/workspace`,
    `${ORIGIN}/start?record=1d2c3b4a-0000-4000-8000-000000000000`,
    `${ORIGIN}/sign-in`,
  ]) {
    const run = runBootstrap(href);
    assert.equal(run.inserted.length, 0, href);
    assert.equal(run.window["ga-disable-G-Q2MD6ESG15"], true, href);
  }
});

test("regression: client-side navigation from public to private becomes a full page load", () => {
  const run = runBootstrap(`${ORIGIN}/start`);
  const history = run.window.history as { pushState: (s: unknown, t: string, u?: string) => void };
  history.pushState({}, "", "/profile/1d2c3b4a-0000-4000-8000-000000000000#readiness-dashboard");
  assert.deepEqual(run.pushed, [], "private URL must never reach the address bar while GTM is loaded");
  assert.deepEqual(run.assigned, [`${ORIGIN}/profile/1d2c3b4a-0000-4000-8000-000000000000#readiness-dashboard`]);
  assert.equal(run.window["ga-disable-G-Q2MD6ESG15"], true);
});

test("public to public client navigation is unchanged", () => {
  const run = runBootstrap(`${ORIGIN}/ip`);
  const history = run.window.history as { pushState: (s: unknown, t: string, u?: string) => void };
  history.pushState({}, "", "/learn");
  assert.deepEqual(run.pushed, [`${ORIGIN}/learn`]);
  assert.deepEqual(run.assigned, []);
});

test("back/forward onto a private URL disables GA4 and reloads without GTM", () => {
  const run = runBootstrap(`${ORIGIN}/learn`);
  run.navigateBack("/workspace");
  assert.equal(run.reloaded, 1);
  assert.equal(run.window["ga-disable-G-Q2MD6ESG15"], true);
});

test("rejects unsafe container ids", () => {
  assert.throws(() => buildGtmBootstrapScript({ containerId: "GTM-1');alert(1);//", publicPaths: ["/"] }));
});
