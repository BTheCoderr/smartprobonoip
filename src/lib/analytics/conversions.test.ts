import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { beforeEach, test } from "node:test";
import "../testing/serverModuleStubs";
import { conversionFor, conversionParams, GA_CONVERSION_EVENTS } from "./conversions";
import { isAnalyticsEventName } from "./events";
import { buildMeasurementProtocolRequest, gaClientIdFromCookie } from "./measurementProtocol";

test("every requested funnel conversion has a source event", () => {
  const mapped = new Set(
    [
      "landing_cta_clicked",
      "learn_started",
      "learn_completed",
      "intake_started",
      "intake_completed",
      "recommendation_handoff_viewed",
      "organization_share_consent_viewed",
      "attorney_export_completed",
      "recommendation_handoff_confirmed",
      "organization_share_consent_submitted",
    ].map((e) => {
      assert.ok(isAnalyticsEventName(e), e);
      return conversionFor(e);
    }),
  );
  for (const name of GA_CONVERSION_EVENTS) assert.ok(mapped.has(name), name);
});

test("conversion params drop everything except enum-like values", () => {
  const params = conversionParams({
    demo: false,
    ctaId: "ip_hero_start",
    pageSection: "ip_hero",
    projectId: "1d2c3b4a-0000-4000-8000-000000000000",
    email: "inventor@example.com",
    whatCreated: "A self-sealing bottle",
    recommendationId: "rec-123",
  });
  assert.deepEqual(params, { demo: false, cta_id: "ip_hero_start", page_section: "ip_hero" });
  assert.deepEqual(conversionParams({ ctaId: "Has Spaces / and@email.com" }), {});
});

// ---- GTM dataLayer behaviour ----------------------------------------------

type Layer = Record<string, unknown>[];
function browserAt(pathname: string): Layer {
  const dataLayer: Layer = [];
  (globalThis as Record<string, unknown>).window = {
    location: { pathname, search: "" },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    dataLayer,
  };
  process.env.NEXT_PUBLIC_GTM_ID = "GTM-TEST123";
  return dataLayer;
}

beforeEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

test("public-page conversions are pushed with only safe params", async () => {
  const layer = browserAt("/learn");
  const { trackGtmEvent } = await import("./gtm");
  trackGtmEvent("learn_started", { pageSection: "learn_modules", route: "/learn" });
  trackGtmEvent("intake_started", { demo: false, route: "/start" });
  const events = layer.map((e) => e.event);
  assert.ok(events.includes("learn_started"));
  assert.ok(events.includes("prepare_started"));
  const prepare = layer.find((e) => e.event === "prepare_started");
  assert.deepEqual(prepare, { event: "prepare_started", demo: false });
});

test("regression: nothing is pushed to GTM from private routes", async () => {
  const layer = browserAt("/profile/1d2c3b4a-0000-4000-8000-000000000000");
  const { trackGtmEvent } = await import("./gtm");
  trackGtmEvent("recommendation_handoff_confirmed", {});
  trackGtmEvent("attorney_export_completed", {});
  trackGtmEvent("intake_completed", { route: "/profile/1d2c3b4a-0000-4000-8000-000000000000" });
  assert.deepEqual(layer, []);
});

// ---- Measurement Protocol (private-page conversions) -----------------------

const ENV = { measurementId: "G-Q2MD6ESG15", apiSecret: "test-secret" };

test("reads the GA client id from the _ga cookie only", () => {
  assert.equal(gaClientIdFromCookie("a=1; _ga=GA1.1.1234567890.1700000000; b=2"), "1234567890.1700000000");
  assert.equal(gaClientIdFromCookie("_ga_Q2MD6ESG15=GS1.1.x"), null);
  assert.equal(gaClientIdFromCookie(null), null);
});

test("private-page conversions are forwarded without any URL or identifiers", () => {
  const req = buildMeasurementProtocolRequest({
    eventName: "organization_share_consent_submitted",
    clientId: "1234567890.1700000000",
    metadata: { demo: false, fieldCount: 4, referralId: "ref-1", partnerId: "uri" },
    ...ENV,
  });
  assert.ok(req);
  assert.deepEqual(req.body, {
    client_id: "1234567890.1700000000",
    non_personalized_ads: true,
    events: [{ name: "professional_referral_requested", params: { demo: false, engagement_time_msec: 1 } }],
  });
  const text = JSON.stringify(req.body);
  for (const forbidden of ["page_location", "page_referrer", "user_id", "ref-1", "uri"]) {
    assert.ok(!text.includes(forbidden), forbidden);
  }
});

test("Measurement Protocol is skipped without client id, config, or for demo/public events", () => {
  const base = { eventName: "recommendation_handoff_viewed", clientId: "1.2", ...ENV };
  assert.ok(buildMeasurementProtocolRequest(base));
  assert.equal(buildMeasurementProtocolRequest({ ...base, clientId: null }), null);
  assert.equal(buildMeasurementProtocolRequest({ ...base, apiSecret: "" }), null);
  assert.equal(buildMeasurementProtocolRequest({ ...base, metadata: { demo: true } }), null);
  assert.equal(buildMeasurementProtocolRequest({ ...base, eventName: "learn_started" }), null);
});

test("forwarder posts once and never throws", async () => {
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = ENV.measurementId;
  process.env.GA4_API_SECRET = ENV.apiSecret;
  const { forwardPrivateConversion } = await import("./forwardConversion");
  const calls: string[] = [];
  const request = new Request("https://smartprobono.org/api/analytics/track", {
    method: "POST",
    headers: { cookie: "_ga=GA1.1.42.1700000000" },
  });
  const ok = await forwardPrivateConversion(request, "recommendation_handoff_confirmed", {}, (async (url: string) => {
    calls.push(String(url));
    return new Response(null, { status: 204 });
  }) as typeof fetch);
  assert.equal(ok, true);
  assert.equal(calls.length, 1);
  assert.match(calls[0], /^https:\/\/www\.google-analytics\.com\/mp\/collect\?measurement_id=G-Q2MD6ESG15&api_secret=/);
  const failing = await forwardPrivateConversion(request, "recommendation_handoff_confirmed", {}, (async () => {
    throw new Error("network");
  }) as typeof fetch);
  assert.equal(failing, false);
});

test("landing, learn and track route are wired", () => {
  const nav = readFileSync("src/components/analytics/TrackedNavLink.tsx", "utf8");
  assert.match(nav, /trackEvent\("landing_cta_clicked"/);
  const learn = readFileSync("src/components/learn/LearnJourney.tsx", "utf8");
  assert.match(learn, /trackEvent\("learn_started"/);
  assert.match(learn, /trackEvent\("learn_completed"/);
  const route = readFileSync("src/app/api/analytics/track/route.ts", "utf8");
  assert.match(route, /await forwardPrivateConversion\(request, body\.eventName, body\.metadata\)/);
});
