import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { getIdeaLabel } from "@/lib/packet";
import {
  isInventionStatus,
  selectableInventionStatuses,
} from "@/lib/ideas/status";
import {
  MAX_INVENTION_TITLE_LENGTH,
  normalizeInventionTitle,
  resolveInventionTitle,
} from "@/lib/ideas/title";
import { resolveInventionStatus, toInventionSummary } from "@/lib/ideas/summary";
import {
  findDocumentDescriptor,
  isDocumentFormat,
  isDocumentKind,
  isStoredDocument,
} from "@/lib/ideas/documents";
import {
  NEEDS_ATTENTION_THRESHOLD,
  buildPortfolioSummary,
  readinessBand,
} from "@/lib/portfolio/aggregate";
import { sortInventions } from "@/lib/portfolio/sort";
import { deriveTimelineEvents } from "@/lib/timeline/derive";
import { isTimelineEventType } from "@/lib/timeline/eventTypes";
import type { DocumentRecord, InventionSummary } from "@/lib/ideas/types";
import type { IntakeAnswers, ProjectRecord, ReadinessProfile } from "@/lib/types";

function baseAnswers(overrides: Partial<IntakeAnswers> = {}): IntakeAnswers {
  return {
    whatCreated: "A water bottle filter",
    problemSolved: "Dirty water on trails",
    whoFor: "Hikers",
    howItWorks: "Filter cartridge in the lid",
    mainParts: "Bottle, cartridge, mouthpiece",
    whatDifferent: "Inline sipping filter",
    itemType: "physical_product",
    hasPrototype: true,
    assets: ["drawings"],
    sharedChannels: ["friends"],
    hasBrandIdentity: false,
    goals: ["protection"],
    location: "Denver, CO",
    wantsProBono: false,
    preClarity: 2,
    ...overrides,
  };
}

function baseProfile(overrides: Partial<ReadinessProfile> = {}): ReadinessProfile {
  return {
    ideaSummary: "A portable filtering bottle for hikers.",
    signals: ["patent_invention"],
    completeInfo: ["What you created"],
    missingInfo: ["Development dates"],
    publicDisclosure: false,
    publicDisclosureNote: "",
    suggestedNextStep: "Talk to a patent professional.",
    expertQuestions: ["What prior art exists?"],
    recommendedResources: ["patent_agent_attorney"],
    disclaimer: "Preparation only — not legal advice.",
    generator: "rule",
    ...overrides,
  };
}

function baseRecord(overrides: Partial<ProjectRecord> = {}): ProjectRecord {
  return {
    id: "record-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    answers: baseAnswers(),
    profile: baseProfile(),
    preClarity: 2,
    postClarity: null,
    developmentTimeline: {},
    ...overrides,
  };
}

function summary(overrides: Partial<InventionSummary> = {}): InventionSummary {
  return {
    id: "a",
    title: "Invention A",
    status: "packet_generated",
    readinessScore: 70,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    lastActivityAt: "2026-01-01T00:00:00.000Z",
    isDemo: false,
    hasPacket: true,
    publicDisclosure: false,
    signalCount: 1,
    savedReferenceCount: 0,
    documentCount: 0,
    preClarity: 2,
    postClarity: null,
    ...overrides,
  };
}

describe("invention title compatibility", () => {
  it("keeps the label existing packets already display when no title is stored", () => {
    const answers = baseAnswers();
    assert.equal(resolveInventionTitle(answers), getIdeaLabel(answers));
  });

  it("prefers a stored title over the derived label", () => {
    const answers = baseAnswers({ inventionTitle: "From intake" });
    assert.equal(resolveInventionTitle(answers, "Stored title"), "Stored title");
    assert.equal(resolveInventionTitle(answers), "From intake");
  });

  it("collapses whitespace and caps stored titles", () => {
    assert.equal(normalizeInventionTitle("  spaced   out  "), "spaced out");
    assert.equal(normalizeInventionTitle("   "), null);
    assert.equal(normalizeInventionTitle(42), null);
    assert.equal(
      normalizeInventionTitle("x".repeat(500))?.length,
      MAX_INVENTION_TITLE_LENGTH,
    );
  });
});

