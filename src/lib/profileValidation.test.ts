import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DEMO_INVENTION, DEMO_RECORDS } from "./demo";
import { DISCLAIMER } from "./disclaimer";
import { generateProfile } from "./generateProfile";
import { validateClientProfile } from "./profileValidation";

test("generator output and demo packets pass validation unchanged (except canonical disclaimer)", () => {
  const profiles = [generateProfile(DEMO_INVENTION), ...DEMO_RECORDS.map((r) => r.profile)];
  for (const profile of profiles) {
    const result = validateClientProfile(JSON.parse(JSON.stringify(profile)), { generated: true });
    assert.ok(result.ok, JSON.stringify(result));
    assert.deepEqual(result.profile, { ...profile, disclaimer: DISCLAIMER });
  }
});

test("regression: client cannot store legal conclusions that skipped the generator filter", () => {
  const tampered = { ...generateProfile(DEMO_INVENTION), suggestedNextStep: "Your idea is patentable, you should file now." };
  const result = validateClientProfile(tampered, { generated: true });
  assert.equal(result.ok, false);
});

test("client cannot drop or replace the disclaimer, or inject unknown signals/resources", () => {
  const base = generateProfile(DEMO_INVENTION);
  const result = validateClientProfile(
    { ...base, disclaimer: "", signals: [...base.signals, "guaranteed_patent"], recommendedResources: ["ptrc", "<script>"], generator: "hacked" },
    { generated: true },
  );
  assert.ok(result.ok);
  assert.equal(result.profile.disclaimer, DISCLAIMER);
  assert.ok(!result.profile.signals.includes("guaranteed_patent" as never));
  assert.deepEqual(result.profile.recommendedResources, ["ptrc"]);
  assert.equal(result.profile.generator, "rule");
});

test("rejects malformed or oversized profiles", () => {
  const base = generateProfile(DEMO_INVENTION);
  for (const bad of [null, "x", { ...base, ideaSummary: 42 }, { ...base, missingInfo: "a" }, { ...base, expertQuestions: new Array(41).fill("q") }, { ...base, ideaSummary: "x".repeat(7000) }]) {
    assert.equal(validateClientProfile(bad, { generated: true }).ok, false);
  }
});

test("inventor edits keep their own wording (shape checks only)", () => {
  const edited = { ...generateProfile(DEMO_INVENTION), ideaSummary: "I think this is patentable but need an expert." };
  assert.equal(validateClientProfile(edited, { generated: false }).ok, true);
});

test("record routes validate profiles before writing", () => {
  const create = readFileSync("src/app/api/records/route.ts", "utf8");
  assert.match(create, /validateClientProfile\(body\.profile, \{ generated: true \}\)/);
  assert.match(create, /profile: checkedProfile\.profile/);
  const update = readFileSync("src/app/api/records/[id]/route.ts", "utf8");
  assert.match(update, /validateClientProfile\(body\.profile, \{ generated: true \}\)/);
  assert.match(update, /validateClientProfile\(body\.profile, \{ generated: false \}\)/);
});
