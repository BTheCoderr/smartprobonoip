# Learn → Prepare → Connect browser smoke test

Issue: https://github.com/BTheCoderr/smartprobonoip/issues/24

## Objective

Catch regressions in the actual browser path from education to explicitly consented demo intake, rule-based profile generation and professional export. A successful test does not establish legal accuracy, production uptime, live Supabase schema readiness, or real user conversion.

## Local run

Use Node 24 and a synthetic-only local environment with no production .env files.

\`\`\`bash
npm ci
npx playwright install chromium
npm run build
npm run test:smoke
\`\`\`

The Playwright runner starts a local production Next.js server on port 3210 automatically and uses a fresh browser context per test. No external service or database is required. The test intentionally asserts that the disclaimer blocks progression until both consents are checked.

## CI contract

\`.github/workflows/readiness-browser-smoke.yml\` runs on pull requests (and manually) with explicit empty Supabase and model credentials. Playwright launches Chromium and checks:

- Learn has the start CTA and navigates to the disclaimer.
- Both disclaimer consents are required.
- The fictional HydroSeal demo progresses through all five intake steps.
- Local \`/api/generate\` returns success and yields a browser-visible packet.
- The generated packet and public fictional sample expose the professional handoff dialog.
- Unacknowledged users cannot open regular intake.
- Outbound browser requests are blocked in the end-to-end demo test.

Reports and failure screenshots/traces may contain **fictional HydroSeal data only**. The workflow uploads failure artifacts with three-day retention. The smoke check is separate from the existing \`PR Build / verify\` and \`Agent PR Risk Map / risk-map\` required checks, so it can be observed before being made a release gate.

## Security and limitations

- Use only synthetic demo data; no real inventor or case records, authentication tokens, production keys, live database writes, customer emails or billing services.
- An actual \`@playwright/test\` dev dependency is pinned and its lockfile is managed by npm.
- The browser test is not a comprehensive accessibility/security audit or all-device QA.
- Keep branch merges and deployment under founder approval. Do not auto-merge on passing CI.
