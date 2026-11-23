/**
 * Synthetic Learn -> Prepare -> Connect journey, end to end through the
 * real domain code (no network, no production data). Supabase is an
 * in-memory double; every value is fictional and marked QA-SYNTHETIC.
 */
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import "./testing/serverModuleStubs";
import { buildAttorneyExportCsv, buildAttorneyExportPacket } from "./attorneyExport";
import { createIntakeConsent, parseIntakeConsent } from "./consent";
import { DEMO_INVENTION } from "./demo";
import { DISCLAIMER } from "./disclaimer";
import { generateProfile } from "./generateProfile";
import { WIZARD_STEPS, validateWizardStep } from "./intake/wizardConfig";
import { validateForGeneration } from "./intakeValidation";
import { validateClientProfile } from "./profileValidation";
import { containsForbiddenLanguage } from "./safety";
import type { IntakeAnswers, ProjectRecord } from "./types";

const SYNTHETIC: IntakeAnswers = {
  ...DEMO_INVENTION,
  whatCreated:
    "QA-SYNTHETIC SeedDock — a stackable seedling tray with a magnetic water channel that keeps each cell evenly moist.",
  problemSolved: "Home growers over- or under-water seedlings because trays drain unevenly.",
  whoFor: "Home gardeners and small urban farms starting seeds indoors.",
  howItWorks:
    "A shallow magnetic channel under the tray holds water and wicks it into each cell through felt plugs; trays click together to share one reservoir.",
  mainParts: "Tray body, felt wicking plugs, magnetic channel insert, reservoir cap.",
  whatDifferent: "Shared magnetic reservoir across stacked trays instead of a separate bottom-watering basin per tray.",
  brandName: "SeedDock",
  inventionTitle: "QA-SYNTHETIC SeedDock wicking tray",
  location: "Providence, RI, USA",
};

let inserts: { table: string; row: unknown }[] = [];
function fakeSupabase() {
  const builder = (table: string) => {
    let op = "select";
    const b: Record<string, unknown> = {};
    for (const name of ["select", "eq", "in", "is", "or", "order", "limit", "delete", "maybeSingle", "single"]) {
      b[name] = () => b;
    }
    for (const name of ["insert", "upsert", "update"]) {
      b[name] = (row: unknown) => {
        op = name;
        inserts.push({ table, row });
        return b;
      };
    }
    b.then = (resolve: (v: unknown) => void) => {
      if (table === "ventures") return resolve({ data: { id: "venture-qa" }, error: null });
      if (table === "smartprobonoip_projects" && op === "insert") {
        return resolve({ data: { id: "project-qa", created_at: "2026-11-23T21:00:00.000Z" }, error: null });
      }
      return resolve({ data: null, error: null });
    };
    return b;
  };
  return { from: builder };
}

beforeEach(() => {
  inserts = [];
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://qa.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "qa-only";
  (globalThis as Record<string, unknown>).__fakeSupabase = fakeSupabase();
});

test("Prepare: every wizard step accepts a complete synthetic intake", () => {
  for (let step = 0; step < WIZARD_STEPS.length; step += 1) {
    assert.equal(validateWizardStep(step, SYNTHETIC), null, WIZARD_STEPS[step].label);
  }
  assert.deepEqual(validateForGeneration(SYNTHETIC), []);
});

test("Prepare -> packet: generated profile is safe and survives server validation", () => {
  const profile = generateProfile(SYNTHETIC);
  assert.equal(profile.disclaimer, DISCLAIMER);
  assert.equal(containsForbiddenLanguage(JSON.stringify(profile)), false);
  const checked = validateClientProfile(JSON.parse(JSON.stringify(profile)), { generated: true });
  assert.ok(checked.ok);
});

test("Consent -> record: new packet persists answers, profile and the consent audit row", async () => {
  const { createRecord } = await import("./db/records");
  const consent = createIntakeConsent();
  assert.ok(parseIntakeConsent(JSON.parse(JSON.stringify(consent))));
  const profile = generateProfile(SYNTHETIC);
  const record = await createRecord({
    answers: SYNTHETIC,
    profile,
    preClarity: 2,
    pilotSessionId: "session-qa-synthetic-0001",
    isDemo: false,
    consent,
  });
  assert.equal(record.id, "project-qa");
  const tables = inserts.map((i) => i.table);
  for (const t of ["smartprobonoip_projects", "smartprobonoip_answers", "smartprobonoip_profiles", "smartprobonoip_project_events"]) {
    assert.ok(tables.includes(t), t);
  }
  const consentRow = inserts.find((i) => i.table === "smartprobonoip_project_events")?.row as { metadata: unknown };
  assert.deepEqual(consentRow.metadata, { consent });
});

test("Connect: professional export carries the disclaimer and no legal conclusions", () => {
  const profile = generateProfile(SYNTHETIC);
  const record: ProjectRecord = {
    id: "project-qa",
    createdAt: "2026-11-23T21:00:00.000Z",
    answers: SYNTHETIC,
    profile,
    preClarity: 2,
    postClarity: null,
    isDemo: false,
  };
  const packet = buildAttorneyExportPacket(record, [], "QA reviewer");
  const json = JSON.stringify(packet);
  assert.match(json, /not legal advice/i);
  assert.equal(containsForbiddenLanguage(json), false);
  const csv = buildAttorneyExportCsv(packet);
  assert.ok(csv.split("\n").length > 1);
  assert.ok(!json.includes("session-qa-synthetic-0001"), "pilot session id must not leak into exports");
});
