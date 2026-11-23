import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { createIntakeConsent } from "../consent";
import { DEMO_INVENTION } from "../demo";
import { generateProfile } from "../generateProfile";

/**
 * Behavioural test of createRecord against an in-memory Supabase double.
 * Every awaited query resolves through `respond`; inserts are logged.
 */
type Op = { table: string; op: string; row?: unknown };
let ops: Op[] = [];
let failTable: string | null = null;

function builder(table: string) {
  const state: Op = { table, op: "select" };
  const b: Record<string, unknown> = {};
  const chain = (name: string) => (arg?: unknown) => {
    if (name === "insert" || name === "upsert" || name === "update") {
      state.op = name;
      state.row = arg;
      ops.push({ ...state });
    }
    return b;
  };
  for (const name of ["select", "eq", "in", "is", "or", "order", "limit", "insert", "upsert", "update", "delete", "maybeSingle", "single"]) {
    b[name] = chain(name);
  }
  b.then = (resolve: (v: unknown) => void) => resolve(respond(state));
  return b;
}

function respond(state: Op) {
  if (state.op !== "select" && state.table === failTable) {
    return { data: null, error: { message: `${state.table} write failed` } };
  }
  if (state.table === "ventures") return { data: { id: "venture-1" }, error: null };
  if (state.table === "smartprobonoip_projects" && state.op === "insert") {
    return { data: { id: "project-1", created_at: "2026-11-23T20:00:00.000Z" }, error: null };
  }
  return { data: null, error: null };
}

beforeEach(() => {
  ops = [];
  failTable = null;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-only";
  (globalThis as Record<string, unknown>).__fakeSupabase = { from: (t: string) => builder(t) };
});

const base = () => ({
  answers: { ...DEMO_INVENTION, whatCreated: "Synthetic QA invention" },
  profile: generateProfile(DEMO_INVENTION),
  preClarity: 3,
  pilotSessionId: "session-qa-000000000001",
  isDemo: false,
});

test("consent is written to the project event log with the new record", async () => {
  const { createRecord } = await import("./records");
  const consent = createIntakeConsent(new Date("2026-11-23T19:59:00.000Z"));
  await createRecord({ ...base(), consent });
  const events = ops.filter((o) => o.table === "smartprobonoip_project_events");
  assert.equal(events.length, 1);
  const row = events[0].row as Record<string, unknown>;
  assert.equal(row.event_type, "idea_created");
  assert.equal(row.dedupe_key, "idea_created");
  assert.equal(row.project_id, "project-1");
  assert.deepEqual(row.metadata, { consent });
});

test("regression: a failed consent write fails record creation instead of being swallowed", async () => {
  const { createRecord } = await import("./records");
  failTable = "smartprobonoip_project_events";
  await assert.rejects(
    createRecord({ ...base(), consent: createIntakeConsent() }),
    /project_events write failed/,
  );
});

test("no consent row is written for records created without consent (demo)", async () => {
  const { createRecord } = await import("./records");
  await createRecord({ ...base(), isDemo: true, consent: null });
  assert.equal(ops.filter((o) => o.table === "smartprobonoip_project_events").length, 0);
});
