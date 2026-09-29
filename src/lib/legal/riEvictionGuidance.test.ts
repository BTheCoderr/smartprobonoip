import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildRiEvictionGuidance,
  deriveRiEvictionCategory,
  formatRiEvictionSummary,
} from "@/lib/legal/riEvictionGuidance";
import { EMPTY_RI_EVICTION_INTAKE } from "@/lib/legal/riEvictionStorage";

describe("Rhode Island eviction preparation guidance", () => {
  it("classifies a nonpayment intake without declaring a legal outcome", () => {
    const intake = {
      ...EMPTY_RI_EVICTION_INTAKE,
      behindOnRent: "yes" as const,
      noticeReceived: "yes" as const,
      noticeType: "Five-day demand / nonpayment" as const,
    };
    assert.equal(deriveRiEvictionCategory(intake), "nonpayment");
    const guidance = buildRiEvictionGuidance(intake);
    assert.match(guidance.summary, /preparation only/i);
    assert.ok(guidance.sourceIds.includes("ri-landlord-tenant-handbook"));
    assert.doesNotMatch(guidance.summary, /you will|you should win|valid defense/i);
  });

  it("flags reported judgment information as time-sensitive", () => {
    const guidance = buildRiEvictionGuidance({
      ...EMPTY_RI_EVICTION_INTAKE,
      judgmentEntered: "yes",
    });
    assert.equal(guidance.urgent, true);
    assert.ok(guidance.immediateSteps.some((step) => /five calendar days/i.test(step)));
    assert.ok(guidance.immediateSteps.some((step) => /confirm the exact deadline/i.test(step)));
  });

  it("adds condition and subsidy preparation materials", () => {
    const guidance = buildRiEvictionGuidance({
      ...EMPTY_RI_EVICTION_INTAKE,
      unsafeConditions: "yes",
      subsidy: "yes",
    });
    assert.ok(guidance.flags.some((flag) => /condition/i.test(flag)));
    assert.ok(guidance.flags.some((flag) => /subsidized/i.test(flag)));
    assert.ok(guidance.gatherDocuments.some((item) => /inspection/i.test(item)));
  });

  it("formats a staff-ready summary with a legal-advice boundary", () => {
    const intake = {
      ...EMPTY_RI_EVICTION_INTAKE,
      city: "Providence",
      caseFiled: "yes" as const,
    };
    const text = formatRiEvictionSummary(intake, buildRiEvictionGuidance(intake));
    assert.match(text, /RHODE ISLAND EVICTION PREPARATION SUMMARY/);
    assert.match(text, /Providence/);
    assert.match(text, /not legal advice/i);
  });
});
