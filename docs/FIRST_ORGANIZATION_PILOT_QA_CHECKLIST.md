# First Organization Pilot — QA Checklist

**SmartProBonoIP · Milestone 6 · Actionable pre-pilot verification**

Complete this checklist after following [`FIRST_ORGANIZATION_PILOT_RUNBOOK.md`](./FIRST_ORGANIZATION_PILOT_RUNBOOK.md). Use a **non-demo** inventor session and a **test organization** with `org_account_enabled = true`.

Replace placeholders:

- `{APP}` → `NEXT_PUBLIC_APP_URL` (e.g. `https://smartprobono.org`)
- `{PROJECT_ID}` → UUID of a completed non-demo invention
- `{ORG_ID}` → `partner_organizations.id` for the pilot org
- `{REFERRAL_ID}` → UUID returned from organization-share
- `{REGISTRY_ID}` → e.g. `uri_innovations` or `ppl_ptrc`

---

## Setup verification

- [ ] Migrations 017–026 verified/applied on production (see runbook §1)
- [ ] Supabase Auth redirect includes `{APP}/api/organization/auth/callback`
- [ ] Pilot org row exists with `org_account_enabled = true` and `status = 'active'`
- [ ] Admin member seeded; reviewer member seeded (optional, for RBAC tests)
- [ ] `GET {APP}/api/organization/lookup?registryPartnerId={REGISTRY_ID}` returns `"shareEnabled": true`

---

## A. Inventor side

### A1. Existing project & workspace

- [ ] Open `{APP}/workspace` with an existing pilot session — portfolio lists prior invention(s)
- [ ] Open `{APP}/profile/{PROJECT_ID}` — packet loads with readiness score

### A2. Next best step

- [ ] Profile or workspace shows **Next best steps** panel with recommendations
- [ ] Recommendation for `{REGISTRY_ID}` appears when routing rules match (e.g. URI affiliation for `uri_innovations`)
- [ ] Click recommendation → navigates to `{APP}/profile/{PROJECT_ID}/handoff?rec={RECOMMENDATION_ID}`

### A3. Handoff — why recommended

- [ ] Handoff screen shows **why** copy derived from registry/routing signals only
- [ ] Handoff copy contains **no** intake narrative (`whatCreated`, `problemSolved`, etc.)
- [ ] External partners require confirmation before leaving the app (if applicable)

### A4. Share fields & defaults

- [ ] Organization share consent panel lists allowlisted fields (`src/lib/organization/consent.ts`)
- [ ] **Default checked:** readiness score, category breakdown, preparation signals, missing-info categories, referral reason, packet export metadata
- [ ] **Default unchecked:** invention title, plain-language summary, readiness packet PDF artifact
- [ ] Consent disclaimer visible (`ORGANIZATION_CONSENT_DISCLAIMER`)

### A5. Consent submit & referral created

- [ ] Submit share with defaults only → `POST {APP}/api/records/{PROJECT_ID}/organization-share` returns `201/200` with `referralId`
- [ ] Request includes `x-pilot-session` header matching project owner
- [ ] Response includes `sharedFieldKeys` matching selections
- [ ] Duplicate share same org+project → handled (unique index on `organization_id, project_id` — expect error or idempotent behavior)

Example request body (defaults):

```json
{
  "organizationId": "{ORG_ID}",
  "registryPartnerId": "{REGISTRY_ID}",
  "recommendationId": "{RECOMMENDATION_ID}",
  "selectedFields": [
    "readiness.overall_score",
    "readiness.category_breakdown",
    "readiness.preparation_signals",
    "readiness.missing_information_categories",
    "referral.reason",
    "packet.export_metadata"
  ]
}
```

### A6. Frozen snapshot at consent time

- [ ] In DB: `organization_referrals.shared_snapshot` JSON matches selected fields only
- [ ] `consent_record.consentAt` timestamp recorded
- [ ] `consent_record.consentCopyVersion` = `org_share_consent_v1`
- [ ] `organization_referral_events` contains `referral_created` event

```sql
SELECT id, status, shared_snapshot, consent_record
FROM organization_referrals
WHERE id = '{REFERRAL_ID}';
```

### A7. Post-consent edit does not mutate org snapshot

- [ ] As inventor, edit project title or profile summary (`PATCH {APP}/api/records/{PROJECT_ID}`)
- [ ] Re-fetch org referral: `GET {APP}/api/organization/referrals/{REFERRAL_ID}` (org auth)
- [ ] `shared_snapshot` JSON **unchanged** from step A6
- [ ] Org list item flags (`hasTitle`, `hasSummary`) still reflect snapshot, not live record

---

## B. Organization side

