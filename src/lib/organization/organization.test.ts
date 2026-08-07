import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateProfile } from "@/lib/generateProfile";
import {
  defaultShareFieldSelection,
  normalizeSelectedShareFields,
  optionalShareFields,
} from "@/lib/organization/consent";
import { computeOrganizationMetrics } from "@/lib/organization/metrics";
import {
  canPerformAdminOp,
  memberCanAccessReferral,
  verifyOrganizationMembership,
} from "@/lib/organization/roles";
import {
  buildSharedSnapshot,
  sanitizeReferralForOrgView,
  snapshotContainsForbiddenNarrative,
} from "@/lib/organization/snapshot";
import {
  SHARE_FIELD_KEYS,
  type OrganizationReferralRecord,
  type ShareFieldKey,
} from "@/lib/organization/types";
import {
  filterPartners,
  getPublicDirectoryPartners,
  getPublicPartnerById,
  PARTNER_REGISTRY,
} from "@/lib/routing";
import { verifyPartnerSecretValue } from "@/lib/security/partnerAuth";
import type { IntakeAnswers, ProjectRecord } from "@/lib/types";

function baseAnswers(overrides: Partial<IntakeAnswers> = {}): IntakeAnswers {
  return {
    whatCreated: "A modular desk lamp with magnetic shades.",
    problemSolved: "Flexible lighting for students.",
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
    ownershipNotes: "SECRET ownership narrative",
    institutionRelationship: "no",
    protectionPath: "patent",
    ...overrides,
  };
}

function fixture(overrides: Partial<IntakeAnswers> = {}): ProjectRecord {
  const answers = baseAnswers(overrides);
  return {
    id: "org-test-project",
    createdAt: "2026-06-01T12:00:00.000Z",
    updatedAt: "2026-06-02T12:00:00.000Z",
    answers,
    profile: generateProfile(answers),
    preClarity: 3,
    postClarity: null,
    developmentTimeline: {},
  };
}

describe("organization membership authorization", () => {
  it("rejects client org_id that does not match verified membership", () => {
    const result = verifyOrganizationMembership({
      userId: "user-a",
      organizationId: "org-a",
      clientOrganizationId: "org-b",
      role: "reviewer",
      status: "active",
    });
    assert.equal(result.authorized, false);
    assert.equal(result.reason, "org_mismatch");
  });

  it("revoked member loses access", () => {
    const result = verifyOrganizationMembership({
      userId: "user-a",
      organizationId: "org-a",
      role: "reviewer",
      status: "revoked",
    });
    assert.equal(result.authorized, false);
    assert.equal(result.reason, "revoked");
  });

  it("reviewer cannot perform admin ops", () => {
    assert.equal(canPerformAdminOp("reviewer", "invite_member"), false);
    const result = verifyOrganizationMembership(
      {
        userId: "user-a",
        organizationId: "org-a",
        role: "reviewer",
        status: "active",
      },
      { requireAdmin: true },
    );
    assert.equal(result.authorized, false);
    assert.equal(result.reason, "admin_required");
  });

  it("org A member cannot access org B referral", () => {
    assert.equal(memberCanAccessReferral("org-a", "org-b", "active"), false);
    assert.equal(memberCanAccessReferral("org-a", "org-a", "active"), true);
  });
});

describe("shared snapshot consent", () => {
  it("defaults to explicit allowlist fields only", () => {
    const defaults = defaultShareFieldSelection();
    assert.ok(defaults.includes(SHARE_FIELD_KEYS.READINESS_OVERALL_SCORE));
    assert.ok(!defaults.includes(SHARE_FIELD_KEYS.INVENTION_TITLE));
    assert.ok(!defaults.includes(SHARE_FIELD_KEYS.INVENTION_PLAIN_SUMMARY));
  });

  it("optional title and summary absent unless selected", () => {
    const record = fixture();
    const defaultSnapshot = buildSharedSnapshot({
      record,
      selectedFields: defaultShareFieldSelection(),
    });
    assert.equal(defaultSnapshot.invention?.title, undefined);
    assert.equal(defaultSnapshot.invention?.plainSummary, undefined);

    const withOptional: ShareFieldKey[] = [
      ...defaultShareFieldSelection(),
      ...optionalShareFields(),
    ];
    const fullSnapshot = buildSharedSnapshot({
      record,
      selectedFields: withOptional,
    });
    assert.ok(fullSnapshot.invention?.title);
    assert.ok(fullSnapshot.invention?.plainSummary);
  });

  it("inventor edit after consent does not mutate stored snapshot", () => {
    const record = fixture();
    const snapshot = buildSharedSnapshot({
      record,
      selectedFields: normalizeSelectedShareFields([
        SHARE_FIELD_KEYS.INVENTION_PLAIN_SUMMARY,
        SHARE_FIELD_KEYS.READINESS_OVERALL_SCORE,
      ]),
    });
    const frozenScore = snapshot.readiness?.overallScore;
    const frozenSummary = snapshot.invention?.plainSummary;

    record.profile.ideaSummary = "COMPLETELY NEW SUMMARY AFTER CONSENT";
    record.answers.whatCreated = "Different invention entirely";

    const recomputed = buildSharedSnapshot({
      record,
      selectedFields: snapshot.sharedFieldKeys,
    });
    assert.notEqual(recomputed.invention?.plainSummary, frozenSummary);
    assert.equal(snapshot.invention?.plainSummary, frozenSummary);
    assert.equal(snapshot.readiness?.overallScore, frozenScore);
  });

  it("org API view never returns fields outside shared snapshot", () => {
    const record = fixture();
    const snapshot = buildSharedSnapshot({
      record,
      selectedFields: [SHARE_FIELD_KEYS.READINESS_OVERALL_SCORE],
    });
    snapshot.invention = {
      title: "SHOULD NOT LEAK",
      plainSummary: "SHOULD NOT LEAK",
    };

    const view = sanitizeReferralForOrgView(snapshot);
    assert.equal(view.invention?.title, undefined);
    assert.equal(view.invention?.plainSummary, undefined);
    assert.equal(view.readiness?.overallScore, snapshot.readiness?.overallScore);
    assert.equal(
      snapshotContainsForbiddenNarrative(
        view as unknown as Record<string, unknown>,
      ),
      false,
    );
  });
});

