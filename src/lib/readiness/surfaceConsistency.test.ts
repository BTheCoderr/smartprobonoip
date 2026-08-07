import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateProfile } from "@/lib/generateProfile";
import type { IntakeAnswers, ProjectRecord } from "@/lib/types";
import { readinessScoresAcrossSurfaces } from "./surfaces";

function fixture(overrides: Partial<IntakeAnswers> = {}): ProjectRecord {
  const answers: IntakeAnswers = {
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
    contributorsInvolved: "solo",
    agreementStatus: "not_applicable",
    institutionRelationship: "no",
    aiAssistance: "none",
    protectionPath: "patent",
    ...overrides,
  };
  const profile = generateProfile(answers);
  return {
    id: "readiness-fixture-1",
    createdAt: "2026-06-01T12:00:00.000Z",
    updatedAt: "2026-06-02T12:00:00.000Z",
    title: "Modular desk lamp",
    status: "packet_generated",
    answers,
    profile,
    preClarity: 3,
    postClarity: null,
    isDemo: false,
    developmentTimeline: {
      "Date idea started": "2025-11",
      "Date first prototype built": "2026-01",
    },
  };
}

describe("canonical readiness score across surfaces", () => {
  it("returns the same overall score on workspace, card, dashboard, packet, and PDF helpers", () => {
    const record = fixture();
    const scores = readinessScoresAcrossSurfaces(record, 1);

    assert.equal(scores.workspaceSummary, scores.canonical);
    assert.equal(scores.inventionCard, scores.canonical);
    assert.equal(scores.readinessDashboard, scores.canonical);
    assert.equal(scores.packetPage, scores.canonical);
    assert.equal(scores.pdfHelper, scores.canonical);

    for (const value of Object.values(scores)) {
      assert.ok(value >= 0 && value <= 100);
    }
  });

  it("stays consistent when core fields are missing", () => {
    const record = fixture({
      whatDifferent: "",
      problemSolved: "",
      hasPrototype: false,
      assets: [],
    });
    const scores = readinessScoresAcrossSurfaces(record, 0);
    const unique = new Set(Object.values(scores));
    assert.equal(unique.size, 1);
  });
});
