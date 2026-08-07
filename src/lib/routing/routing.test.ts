import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeAnalyticsMetadata } from "@/lib/analytics/metadata";
import { generateProfile } from "@/lib/generateProfile";
import { containsForbiddenLanguage } from "@/lib/safety";
import type { IntakeAnswers, ProjectRecord } from "@/lib/types";
import {
  buildNextBestStepPlan,
  buildNextBestStepPlanForRecord,
  buildRoutingContext,
  detectConcreteUrgentDeadline,
  detectPastDisclosureWithoutReliableDate,
  detectReadyForProfessionalConversation,
  detectUriAffiliationSignal,
  getPartner,
  isPartnerPersonalizable,
  PARTNER_REGISTRY,
  planToLegacyStepStrings,
  assertReasonCopySafe,
  withUtm,
} from "./index";

function baseAnswers(overrides: Partial<IntakeAnswers> = {}): IntakeAnswers {
  return {
    whatCreated: "A modular desk lamp with a magnetic shade system.",
    problemSolved: "People need flexible task lighting without clutter.",
    whoFor: "Remote workers and students",
    howItWorks:
      "A weighted base holds a jointed arm; magnetic pads let shades swap in seconds.",
    mainParts: "Base, arm, LED head, magnetic shade rings",
    whatDifferent: "Shade swaps without tools and packs flat for travel.",
    itemType: "physical_product",
    hasPrototype: true,
    assets: ["drawings", "photos"],
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

function fixture(
  overrides: Partial<IntakeAnswers> = {},
  recordOverrides: Partial<ProjectRecord> = {},
): ProjectRecord {
  const answers = baseAnswers(overrides);
  return {
    id: "routing-fixture-1",
    createdAt: "2026-06-01T12:00:00.000Z",
    updatedAt: "2026-06-02T12:00:00.000Z",
    answers,
    profile: generateProfile(answers),
    preClarity: 3,
    postClarity: null,
    developmentTimeline: {
      "Date idea started": "2025-11",
      "Date first prototype built": "2026-01",
    },
    ...recordOverrides,
  };
}

function allCopy(plan: ReturnType<typeof buildNextBestStepPlan>): string {
  return [...plan.primary, ...plan.secondary]
    .map((rec) => `${rec.title} ${rec.body}`)
    .join(" \n ");
}

describe("routing / next best step plan", () => {
  it("disclosed without concrete deadline is not urgent_timing_deadline", () => {
    const record = fixture(
      { sharedChannels: ["social_media"] },
      {
        profile: {
          ...generateProfile(baseAnswers({ sharedChannels: ["social_media"] })),
          publicDisclosure: true,
        },
        developmentTimeline: {
          "Date first shared publicly": "2024-06",
        },
      },
    );
    assert.equal(detectPastDisclosureWithoutReliableDate(record), false);
    assert.equal(detectConcreteUrgentDeadline(record), false);
    const plan = buildNextBestStepPlanForRecord(record, 1);
    assert.ok(
      !plan.primary.some((rec) => rec.category === "urgent_timing_deadline"),
    );
  });

  it("past disclosure without reliable date uses review_public_disclosure", () => {
    const answers = baseAnswers({ sharedChannels: ["social_media"] });
    const profile = generateProfile(answers);
    profile.publicDisclosure = true;
    const record: ProjectRecord = {
      ...fixture(answers),
      profile,
      developmentTimeline: {},
      answers: {
        ...answers,
        disclosureEvents: [{ id: "d1", kind: "public" }],
      },
    };
    assert.equal(detectPastDisclosureWithoutReliableDate(record), true);
    const plan = buildNextBestStepPlanForRecord(record, 0);
    assert.ok(
      plan.primary.some((rec) => rec.category === "review_public_disclosure"),
    );
    assert.ok(
      !plan.primary.some((rec) => rec.category === "urgent_timing_deadline"),
    );
  });

  it("URI Innovations primary only with URI affiliation signal", () => {
    const withoutUri = buildNextBestStepPlanForRecord(
      fixture({ institutionRelationship: "no", location: "Boston, MA" }),
      2,
    );
    assert.ok(
      !withoutUri.primary.some((rec) => rec.partnerId === "uri_innovations"),
    );
    assert.ok(
      withoutUri.secondary.some((rec) => rec.partnerId === "uri_innovations"),
    );

    const uriAnswers = baseAnswers({
      institutionRelationship: "yes",
      location: "Kingston, RI — URI campus",
    });
    const completeUriRecord: ProjectRecord = {
      ...fixture(uriAnswers),
      developmentTimeline: {
        "Date idea started": "2025-01",
        "Date first written down or sketched": "2025-02",
        "Date first prototype built": "2025-06",
        "Date first shared publicly": "2025-09",
        "Date first pitched, sold, or demoed": "2025-10",
        "Date of major improvements": "2026-01",
        "Date first shown privately": "2025-08",
      },
    };
    const withUri = buildNextBestStepPlanForRecord(completeUriRecord, 3);
    assert.equal(detectUriAffiliationSignal(uriAnswers), true);
    assert.ok(
      withUri.primary.some((rec) => rec.partnerId === "uri_innovations"),
    );
  });

  it("PTRC copy never claims legal review", () => {
    const record = fixture({ location: "Providence, RI" });
    const plan = buildNextBestStepPlanForRecord(record, 0);
    const ptrcCopy = allCopy(plan);
    assert.match(ptrcCopy, /do not provide legal review|not legal advice/i);
    assert.doesNotMatch(ptrcCopy, /\blegal review of your (idea|invention|application)\b/i);
  });

  it("verified partner disclaimer does not imply endorsement", () => {
    const uri = getPartner("uri_innovations");
    assert.ok(uri);
    assert.match(uri.disclaimer, /identity only|not legal advice/i);
    assert.doesNotMatch(uri.disclaimer, /endorse|recommend/i);
  });

  it("inactive partners never appear in personalized primary recommendations", () => {
    for (const id of ["rihub", "seg", "community_ip"] as const) {
      const partner = PARTNER_REGISTRY[id];
      assert.equal(isPartnerPersonalizable(partner), false);
    }
    const plan = buildNextBestStepPlanForRecord(fixture(), 0);
    for (const rec of [...plan.primary, ...plan.secondary]) {
      assert.notEqual(rec.partnerId, "rihub");
      assert.notEqual(rec.partnerId, "seg");
      assert.notEqual(rec.partnerId, "community_ip");
    }
  });

  it("same RoutingContext yields identical plan on all surfaces", () => {
    const record = fixture();
    const ctx = buildRoutingContext(record, 2);
    const a = buildNextBestStepPlan(ctx);
    const b = buildNextBestStepPlan(ctx);
    assert.equal(a.fingerprint, b.fingerprint);
    assert.deepEqual(
      a.primary.map((rec) => rec.id),
      b.primary.map((rec) => rec.id),
    );
  });

  it("limits primary recommendations to three", () => {
    const sparse = fixture({
      whatCreated: "",
      problemSolved: "",
      whoFor: "",
      howItWorks: "",
      mainParts: "",
      whatDifferent: "",
      assets: [],
      sharedChannels: ["pitch"],
      wantsProBono: true,
      location: "Providence, RI",
      institutionRelationship: "yes",
    });
    const plan = buildNextBestStepPlanForRecord(sparse, 0);
    assert.ok(plan.primary.length <= 3);
  });

  it("orders urgent recommendations ahead of lower priority items", () => {
    const record = fixture(
      {
        sharedChannels: ["pitch"],
        whatCreated: "",
        howItWorks: "",
        mainParts: "",
        whatDifferent: "",
      },
      {
        developmentTimeline: {},
        answers: {
          ...baseAnswers({
            sharedChannels: ["pitch"],
            whatCreated: "",
            howItWorks: "",
            mainParts: "",
            whatDifferent: "",
          }),
          disclosureEvents: [
            { id: "future", kind: "public", approximateDate: "2027-01" },
          ],
        },
      },
    );
    const plan = buildNextBestStepPlanForRecord(record, 0);
    assert.ok(plan.primary.length > 0);
    assert.equal(plan.primary[0].category, "urgent_timing_deadline");
  });

  it("does not recommend professional review from score alone", () => {
    const highScoreIncomplete = fixture({
      whatCreated: "Complete idea",
      problemSolved: "Complete problem",
      whoFor: "Users",
      howItWorks: "",
      mainParts: "",
      whatDifferent: "",
    });
    const plan = buildNextBestStepPlanForRecord(highScoreIncomplete, 0);
    assert.ok(
      !plan.primary.some((rec) => rec.category === "speak_patent_professional"),
    );
  });

  it("plan copy passes forbidden-language safety check", () => {
    const plan = buildNextBestStepPlanForRecord(fixture(), 0);
    assert.equal(containsForbiddenLanguage(allCopy(plan)), false);
    for (const step of planToLegacyStepStrings(plan)) {
      assert.equal(containsForbiddenLanguage(step), false);
    }
  });

  it("analytics metadata excludes invention text and limits fields", () => {
    const plan = buildNextBestStepPlanForRecord(fixture(), 0);
    const rec = plan.primary[0];
    const sanitized = sanitizeAnalyticsMetadata({
      recommendationId: rec.id,
      category: rec.category,
      partnerId: rec.partnerId,
      projectId: "routing-fixture-1",
      title: rec.title,
      reason: rec.body,
      whyRecommended: rec.whyRecommended,
      inventionSummary: fixture().answers.whatCreated,
    });
    assert.equal(sanitized.recommendationId, rec.id);
    assert.equal(sanitized.category, rec.category);
    assert.equal(sanitized.projectId, "routing-fixture-1");
    assert.equal(sanitized.title, undefined);
    assert.equal(sanitized.reason, undefined);
    assert.equal(sanitized.inventionSummary, undefined);
    assert.equal(sanitized.whyRecommended, undefined);
  });

  it("every recommendation includes safe whyRecommended copy", () => {
    const plan = buildNextBestStepPlanForRecord(fixture(), 0);
    for (const rec of [...plan.primary, ...plan.secondary]) {
      assert.ok(rec.whyRecommended.trim().length > 0);
      assert.equal(assertReasonCopySafe(rec.whyRecommended), true);
      assert.doesNotMatch(rec.whyRecommended, /modular desk|magnetic shade/i);
    }
  });

  it("professional review boundary requires core completeness not score alone", () => {
    const incomplete = fixture({
      howItWorks: "",
      mainParts: "",
      whatDifferent: "",
    });
    assert.equal(
      detectReadyForProfessionalConversation(incomplete, 5),
      false,
    );
    const complete = fixture();
    assert.equal(detectReadyForProfessionalConversation(complete, 3), true);
  });

  it("stale verification status excludes partner from personalization", () => {
    const stalePartner = {
      ...getPartner("ppl_ptrc")!,
      verificationStatus: "stale" as const,
    };
    assert.equal(isPartnerPersonalizable(stalePartner), false);
  });

  it("safe UTM construction uses project id slice only", () => {
    const url = withUtm("https://uriinnovations.org/", {
      projectId: "routing-fixture-1",
      utmCampaign: "uri_innovations",
    });
    assert.match(url, /utm_source=smartprobonoip/);
    assert.match(url, /utm_content=routing-fixture-1/);
    assert.doesNotMatch(url, /modular|desk lamp/i);
  });
});