### B1. Admin magic link login

- [ ] `{APP}/organization/login` → enter admin email → receive magic link
- [ ] Link lands on `{APP}/organization` with session cookie set
- [ ] `GET {APP}/api/organization/session` returns admin membership

### B2. Referral in correct org only

- [ ] Admin inbox `{APP}/organization` shows `{REFERRAL_ID}`
- [ ] `GET {APP}/api/organization/referrals` returns referral for `{ORG_ID}` only
- [ ] Second test org admin **cannot** see `{REFERRAL_ID}` (`404` on detail API)

### B3. Consented fields only in org view

- [ ] Referral detail shows readiness score, categories, signals, missing-info labels, referral reason, export metadata (if selected)
- [ ] **No** invention title/summary when not selected in A5
- [ ] Repeat share with title selected → org view includes `invention.title` only in snapshot

### B4. No intake narrative leak

- [ ] Org API response JSON does not contain: `whatCreated`, `problemSolved`, `howItWorks`, `ownershipNotes`, `disclosureEvents`, `location`, `contact_email`
- [ ] Org UI does not render intake wizard answers or research workspace notes
- [ ] `snapshotContainsForbiddenNarrative()` contract satisfied (covered by unit tests)

### B5. All status transitions

For each status, `PATCH {APP}/api/organization/referrals/{REFERRAL_ID}`:

```json
{ "status": "<status>" }
```

- [ ] `received` → initial state after create
- [ ] `reviewing`
- [ ] `needs_information`
- [ ] `completed`
- [ ] `declined`
- [ ] `referred_elsewhere`
- [ ] Invalid status (e.g. `"approved"`) → `400`

### B6. Audit events

After status changes, verify append-only events:

```sql
SELECT event_type, prior_status, new_status, actor_type, created_at
FROM organization_referral_events
WHERE referral_id = '{REFERRAL_ID}'
ORDER BY created_at;
```

- [ ] `referral_created` on share
- [ ] `status_changed` for each PATCH with correct `prior_status` / `new_status`
- [ ] Event rows contain **no** invention narrative in `metadata`

### B7. Metrics

- [ ] `{APP}/organization/metrics` loads after at least one referral
- [ ] `referralsReceived` ≥ 1
- [ ] `byStatus` counts match inbox
- [ ] `averageReadinessScore` computed from snapshot scores only
- [ ] Metrics contain no legal-outcome language fields

---

## C. Security

### C1. Cross-org isolation

- [ ] Org A member token → `GET /api/organization/referrals/{REFERRAL_ID}` for Org B referral → `404`
- [ ] Client-supplied `?organization_id=` mismatch with JWT membership → `403` (`verifyOrganizationMembership`)

### C2. Revoked member

- [ ] Admin revokes reviewer: `DELETE {APP}/api/organization/members/{MEMBER_ID}`
- [ ] Revoked user's subsequent API calls → `403`
- [ ] Optional: `member_access_revoked` event if implemented for referral access

### C3. Registry does not grant org access

- [ ] `GET {APP}/api/organization/lookup?registryPartnerId={REGISTRY_ID}` with `org_account_enabled = false` → `"shareEnabled": false`
- [ ] Inventor handoff to registry partner without org enabled → external link only, no in-app share
- [ ] `registry_partner_id` on org row does not auto-create membership

### C4. Analytics — no invention text

- [ ] Trigger `organization_referral_shared` event (automatic on share)
- [ ] Inspect `smartprobonoip_analytics_events` (or server logs): metadata includes `projectId`, `partnerId`, `fieldCount` — **not** intake text
- [ ] GTM/marketing tags do not fire on `/organization/*` or `/profile/*` private routes (see `docs/TRUST_FACTS_VERIFICATION.md`)

### C5. Inventor session boundary (unchanged)

- [ ] Org Auth session cannot `GET {APP}/api/records/{PROJECT_ID}` without matching `x-pilot-session`
- [ ] Partner dashboard secret (`/api/partner/*`) remains separate from org Auth

---

## D. Regression spot-checks

- [ ] `npm test` — 118 tests pass (includes organization + snapshot tests)
- [ ] Partner secret dashboard still works (`/dashboard` + `x-partner-secret`)
- [ ] Public partner directory `{APP}/partners` still lists verified external partners
- [ ] Copy safety: `npm run test:copy-safety` passes

---

## Sign-off

| Role | Name | Date | Notes |
| --- | --- | --- | --- |
| Ops / deploy | | | Migrations verified |
| Product / QA | | | Checklist complete |
| Org admin (pilot) | | | Magic link + inbox verified |

**Pilot go/no-go:** All sections A–C checked, or exceptions documented with owner and mitigation.