describe("registry vs organization access", () => {
  it("registry metadata does not grant org access by itself", () => {
    const partner = getPublicPartnerById("uri_innovations");
    assert.ok(partner);
    assert.equal(partner.id, "uri_innovations");
    assert.equal(
      memberCanAccessReferral("org-from-registry-guess", "org-real", "active"),
      false,
    );
  });

  it("public /partners directory still works independently", () => {
    const partners = getPublicDirectoryPartners();
    assert.ok(partners.length > 0);
    for (const id of ["uri_innovations", "ppl_ptrc"]) {
      assert.ok(getPublicPartnerById(id));
    }
    const filtered = filterPartners(
      partners.map((p) => {
        const { buildDestination: _bd, ...view } = p;
        void _bd;
        return view;
      }),
      { orgType: "library_ptrc" },
    );
    assert.ok(filtered.some((p) => p.id === "ppl_ptrc"));
    assert.ok(PARTNER_REGISTRY.uri_innovations);
  });
});

describe("partner-secret dashboard unchanged", () => {
  it("partner dashboard secret verification still works", () => {
    assert.equal(verifyPartnerSecretValue("secret-a", "secret-a"), true);
    assert.equal(verifyPartnerSecretValue("secret-a", "secret-b"), false);
    assert.equal(verifyPartnerSecretValue(null, "secret-a"), false);
  });
});

describe("organization metrics", () => {
  it("computes operational metrics without legal-success language fields", () => {
    const referrals: OrganizationReferralRecord[] = [
      {
        id: "r1",
        organizationId: "org-a",
        projectId: "p1",
        status: "received",
        sharedSnapshot: {
          sharedFieldKeys: [SHARE_FIELD_KEYS.READINESS_OVERALL_SCORE],
          readiness: { overallScore: 80 },
        },
        consentRecord: {
          organizationId: "org-a",
          projectId: "p1",
          sharedFieldKeys: [SHARE_FIELD_KEYS.READINESS_OVERALL_SCORE],
          sharedArtifactIds: [],
          consentAt: "2026-06-01T12:00:00.000Z",
          consentCopyVersion: "org_share_consent_v1",
          consentDisclaimerVersion: "org_share_disclaimer_v1",
        },
        referralReason: "University affiliation signal",
        registryPartnerId: "uri_innovations",
        recommendationId: "rec-1",
        firstStatusAt: null,
        createdAt: "2026-06-01T12:00:00.000Z",
        updatedAt: "2026-06-01T12:00:00.000Z",
      },
      {
        id: "r2",
        organizationId: "org-a",
        projectId: "p2",
        status: "completed",
        sharedSnapshot: {
          sharedFieldKeys: [SHARE_FIELD_KEYS.READINESS_OVERALL_SCORE],
          readiness: { overallScore: 60 },
        },
        consentRecord: {
          organizationId: "org-a",
          projectId: "p2",
          sharedFieldKeys: [SHARE_FIELD_KEYS.READINESS_OVERALL_SCORE],
          sharedArtifactIds: [],
          consentAt: "2026-06-02T12:00:00.000Z",
          consentCopyVersion: "org_share_consent_v1",
          consentDisclaimerVersion: "org_share_disclaimer_v1",
        },
        referralReason: null,
        registryPartnerId: null,
        recommendationId: null,
        firstStatusAt: "2026-06-02T18:00:00.000Z",
        createdAt: "2026-06-02T12:00:00.000Z",
        updatedAt: "2026-06-02T18:00:00.000Z",
      },
    ];

    const metrics = computeOrganizationMetrics(referrals);
    assert.equal(metrics.referralsReceived, 2);
    assert.equal(metrics.completedCount, 1);
    assert.equal(metrics.averageReadinessScore, 70);
    assert.equal(metrics.byStatus.completed, 1);
    assert.equal(metrics.byStatus.received, 1);
  });
});