describe("invention status contract", () => {
  it("only accepts values the database check constraint allows", () => {
    for (const status of selectableInventionStatuses()) {
      assert.equal(isInventionStatus(status), true);
    }
    assert.equal(isInventionStatus("deleted"), false);
    assert.equal(isInventionStatus("' or 1=1--"), false);
    assert.equal(isInventionStatus(undefined), false);
    assert.equal(isInventionStatus(null), false);
  });

  it("treats records stored before the workspace as having a generated packet", () => {
    assert.equal(resolveInventionStatus(baseRecord()), "packet_generated");
    assert.equal(
      resolveInventionStatus(baseRecord({ status: "archived" })),
      "archived",
    );
  });
});

describe("portfolio summary projection", () => {
  it("carries only the title, never the rest of the answers or the profile", () => {
    const record = baseRecord({
      answers: baseAnswers({
        howItWorks: "CONFIDENTIAL magnetic coupling mechanism",
        mainParts: "CONFIDENTIAL rare-earth magnet array",
        whatDifferent: "CONFIDENTIAL frictionless retention",
        ownershipNotes: "CONFIDENTIAL co-inventor dispute",
      }),
      profile: baseProfile({
        ideaSummary: "CONFIDENTIAL summary of the invention",
        expertQuestions: ["CONFIDENTIAL question"],
      }),
    });
    const projected = toInventionSummary({ record });
    const blob = JSON.stringify(projected);

    assert.equal("answers" in projected, false);
    assert.equal("profile" in projected, false);
    // The title is the one field derived from free text, because the inventor
    // needs it to tell their own inventions apart.
    assert.doesNotMatch(blob, /CONFIDENTIAL/);
    assert.doesNotMatch(blob, /Filter cartridge in the lid/);
  });

  it("reports readiness on the same 0-100 scale the packet shows", () => {
    const projected = toInventionSummary({ record: baseRecord() });
    assert.ok(projected.readinessScore >= 0 && projected.readinessScore <= 100);
  });

  it("uses the newest of update and event time as last activity", () => {
    const projected = toInventionSummary({
      record: baseRecord(),
      lastEventAt: "2026-03-01T00:00:00.000Z",
    });
    assert.equal(projected.lastActivityAt, "2026-03-01T00:00:00.000Z");

    const noEvents = toInventionSummary({ record: baseRecord() });
    assert.equal(noEvents.lastActivityAt, "2026-01-02T00:00:00.000Z");
  });
});

describe("portfolio aggregation", () => {
  it("excludes archived inventions from the average readiness", () => {
    const result = buildPortfolioSummary([
      summary({ id: "a", readinessScore: 80 }),
      summary({ id: "b", readinessScore: 60 }),
      summary({ id: "c", readinessScore: 0, status: "archived" }),
    ]);

    assert.equal(result.total, 3);
    assert.equal(result.active, 2);
    assert.equal(result.archived, 1);
    assert.equal(result.averageReadiness, 70);
    assert.equal(result.strongest?.id, "a");
  });

  it("surfaces the weakest active inventions below the threshold, worst first", () => {
    const result = buildPortfolioSummary([
      summary({ id: "high", readinessScore: 90 }),
      summary({ id: "mid", readinessScore: NEEDS_ATTENTION_THRESHOLD }),
      summary({ id: "low", readinessScore: 30 }),
      summary({ id: "lowest", readinessScore: 10 }),
    ]);

    assert.deepEqual(
      result.needsAttention.map((i) => i.id),
      ["lowest", "low"],
    );
  });

  it("handles an empty portfolio without dividing by zero", () => {
    const result = buildPortfolioSummary([]);
    assert.equal(result.total, 0);
    assert.equal(result.averageReadiness, null);
    assert.equal(result.strongest, null);
    assert.equal(result.lastActivityAt, null);
  });

  it("bands readiness at the same thresholds the packet review uses", () => {
    assert.equal(readinessBand(80).label, "Well organized");
    assert.equal(readinessBand(55).label, "Solid base");
    assert.equal(readinessBand(54).label, "Needs attention");
  });
});

