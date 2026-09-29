import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHECKS,
  EXPECTED_PASS_AFTER,
  MIGRATION_ORDER,
  checkShouldPass,
  evaluateResults,
  parseArgs,
} from "../../scripts/verify-production-schema";

describe("verify-production-schema", () => {
  it("maps cumulative PASS counts through 037", () => {
    assert.deepEqual(EXPECTED_PASS_AFTER["017"], 2);
    assert.deepEqual(EXPECTED_PASS_AFTER["018"], 4);
    assert.deepEqual(EXPECTED_PASS_AFTER["019"], 4);
    assert.deepEqual(EXPECTED_PASS_AFTER["020"], 5);
    assert.deepEqual(EXPECTED_PASS_AFTER["021"], 6);
    assert.deepEqual(EXPECTED_PASS_AFTER["022"], 7);
    assert.deepEqual(EXPECTED_PASS_AFTER["023"], 7);
    assert.deepEqual(EXPECTED_PASS_AFTER["024"], 8);
    assert.deepEqual(EXPECTED_PASS_AFTER["025"], 9);
    assert.deepEqual(EXPECTED_PASS_AFTER["026"], 10);
    assert.deepEqual(EXPECTED_PASS_AFTER["027"], 14);
    assert.deepEqual(EXPECTED_PASS_AFTER["028"], 16);
    assert.deepEqual(EXPECTED_PASS_AFTER["029"], 17);
    assert.deepEqual(EXPECTED_PASS_AFTER["030"], 18);
    assert.deepEqual(EXPECTED_PASS_AFTER["031"], 19);
    assert.deepEqual(EXPECTED_PASS_AFTER["032"], 20);
    assert.deepEqual(EXPECTED_PASS_AFTER["033"], 22);
    assert.deepEqual(EXPECTED_PASS_AFTER["034"], 23);
    assert.deepEqual(EXPECTED_PASS_AFTER["035"], 24);
    assert.deepEqual(EXPECTED_PASS_AFTER["036"], 25);
    assert.deepEqual(EXPECTED_PASS_AFTER["037"], 31);
    assert.equal(MIGRATION_ORDER.length, 21);
    assert.equal(CHECKS.length, 31);
  });

  it("parses --migration and --strict flags", () => {
    assert.deepEqual(parseArgs(["--migration", "018"]), {
      useCli: false,
      strict: false,
      atMigration: "018",
    });
    assert.deepEqual(parseArgs(["--strict", "--cli"]), {
      useCli: true,
      strict: true,
      atMigration: null,
    });
  });

  it("passes incremental gate when expected checks pass after 017", () => {
    const results = CHECKS.map((check) => ({
      check,
      pass: checkShouldPass(check, "017"),
    }));
    const evaluation = evaluateResults(results, {
      atMigration: "017",
      strict: false,
    });
    assert.equal(evaluation.passCount, 2);
    assert.equal(evaluation.exitCode, 0);
    assert.match(evaluation.summaryLine, /gate OK/);
  });

  it("fails incremental gate when a required check is missing after 018", () => {
    const results = CHECKS.map((check) => ({
      check,
      pass:
        check.id === "project_events_backfill"
          ? false
          : checkShouldPass(check, "018"),
    }));
    const evaluation = evaluateResults(results, {
      atMigration: "018",
      strict: false,
    });
    assert.equal(evaluation.exitCode, 1);
    assert.equal(evaluation.unexpectedFailures.length, 1);
    assert.equal(evaluation.unexpectedFailures[0]?.id, "project_events_backfill");
    assert.match(evaluation.summaryLine, /STOP/);
  });
});
