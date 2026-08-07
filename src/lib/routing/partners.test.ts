import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeAnalyticsMetadata } from "@/lib/analytics/metadata";
import {
  buildHandoffContent,
  filterPartners,
  getPartner,
  getPublicDirectoryPartners,
  getPublicPartnerById,
  isPartnerPersonalizable,
  isPartnerPublicDirectoryEligible,
  PARTNER_REGISTRY,
  PUBLIC_DIRECTORY_PARTNER_IDS,
  searchPartners,
  toPublicPartnerView,
  withUtm,
} from "./index";
import { buildNextBestStepPlanForRecord } from "./plan";
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
    id: "partner-directory-fixture",
    createdAt: "2026-06-01T12:00:00.000Z",
    answers,
    profile: generateProfile(answers),
    preClarity: 3,
    postClarity: null,
  };
}

describe("routing / public partner directory", () => {
  it("includes only the four launch external partners when active", () => {
    const publicPartners = getPublicDirectoryPartners();
    assert.equal(publicPartners.length, 4);
    assert.deepEqual(
      publicPartners.map((partner) => partner.id).sort(),
      [...PUBLIC_DIRECTORY_PARTNER_IDS].sort(),
    );
  });

  it("excludes stale, unverified, and internal partners from public directory", () => {
    for (const id of [
      "rihub",
      "seg",
      "community_ip",
      "internal_learn",
      "internal_trust",
    ] as const) {
      const partner = getPartner(id);
      assert.ok(partner);
      assert.equal(isPartnerPublicDirectoryEligible(partner), false);
      assert.equal(getPublicPartnerById(id), undefined);
    }
  });

  it("uses the same PARTNER_REGISTRY for router, directory, and handoff", () => {
    const record = fixture({ location: "Providence, RI" });
    const plan = buildNextBestStepPlanForRecord(record, 0);
    const ptrc = [...plan.primary, ...plan.secondary].find(
      (rec) => rec.partnerId === "ppl_ptrc",
    );
    assert.ok(ptrc);
    const registryPartner = PARTNER_REGISTRY.ppl_ptrc;
    const publicPartner = getPublicPartnerById("ppl_ptrc");
    assert.ok(publicPartner);
    assert.equal(publicPartner.name, registryPartner.name);
    const handoff = buildHandoffContent(ptrc, record.id);
    assert.ok(handoff);
    assert.equal(handoff.partnerName, registryPartner.name);
  });

  it("filtering is deterministic by partner id", () => {
    const partners = getPublicDirectoryPartners().map(toPublicPartnerView);
    const filteredA = filterPartners(partners, { location: "Rhode Island" });
    const filteredB = filterPartners(partners, { location: "Rhode Island" });
    assert.deepEqual(
      filteredA.map((partner) => partner.id),
      filteredB.map((partner) => partner.id),
    );
    assert.ok(filteredA.every((partner, index, list) => {
      if (index === 0) return true;
      return list[index - 1]!.id.localeCompare(partner.id) <= 0;
    }));
  });

  it("search matches safe registry fields only", () => {
    const partners = getPublicDirectoryPartners().map(toPublicPartnerView);
    const byName = searchPartners(partners, "Providence Public Library");
    assert.ok(byName.some((partner) => partner.id === "ppl_ptrc"));

    const byService = searchPartners(partners, "pro bono");
    assert.ok(
      byService.some((partner) => partner.id === "uspto_patent_pro_bono"),
    );

    const noMatch = searchPartners(partners, "Super secret invention widget");
    assert.equal(noMatch.length, 0);
  });

  it("search analytics metadata excludes inventor content and raw query", () => {
    const sanitized = sanitizeAnalyticsMetadata({
      resultCount: 2,
      query: "my secret invention about lamps",
      partnerId: "ppl_ptrc",
      inventionSummary: "Super secret widget",
    });
    assert.equal(sanitized.resultCount, 2);
    assert.equal(sanitized.query, undefined);
    assert.equal(sanitized.inventionSummary, undefined);
  });

  it("verification copy does not imply endorsement", () => {
    for (const partner of getPublicDirectoryPartners()) {
      const disclaimer = partner.disclaimer.toLowerCase();
      assert.match(
        disclaimer,
        /legal advice|eligibility|education|verification|do not provide|not currently offered/i,
      );
      assert.doesNotMatch(disclaimer, /we endorse|guaranteed outcome/i);
    }
  });

  it("inactive partner disappears from public directory and personalized recs", () => {
    for (const id of ["rihub", "seg", "community_ip"] as const) {
      const partner = getPartner(id);
      assert.ok(partner);
      assert.equal(isPartnerPersonalizable(partner), false);
      assert.equal(isPartnerPublicDirectoryEligible(partner), false);
      assert.ok(
        !getPublicDirectoryPartners().some((entry) => entry.id === id),
      );
    }
  });

  it("public partner detail URLs are stable registry ids", () => {
    for (const id of PUBLIC_DIRECTORY_PARTNER_IDS) {
      const partner = getPublicPartnerById(id);
      assert.ok(partner);
      assert.equal(partner.id, id);
    }
    assert.equal(getPublicPartnerById("internal_learn"), undefined);
    assert.equal(getPublicPartnerById("not-a-partner"), undefined);
  });

  it("anonymous directory UTM destinations omit projectId", () => {
    const partner = getPublicPartnerById("ppl_ptrc");
    assert.ok(partner);
    const url = partner.buildDestination({
      utmCampaign: "partner_directory_ppl_ptrc",
    });
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("utm_source"), "smartprobonoip");
    assert.ok(parsed.searchParams.get("utm_campaign"));
    assert.equal(parsed.searchParams.get("utm_content"), null);

    const tracked = withUtm("https://example.org/", {
      projectId: "abc-123",
      utmCampaign: "handoff",
    });
    assert.equal(new URL(tracked).searchParams.get("utm_content"), "abc-123");
  });

  it("URI Innovations remains public for all visitors when active", () => {
    const uri = getPublicPartnerById("uri_innovations");
    assert.ok(uri);
    assert.ok(uri.eligibilityNotes);
    assert.match(uri.eligibilityNotes!, /Rhode Island-affiliated inventors/i);
  });
});
