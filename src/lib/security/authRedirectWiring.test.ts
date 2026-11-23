import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
for (const file of ["src/app/api/auth/callback/route.ts", "src/app/sign-in/PlatformLoginClient.tsx"]) {
  test(`${file} validates next with safeRelativeRedirect`, () => {
    const source = readFileSync(file, "utf8");
    assert.match(source, /from "@\/lib\/security\/safeRedirect"/);
    assert.match(source, /safeRelativeRedirect\(/);
  });
}
