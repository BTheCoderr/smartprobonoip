import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("packet recovery card offers account sign-in that lands on the workspace claim flow", () => {
  const card = readFileSync("src/components/profile/PacketRecoveryCard.tsx", "utf8");
  assert.match(card, /data-testid="packet-save-account"/);
  assert.match(card, /\$\{ROUTES\.signIn\}\?next=\$\{encodeURIComponent\(ROUTES\.workspace\)\}/);
  // The workspace panel is what links this browser's packets to the account.
  const panel = readFileSync("src/components/dashboard/AccountWorkspacePanel.tsx", "utf8");
  assert.match(panel, /\/api\/account\/claim-session/);
});