describe("portfolio sorting", () => {
  const inventions = [
    summary({
      id: "old",
      title: "Zebra",
      readinessScore: 20,
      createdAt: "2026-01-01T00:00:00.000Z",
      lastActivityAt: "2026-01-01T00:00:00.000Z",
      status: "archived",
    }),
    summary({
      id: "new",
      title: "Apple",
      readinessScore: 90,
      createdAt: "2026-05-01T00:00:00.000Z",
      lastActivityAt: "2026-05-01T00:00:00.000Z",
      status: "created",
    }),
  ];

  it("does not mutate the input array", () => {
    const input = [...inventions];
    sortInventions(input, "readiness");
    assert.deepEqual(
      input.map((i) => i.id),
      inventions.map((i) => i.id),
    );
  });

  it("orders by each supported mode", () => {
    assert.equal(sortInventions(inventions, "recent")[0].id, "new");
    assert.equal(sortInventions(inventions, "created")[0].id, "new");
    assert.equal(sortInventions(inventions, "readiness")[0].id, "new");
    assert.equal(sortInventions(inventions, "title")[0].title, "Apple");
    assert.equal(sortInventions(inventions, "status")[0].id, "new");
  });
});

describe("timeline derivation", () => {
  it("only emits milestones the record actually contains", () => {
    const bare = baseRecord({
      answers: baseAnswers({ hasPrototype: false, assets: [] }),
      profile: baseProfile({ ideaSummary: "" }),
    });
    const types = deriveTimelineEvents(bare).map((event) => event.type);

    assert.deepEqual(types, ["idea_created"]);
    assert.equal(types.includes("materials_recorded"), false);
    assert.equal(types.includes("packet_generated"), false);
    assert.equal(types.includes("timeline_updated"), false);
  });

  it("adds milestones as the record gains real data", () => {
    const full = baseRecord({
      postClarity: 4,
      developmentTimeline: { "Date idea started": "March 2025" },
    });
    const types = deriveTimelineEvents(full).map((event) => event.type);

    for (const expected of [
      "idea_created",
      "materials_recorded",
      "packet_generated",
      "timeline_updated",
      "clarity_recorded",
    ]) {
      assert.ok(types.includes(expected as (typeof types)[number]), expected);
    }
  });

  it("is deterministic and newest first", () => {
    const record = baseRecord({
      developmentTimeline: { "Date idea started": "March 2025" },
    });
    const first = deriveTimelineEvents(record);
    const second = deriveTimelineEvents(record);

    assert.deepEqual(first, second);
    for (let i = 1; i < first.length; i += 1) {
      assert.ok(
        Date.parse(first[i - 1].occurredAt) >= Date.parse(first[i].occurredAt),
      );
    }
  });

  it("emits no free text from the invention into event details", () => {
    const record = baseRecord({
      answers: baseAnswers({ whatCreated: "CONFIDENTIAL shelving" }),
    });
    const blob = JSON.stringify(deriveTimelineEvents(record));
    assert.doesNotMatch(blob, /CONFIDENTIAL/);
  });
});

describe("timeline event types", () => {
  it("recognizes only known server-authored milestones", () => {
    assert.equal(isTimelineEventType("idea_created"), true);
    assert.equal(isTimelineEventType("document_generated"), true);
    assert.equal(isTimelineEventType("not_a_real_event"), false);
    assert.equal(isTimelineEventType(""), false);
    assert.equal(isTimelineEventType(null), false);
  });
});

