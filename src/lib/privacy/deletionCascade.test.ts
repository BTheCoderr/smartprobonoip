import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CASCADE_DELETED_TABLES,
  CascadeDeletionModel,
  PROJECT_CHILD_TABLES,
  PROJECT_EVENTS_TABLE,
  isCascadeDeletedWithProject,
} from "@/lib/privacy/deletionCascade";

const EVENTS_MIGRATION = readFileSync(
  join(process.cwd(), "supabase/migrations/018_project_events.sql"),
  "utf8",
);
const DOCUMENTS_MIGRATION = readFileSync(
  join(process.cwd(), "supabase/migrations/020_invention_documents.sql"),
  "utf8",
);
const OPS_RUNBOOK = readFileSync(
  join(process.cwd(), "supabase/ops/pilot_data_deletion.sql"),
  "utf8",
);
const DELETION_MODULE = readFileSync(
  join(process.cwd(), "src/lib/db/deletion.ts"),
  "utf8",
);

describe("project deletion cascade inventory", () => {
  it("lists project_events as cascade-deleted with the invention", () => {
    assert.equal(isCascadeDeletedWithProject(PROJECT_EVENTS_TABLE), true);
    assert.ok(CASCADE_DELETED_TABLES.includes(PROJECT_EVENTS_TABLE));
    const entry = PROJECT_CHILD_TABLES.find(
      (row) => row.table === PROJECT_EVENTS_TABLE,
    );
    assert.equal(entry?.onDelete, "cascade");
  });

  it("keeps analytics on set_null so telemetry is not a second timeline store", () => {
    const analytics = PROJECT_CHILD_TABLES.find(
      (row) => row.table === "smartprobonoip_analytics_events",
    );
    assert.equal(analytics?.onDelete, "set_null");
    assert.equal(
      isCascadeDeletedWithProject("smartprobonoip_analytics_events"),
      false,
    );
  });
});

describe("FK cascade on project_events", () => {
  it("declares ON DELETE CASCADE from projects in migration 018", () => {
    assert.match(
      EVENTS_MIGRATION,
      /project_id uuid not null references public\.smartprobonoip_projects\(id\) on delete cascade/,
    );
  });

  it("declares ON DELETE CASCADE for documents in migration 020", () => {
    assert.match(
      DOCUMENTS_MIGRATION,
      /project_id uuid not null references public\.smartprobonoip_projects\(id\) on delete cascade/,
    );
  });

  it("declares ON DELETE CASCADE for organization referrals in migration 025", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/025_organization_referrals.sql"),
      "utf8",
    );
    assert.match(
      migration,
      /project_id\s+uuid not null references public\.smartprobonoip_projects\(id\) on delete cascade/,
    );
  });
});

describe("single deletion path", () => {
  it("deletes only through smartprobonoip_projects in the app module", () => {
    assert.match(DELETION_MODULE, /\.from\("smartprobonoip_projects"\)/);
    assert.match(DELETION_MODULE, /\.delete\(\)/);
    // Must never open a second delete path against the events table.
    assert.equal(DELETION_MODULE.includes('.delete()'), true);
    const deleteBlocks = DELETION_MODULE.split(".delete()");
    // Every delete() must be preceded (in its statement) by the projects table.
    for (let i = 0; i < deleteBlocks.length - 1; i += 1) {
      assert.match(
        deleteBlocks[i],
        /from\("smartprobonoip_projects"\)/,
        "delete() must target smartprobonoip_projects only",
      );
    }
    assert.equal(
      DELETION_MODULE.includes('.from("smartprobonoip_project_events")'),
      false,
    );
  });

  it("ops runbook deletes projects only and verifies orphan events", () => {
    assert.match(
      OPS_RUNBOOK,
      /DELETE FROM public\.smartprobonoip_projects/i,
    );
    assert.doesNotMatch(
      OPS_RUNBOOK,
      /DELETE FROM public\.smartprobonoip_project_events/i,
    );
    assert.match(OPS_RUNBOOK, /orphan_project_events/);
    assert.match(OPS_RUNBOOK, /ON DELETE CASCADE/i);
  });
});

describe("no event survives invention deletion", () => {
  it("removes every event when its project is deleted", () => {
    const model = new CascadeDeletionModel();
    model.addProject("p1", "session-a");
    model.addEvent("e1", "p1", "session-a");
    model.addEvent("e2", "p1", "session-a");
    model.addEvent("e3", "p1", null);

    assert.equal(model.eventCountForProject("p1"), 3);
    const removed = model.deleteProject("p1");

    assert.equal(removed, 3);
    assert.equal(model.eventCountForProject("p1"), 0);
    assert.equal(model.totalEvents(), 0);
    assert.equal(model.orphanEventCount(), 0);
  });

  it("leaves other inventions' events untouched", () => {
    const model = new CascadeDeletionModel();
    model.addProject("keep", "session-a");
    model.addProject("drop", "session-a");
    model.addEvent("keep-e", "keep", "session-a");
    model.addEvent("drop-e", "drop", "session-a");

    model.deleteProject("drop");

    assert.equal(model.eventCountForProject("drop"), 0);
    assert.equal(model.eventCountForProject("keep"), 1);
    assert.equal(model.totalEvents(), 1);
    assert.equal(model.orphanEventCount(), 0);
  });
});

describe("session-level deletion removes related project events", () => {
  it("deletes every event for every project owned by the session", () => {
    const model = new CascadeDeletionModel();
    model.addProject("a", "session-1");
    model.addProject("b", "session-1");
    model.addProject("c", "session-2");
    model.addEvent("a1", "a", "session-1");
    model.addEvent("b1", "b", "session-1");
    model.addEvent("c1", "c", "session-2");

    const result = model.deleteSession("session-1");

    assert.equal(result.projects, 2);
    assert.equal(result.events, 2);
    assert.equal(model.totalProjects(), 1);
    assert.equal(model.totalEvents(), 1);
    assert.equal(model.eventCountForProject("c"), 1);
    assert.equal(model.orphanEventCount(), 0);
  });

  it("still removes events when the denormalized session id is stale after recovery", () => {
    const model = new CascadeDeletionModel();
    // Project now owned by session-new; event still stamped with session-old.
    model.addProject("p1", "session-new");
    model.addEvent("e1", "p1", "session-old");

    // Wrong path: filtering events by session-old would miss nothing to delete
    // on the project, but the correct path deletes by current project ownership.
    const wrongSession = model.deleteSession("session-old");
    assert.equal(wrongSession.projects, 0);
    assert.equal(model.totalEvents(), 1);

    const rightSession = model.deleteSession("session-new");
    assert.equal(rightSession.projects, 1);
    assert.equal(rightSession.events, 1);
    assert.equal(model.totalEvents(), 0);
    assert.equal(model.orphanEventCount(), 0);
  });
});
