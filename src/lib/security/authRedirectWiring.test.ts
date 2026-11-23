import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/** Guards against re-introducing a hand-rolled `next` check in the platform sign-in flow. */
const FILES = [
  "src/app/api/auth/callback/route.ts",
  "src/app/sign-in/PlatformLoginClient.tsx",
];

for (const file of FILES) {
  test(`${file} validates next with safeRelativeRedirect`, () => {
    const source = readFileSync(file, "utf8");
    assert.match(source, /from "@\/lib\/security\/safeRedirect"/);
    assert.match(source, /safeRelativeRedirect\(/);
    assert.doesNotMatch(source, /startsWith\("\/\/"\)/);
  });
}
