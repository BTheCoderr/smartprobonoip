import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import type { AnalyticsEventRow } from "../db/analytics";
import { computeAnalyticsDashboard } from "../analyticsMetrics";
import {
  isAnalyticsEventName,
  isServerRecordedEvent,
  SERVER_RECORDED_EVENTS,
} from "./events";

let seq = 0;
function row(
  event_name: string,
  overrides: Partial<AnalyticsEventRow> = {},
): AnalyticsEventRow {
  seq += 1;
  return {
    id: `evt-${seq}`,
    event_name,
    project_id: null,
    pilot_session_id: "session-aaaaaaaaaaaa",
    anonymous_id: null,
    partner_slug: null,
    partner_name: null,
    source: null,
    campaign: null,
    route: null,
    metadata: { demo: false },
    created_at: "2026-11-23T00:00:00.000Z",
    ...overrides,
  };
}

test("regression: one completion recorded by server and client counts once", () => {
  const events = [
    row("intake_completed", { project_id: "p1" }), // server, from POST /api/records
    row("intake_completed"), // legacy browser emit
    row("packet_generated", { project_id: "p1" }),
  ];
  const { funnel } = computeAnalyticsDashboard(events);
  assert.equal(funnel.intakeCompleted, 1);
  assert.equal(funnel.packetGenerated, 1);
});

test("funnel counts distinct sessions and excludes demo activity", () => {
  const events = [
    row("intake_started", { pilot_session_id: "session-111111111111" }),
    row("intake_started", { pilot_session_id: "session-111111111111" }),
    row("intake_started", { pilot_session_id: "session-222222222222" }),
    row("intake_started", { pilot_session_id: "session-333333333333", metadata: { demo: true } }),
    row("landing_viewed", { pilot_session_id: null, anonymous_id: "anon-1", metadata: {} }),
    row("landing_viewed", { pilot_session_id: null, anonymous_id: "anon-1", metadata: {} }),
  ];
  const { funnel } = computeAnalyticsDashboard(events);
  assert.equal(funnel.intakeStarted, 2);
  assert.equal(funnel.landingViewed, 1);
});

test("partner performance is deduplicated and excludes demo", () => {
  const partner = { partner_slug: "ri-clinic", partner_name: "RI Clinic" };
  const events = [
    row("intake_completed", partner),
    row("intake_completed", partner),
    row("packet_generated", partner),
    row("packet_generated", { ...partner, pilot_session_id: "session-demo00000000", metadata: { demo: true } }),
  ];
  const perf = computeAnalyticsDashboard(events).partnerPerformance.find(
    (p) => p.partnerSlug === "ri-clinic",
  );
  assert.ok(perf);
  assert.equal(perf.intakeCompleted, 1);
  assert.equal(perf.packets, 1);
});

test("server-recorded list only names known events", () => {
  for (const name of SERVER_RECORDED_EVENTS) {
    assert.ok(isAnalyticsEventName(name), name);
  }
  assert.equal(isServerRecordedEvent("intake_completed"), true);
  assert.equal(isServerRecordedEvent("intake_started"), false);
});

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".test.ts")) out.push(full);
  }
  return out;
}

test("every event the server records is on the server-recorded list", () => {
  const missing = new Set<string>();
  for (const file of walk("src")) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/trackServerEvent\(\s*"([a-z_]+)"/g)) {
      if (!isServerRecordedEvent(match[1])) missing.add(`${match[1]} (${file})`);
    }
  }
  assert.deepEqual([...missing], []);
});

test("public track endpoint and browser client skip server-recorded events", () => {
  const route = readFileSync("src/app/api/analytics/track/route.ts", "utf8");
  assert.match(route, /isServerRecordedEvent\(body\.eventName\)/);
  const client = readFileSync("src/lib/analytics/client.ts", "utf8");
  assert.match(client, /if \(isServerRecordedEvent\(eventName\)\) return;/);
});
