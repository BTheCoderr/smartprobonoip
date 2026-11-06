# Private pilot dashboard owner access — release checklist

Issue: https://github.com/BTheCoderr/smartprobonoip/issues/33

Current system: a partner-only Supabase dashboard; the historical shared-secret login cannot work if PARTNER_DASHBOARD_SECRET is unset.

## Proposed code behavior

- Owner signs in through the existing Supabase email magic-link account.
- The server uses Supabase auth.getUser() to validate signed-in session cookies, checks confirmed email, and compares it exactly to the server-only PLATFORM_ADMIN_EMAIL allowlist.
- All six partner-reporting/lead/CSV endpoints share this policy. Existing partner-secret fallback only works when PARTNER_DASHBOARD_SECRET is explicitly configured.
- No admin authority based on client-provided headers, unverified email, local storage, or user_metadata.
- A partner user or ordinary account is **not** a global admin.
- The dashboard must try cookie access before prompting for legacy credentials.
- No new database tables, schema migrations, stored inventions, third-party trackers, or paid features.

## Critical launch gates

- [ ] Configure PLATFORM_ADMIN_EMAIL securely in Netlify for **production**; never NEXT_PUBLIC_.
- [ ] Review the existing SUPABASE_SERVICE_ROLE_KEY Netlify environment variable: it was not marked secret during an audit on Nov 6. Mark a rotated replacement as a Netlify **Secret** and revoke the old key via an approved rotation plan. Never disclose either value in logs, browser bundles, GitHub issues, or screenshots.
- [ ] Ensure Netlify functions runtime has proper service credentials and Supabase auth / magic-link redirect URLs.
- [ ] Verify unauthorized GET /api/partner/analytics /metrics /feedback /export.csv /leads /leads/export.csv return 401 in an appropriately configured preview.
- [ ] Test positive owner session in staging using explicitly authorized account; make sure a non-admin account receives 401. Don't infer from tests alone that production credentials are correct.
- [ ] Check server responses are no-store and do not return private records to public visitors.
- [ ] Review Netlify preview and source diff, approve merge. After deploy, log in at /sign-in?next=/dashboard and inspect live scorecard.
- [ ] Do not publish counts as unique inventors until identity/dedup and event coverage are verified.

No deploy/production change in this branch is automatically permission to modify real accounts or handle private invention content.
