import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeAnalyticsMetadata } from "@/lib/analytics/metadata";
import {
  dismissRecommendationId,
  normalizeRoutingPreferences,
  restoreAllDismissals,
  restoreRecommendationId,
} from "./dismissals";
import {
  buildHandoffContent,
  requiresHandoffConfirmation,
} from "./handoff";
import { formatWhyRecommended, assertReasonCopySafe } from "./reasons";
import {
  buildNextBestStepPlanForRecord,
  detectUriAffiliationSignal,
  getPartner,
  isPartnerPersonalizable,
  withUtm,
} from "./index";
import { generateProfile } from "@/lib/generateProfile";
import type { IntakeAnswers, ProjectRecord } from "@/lib/types";

function baseAnswers(overrides: Partial<IntakeAnswers> = {}): IntakeAnswers {
  return {
    whatCreated: "A modular desk lamp.",
    problemSolved: "Flexible lighting.",
    whoFor: "Students",
    howItWorks: "Magnetic shade swaps.",
    mainParts: "Base, arm, LED",
    whatDifferent: "Tool-free shade changes.",
    itemType: "physical_product",
    hasPrototype: true,
    assets: ["drawings"],
    sharedChannels: ["none"],
    hasBrandIdentity: false,
    goals: ["expert_review"],
    location: "Providence, RI",
    wantsProBono: false,
    preClarity: 3,
    institutionRelationship: "no",
    protectionPath: "patent",
    ...overrides,
  };
}

function fixture(overrides: Partial<IntakeAnswers> = {}): ProjectRecord {
  const answers = baseAnswers(overrides);
  return {
    id: "handoff-fixture",
    createdAt: "2026-06-01T12:00:00.000Z",
    updatedAt: "2026-06-02T12:00:00.000Z",
    answers,
    profile: generateProfile(answers),
    preClarity: 3,
    postClarity: null,
    developmentTimeline: {},
  };
}

describe("routing / dismissals", () => {
  it("persists dismiss and restore per project preferences object", () => {
    const empty = normalizeRoutingPreferences(null);
    assert.deepEqual(empty.dismissedRecommendationIds, []);

    const dismissed = dismissRecommendationId(empty, "ppl-ptrc");
    assert.deepEqual(dismissed.dismissedRecommendationIds, ["ppl-ptrc"]);

    const restored = restoreRecommendationId(dismissed, "ppl-ptrc");
    assert.deepEqual(restored.dismissedRecommendationIds, []);

    const many = dismissRecommendationId(
      dismissRecommendationId(empty, "a"),
      "b",
    );
    assert.deepEqual(restoreAllDismissals().dismissedRecommendationIds, []);
    assert.equal(many.dismissedRecommendationIds.length, 2);
  });
});

describe("routing / reasons and handoff", () => {
  it("whyRecommended uses approved signals only — no intake text", () => {
    const record = fixture({
      location: "Kingston, RI — URI campus",
      institutionRelationship: "yes",
      ownershipNotes: "Employer owns all inventions per policy XYZ-SECRET",
      whatCreated: "Super secret widget description",
    });
    const plan = buildNextBestStepPlanForRecord(record, 0);
    const uriRec = [...plan.primary, ...plan.secondary].find(
      (rec) => rec.partnerId === "uri_innovations",
    );
    assert.ok(uriRec);
    assert.match(uriRec.whyRecommended, /university|institutional/i);
    assert.doesNotMatch(uriRec.whyRecommended, /SECRET|widget|Employer owns/i);
    assert.equal(assertReasonCopySafe(uriRec.whyRecommended), true);
  });

  it("URI affiliation avoids substring false positives in unrelated words", () => {
    assert.equal(
      detectUriAffiliationSignal(
        baseAnswers({ location: "Springfield, MA", institutionRelationship: "no" }),
      ),
      false,
    );
    assert.equal(
      detectUriAffiliationSignal(
        baseAnswers({ location: "Boston during winter", institutionRelationship: "no" }),
      ),
      false,
    );
  });

  it("inactive partners are excluded from personalized recommendations", () => {
    for (const id of ["rihub", "seg", "community_ip"] as const) {
      const partner = getPartner(id);
      assert.ok(partner);
      assert.equal(isPartnerPersonalizable(partner), false);
    }
  });

  it("handoff content never includes invention payload fields", () => {
    const record = fixture({ location: "Providence, RI" });
    const plan = buildNextBestStepPlanForRecord(record, 0);
    const ptrc = [...plan.primary, ...plan.secondary].find(
      (rec) => rec.partnerId === "ppl_ptrc",
    );
    assert.ok(ptrc);
    const handoff = buildHandoffContent(ptrc, record.id);
    assert.ok(handoff);
    const blob = JSON.stringify(handoff);
    assert.doesNotMatch(blob, /modular desk|Magnetic shade|whatCreated/i);
    assert.ok(handoff.destinationUrl.startsWith("https://"));
  });

  it("external partner recommendations require handoff confirmation", () => {
    const record = fixture({ location: "Providence, RI" });
    const plan = buildNextBestStepPlanForRecord(record, 0);
    const ptrc = [...plan.primary, ...plan.secondary].find(
      (rec) => rec.partnerId === "ppl_ptrc",
    );
    assert.ok(ptrc);
    assert.equal(requiresHandoffConfirmation(ptrc), true);

    const learn = [...plan.primary, ...plan.secondary].find(
      (rec) => rec.partnerId === "internal_learn",
    );
    assert.ok(learn);
    assert.equal(requiresHandoffConfirmation(learn), false);
  });

  it("UTM builder never embeds invention text", () => {
    const url = withUtm("https://example.org/resource", {
      projectId: "abc-123",
      utmCampaign: "ppl_ptrc",
    });
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("utm_source"), "smartprobonoip");
    assert.equal(parsed.searchParams.get("utm_medium"), "referral");
    assert.equal(parsed.searchParams.get("utm_campaign"), "ppl_ptrc");
    assert.equal(parsed.searchParams.get("utm_content"), "abc-123");
    assert.doesNotMatch(url, /desk lamp|invention|whatCreated/i);
  });

  it("feedback analytics metadata excludes invention text", () => {
    const sanitized = sanitizeAnalyticsMetadata({
      recommendationId: "ppl-ptrc",
      category: "visit_ptrc",
      partnerId: "ppl_ptrc",
      projectId: "handoff-fixture",
      feedbackValue: "helpful",
      whyRecommended: formatWhyRecommended(["local_ptrc_match"]),
      inventionSummary: fixture().answers.whatCreated,
    });
    assert.equal(sanitized.feedbackValue, "helpful");
    assert.equal(sanitized.recommendationId, "ppl-ptrc");
    assert.equal(sanitized.inventionSummary, undefined);
    assert.equal(sanitized.whyRecommended, undefined);
  });
});
