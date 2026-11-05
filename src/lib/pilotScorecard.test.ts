import assert from "node:assert/strict";
import test from "node:test";
import {
  computePilotFunnelScorecard,
  type PilotFunnelEvent,
} from "./pilotScorecard";

function row(
  event_name: string,
  pilot_session_id: string | null,
  demo?: boolean,
): PilotFunnelEvent {
  return {
    event_name,
    pilot_session_id,
    metadata: demo === undefined ? {} : { demo },
  };
}

test("counts distinct, explicitly real sessions and their matched completion", () => {
  const metrics = computePilotFunnelScorecard([
    row("intake_started", "real1", false),
    row("intake_started", "real1", false),
    row("intake_completed", "real1", false),
    row("attorney_export_completed", "real1", false),
    row("intake_started", "real2", false),
    row("intake_completed", "demo1", true),
    row("intake_started", "unknown", undefined),
  ]);
  assert.equal(metrics.confirmedRealIntakeSessions, 2);
  assert.equal(metrics.confirmedRealCompletedSessions, 1);
  assert.equal(metrics.confirmedRealExportSessions, 1);
  assert.equal(metrics.matchedCompletionPercent, 50);
  assert.equal(metrics.excludedDemoEvents, 1);
  assert.equal(metrics.unclassifiedEvents, 1);
  assert.equal(metrics.professionalReviewsVerified, null);
  assert.equal(metrics.reviewerMinutesSaved, null);
});

test("never treats missing demo flag or identity as verified real", () => {
  const metrics = computePilotFunnelScorecard([
    row("intake_started", "unclassified"),
    row("intake_completed", "unclassified"),
    row("intake_started", null, false),
    row("intake_completed", "demo", true),
    row("landing_viewed", "visitor", false),
  ]);
  assert.equal(metrics.confirmedRealIntakeSessions, 0);
  assert.equal(metrics.confirmedRealCompletedSessions, 0);
  assert.equal(metrics.matchedCompletionPercent, null);
  assert.equal(metrics.unclassifiedEvents, 2);
  assert.equal(metrics.unidentifiableRealEvents, 1);
  assert.equal(metrics.excludedDemoEvents, 1);
});

test("supports a limited event window without inflating claims", () => {
  const metrics = computePilotFunnelScorecard(
    [row("attorney_export_completed", "real", false)],
    { eventWindowLimited: true },
  );
  assert.equal(metrics.confirmedRealExportSessions, 1);
  assert.equal(metrics.confirmedRealIntakeSessions, 0);
  assert.equal(metrics.matchedCompletionPercent, null);
  assert.equal(metrics.eventWindowLimited, true);
  assert.equal(metrics.professionalReviewsVerified, null);
});