describe("document model", () => {
  it("accepts only known kind/format pairs", () => {
    assert.ok(findDocumentDescriptor("readiness_packet", "pdf"));
    assert.ok(findDocumentDescriptor("attorney_export", "json"));
    assert.ok(findDocumentDescriptor("attorney_export", "csv"));
    assert.ok(findDocumentDescriptor("intake_summary", "md"));
    assert.equal(findDocumentDescriptor("readiness_packet", "json"), null);
    assert.equal(findDocumentDescriptor("../../etc/passwd", "pdf"), null);
    assert.equal(isDocumentKind("toString"), false);
    assert.equal(isDocumentFormat("exe"), false);
  });

  it("treats null storageUrl as regenerate-on-download, not a stored file", () => {
    const generated: DocumentRecord = {
      id: "doc-1",
      inventionId: "record-1",
      title: "IP Readiness Packet",
      kind: "readiness_packet",
      format: "pdf",
      origin: "generated",
      createdAt: "2026-01-01T00:00:00.000Z",
      storageUrl: null,
    };
    assert.equal(isStoredDocument(generated), false);
    assert.equal(
      isStoredDocument({
        ...generated,
        storageUrl: "https://example.supabase.co/object/doc.pdf",
      }),
      true,
    );
  });
});

describe("local store portfolio behaviour", () => {
  beforeEach(() => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
      removeItem: (key: string) => void data.delete(key),
    };
    (globalThis as { window?: unknown }).window = { localStorage: storage };
  });

  it("lists saved inventions and records generated documents", async () => {
    const { localStore } = await import("@/lib/store/local");

    const record = await localStore.saveRecord({
      answers: baseAnswers(),
      profile: baseProfile(),
      preClarity: 2,
    });

    const before = await localStore.getPortfolio();
    assert.equal(before.inventions.length, 1);
    assert.equal(before.summary.total, 1);
    assert.equal(before.inventions[0].documentCount, 0);
    assert.equal(before.recentDocuments.length, 0);

    await localStore.recordDocumentGenerated(record.id, {
      kind: "readiness_packet",
      format: "pdf",
    });

    const after = await localStore.getPortfolio();
    assert.equal(after.inventions[0].documentCount, 1);
    assert.equal(after.recentDocuments.length, 1);
    assert.equal(after.recentDocuments[0].inventionId, record.id);
    assert.equal(after.recentDocuments[0].kind, "readiness_packet");
    assert.equal(after.recentDocuments[0].format, "pdf");
    assert.equal(after.recentDocuments[0].storageUrl, null);
    assert.equal(after.recentDocuments[0].title, "IP Readiness Packet");
  });

  it("keeps demo records out of the portfolio", async () => {
    const { localStore } = await import("@/lib/store/local");

    await localStore.saveRecord({
      answers: baseAnswers(),
      profile: baseProfile(),
      preClarity: 2,
      isDemo: true,
    });

    const snapshot = await localStore.getPortfolio();
    assert.equal(snapshot.inventions.length, 0);
  });

  it("applies status and title updates without losing the packet", async () => {
    const { localStore } = await import("@/lib/store/local");

    const record = await localStore.saveRecord({
      answers: baseAnswers(),
      profile: baseProfile(),
      preClarity: 2,
    });

    await localStore.updateInvention(record.id, {
      title: "Trail filter bottle",
      status: "researching",
    });

    const reloaded = await localStore.getRecord(record.id);
    assert.equal(reloaded?.title, "Trail filter bottle");
    assert.equal(reloaded?.status, "researching");
    assert.equal(reloaded?.profile.ideaSummary, baseProfile().ideaSummary);

    const snapshot = await localStore.getPortfolio();
    assert.equal(snapshot.inventions[0].title, "Trail filter bottle");
    assert.equal(snapshot.inventions[0].status, "researching");
  });
});
