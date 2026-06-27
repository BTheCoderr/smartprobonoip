# SmartProBonoIP — Launch to 100% Plan

This plan defines what it means for SmartProBonoIP to be 100% demo-ready and 100% pilot-ready for testing with real inventors, creators, founders, and partner organizations.

## North Star

SmartProBonoIP proves one workflow:

**messy idea → guided intake → IP Readiness Profile → suggested next resource → measurable clarity improvement**

SmartProBonoIP does not provide legal advice, does not replace patent agents, attorneys, clinics, or nonprofits, and does not make legal conclusions. It helps users organize information before reaching experts.

---

## Verification status (automated)

Last verified locally:

- `npm run build` passes (13 routes compile)
- `npx tsc --noEmit` passes
- `npx eslint .` passes (no errors/warnings)
- Demo smoke test passes: all public routes return 200, `/api/generate` returns a safe rule-based profile with disclaimer, and unconfigured pilot/partner routes degrade gracefully (503/401)
- Service-role key is restricted to the server via `server-only` import guards

The remaining unchecked boxes below require manual Supabase/Netlify setup (live pilot path) and human spot-checks.

---

## 100% Demo-Ready Definition

Demo-ready means the app can be shown live to class, advisors, Scott, Emily, RIHub, AS220, URI, SEG, libraries, or funders without needing Supabase, OpenAI, or real user data.

### Demo-ready requirements

- [ ] Production URL loads: `/`
- [ ] Product landing loads: `/smartprobonoip`
- [ ] Demo intake loads: `/smartprobonoip/disclaimer?demo=1`
- [ ] Disclaimer gate requires acknowledgement before intake
- [ ] Demo flow works: disclaimer → intake → profile → PDF
- [ ] Demo invention is clearly marked as demo data
- [ ] Rule-based generation works with no environment variables
- [ ] Profile page shows safe language only
- [ ] PDF export works from profile page
- [ ] Dashboard opens at `/smartprobonoip/dashboard?demo=1`
- [ ] Dashboard can show demo data
- [ ] Privacy page loads and is linked from footer/navigation
- [ ] No broken buttons, 404s, or obvious placeholder copy
- [ ] No legal conclusion language appears, including: “you need a patent,” “your idea is patentable,” or “you should file”

### Demo smoke test

1. Open production URL.
2. Click **Try demo intake**.
3. Acknowledge disclaimer.
4. Review pre-filled demo answers.
5. Generate profile (presented as the **IP Readiness Packet**).
6. Click **Download IP Readiness Packet** and confirm the PDF downloads.
7. Rate post-clarity.
8. Open dashboard with demo data.
9. Confirm metrics look presentable.

### IP Readiness Packet smoke test

1. From a generated profile, confirm the page is titled **Your IP Readiness Packet**.
2. Confirm the on-screen packet includes the readiness snapshot and the 30/60/90 day follow-up plan.
3. Click **Download IP Readiness Packet**.
4. Open the PDF and confirm all sections are present: cover page, plain-language summary, readiness snapshot, missing-info checklist, public-sharing/disclosure note, expert conversation prep, suggested next resources, 30/60/90 day plan, and full disclaimer.
5. Confirm the cover page shows the idea label, the date, and "Educational readiness tool. Not legal advice."
6. Confirm no forbidden legal-advice language appears anywhere in the packet.

### Patent Prep Mode smoke test

1. From a generated packet, scroll to the **Patent Prep Mode** section.
2. Confirm the patent prep checklist reflects the intake answers (checked vs. to-gather).
3. Confirm the development timeline shows fillable date placeholders.
4. Confirm the possible difference map renders with its "user-described differences only" note.
5. Confirm the drawings and materials checklist marks available materials.
6. Confirm the expert handoff summary appears as the final prep section before the disclaimer.
7. Download the packet PDF and confirm all five Patent Prep Mode sections are present and use safe framing only.

### AI Packet Coach smoke test

1. From a generated packet (view mode), scroll to the **AI Packet Coach** section.
2. Click each quick-action button and confirm a packet-specific prep response appears.
3. Type a custom prep question and confirm a response appears.
4. With no `OPENAI_API_KEY`, confirm responses are tagged "Prep guide" (rule-based fallback).
5. With `OPENAI_API_KEY` set, confirm responses are tagged "AI-assisted".
6. Confirm no response contains legal-advice language or legal conclusions.
7. Refresh the page and confirm the coach conversation resets (stateless MVP).

### Similar Patent Discovery Prep smoke test

1. From a generated packet, scroll to **Similar Patent Discovery Prep** (after Patent Prep Mode).
2. Confirm search keywords reflect the user's intake answers.
3. Confirm 3–5 suggested search queries appear.
4. Confirm Google Patents and USPTO Patent Public Search links open (with suggested query text).
5. Confirm the similar reference worksheet table is present.
6. Confirm expert prep questions use safe framing only.
7. Download the PDF and confirm the section appears with keywords, queries, links, worksheet, and disclaimer.
8. In AI Packet Coach, click the 5 patent search prep quick actions and confirm helpful responses.

### Demo-ready score

The demo is 100% ready when a person can complete the above flow in under 5 minutes with no help.

---

## 100% Pilot-Ready Definition

Pilot-ready means the app can safely collect and store real submissions from 10–25 users and let a partner/admin review aggregated data.

### Pilot-ready requirements

- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npx eslint .` passes with no blocking errors
- [ ] Supabase project created
- [ ] `supabase/umbrella_schema.sql` applied (or `migrations/003_umbrella_platform_schema.sql`)
- [ ] `ventures` table seeded with `smartprobonoip` active
- [ ] Netlify/Vercel environment variables set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `PARTNER_DASHBOARD_SECRET`
  - [ ] `NEXT_PUBLIC_APP_URL`
- [ ] Service role key is server-only and not exposed as `NEXT_PUBLIC_*`
- [ ] Real intake saves to Supabase through `/api/records`
- [ ] A second browser/device cannot access another user’s profile without the profile/session path being available
- [ ] Partner dashboard unlocks live data only with `PARTNER_DASHBOARD_SECRET`
- [ ] CSV export works from dashboard
- [ ] Demo data is separated from live pilot reporting
- [ ] Pre-clarity and post-clarity scores save correctly
- [ ] Dashboard filters work for signals, referral/resource type, disclosure risk, and clarity improvement
- [ ] Follow-up placeholders are visible for 30/60/90-day tracking
- [ ] Privacy/export/deletion language is present
- [ ] Supabase security advisors show no critical issues before live pilot

### Pilot smoke test

1. Open production URL in normal browser.
2. Complete one real fake/test intake, not demo mode.
3. Generate profile.
4. Save post-clarity score.
5. Confirm project, answers, profile, and impact metric rows exist in Supabase.
6. Open dashboard.
7. Enter partner secret.
8. Confirm the live test record appears.
9. Export CSV.
10. Open production URL in incognito or a second browser and confirm data isolation behavior.

### Pilot-ready score

The pilot is 100% ready when 3 internal testers can complete the real intake from different devices and their submissions appear correctly in the partner dashboard without leaking across browsers.

---

## Recommended Launch Sequence

### Stage 1 — Demo lock

Goal: Make the public demo clean enough to show immediately.

- Verify all public routes load.
- Run demo smoke test.
- Fix broken copy, broken links, or PDF issues.
- Remove any placeholder language.

### Stage 2 — Supabase pilot setup

Goal: Move from localStorage/demo mode to real pilot persistence.

- Create Supabase project.
- Run schema.
- Run RLS migration.
- Add Netlify/Vercel environment variables.
- Redeploy production site.

### Stage 3 — Safety and privacy check

Goal: Reduce legal and data-risk before real users.

- Confirm disclaimer appears at product page, intake gate, profile page, and PDF.
- Confirm two consent checkboxes appear before intake.
- Spot-check generated profiles for forbidden legal conclusion language.
- Confirm privacy page explains export/deletion placeholders.

### Stage 4 — Internal pilot

Goal: Test with 3 trusted users before the full 10–25 person pilot.

- 1 technical tester.
- 1 nontechnical inventor/creator.
- 1 partner-style reviewer.

Collect:

- Completion problems.
- Confusing questions.
- Whether the IP Readiness Profile feels useful.
- Whether the dashboard/CSV helps tell the impact story.

### Stage 5 — 10–25 user pilot

Goal: Collect enough evidence for funders and partners.

Target success metrics:

- 70%+ intake completion rate.
- Average clarity score improves after profile generation.
- At least 10 profiles generated.
- At least 3–5 users identified for possible next-step referral.
- At least 1 partner/advisor says the profile makes review easier.

---

## What Not to Build Before Pilot

Do not delay the pilot for these features:

- Full marketplace.
- Payment system.
- Real attorney matching.
- Full user accounts/auth.
- File upload for sketches/photos.
- Direct legal filing.
- Automated patent/trademark search.

These can come after the first pilot proves the workflow.

---

## Final Go/No-Go Checklist

### Demo Go

- [ ] Live link works.
- [ ] Demo intake works.
- [ ] Profile generates.
- [ ] PDF downloads.
- [ ] Dashboard demo metrics show.
- [ ] Safe/legal disclaimer is visible.

### Pilot Go

- [ ] Supabase is connected.
- [ ] RLS migration applied.
- [ ] Partner secret works.
- [ ] Live submissions save.
- [ ] CSV export works.
- [ ] 3 internal testers pass.
- [ ] No forbidden legal language found.

When both Demo Go and Pilot Go are complete, SmartProBonoIP is ready for a real 10–25 inventor pilot.
