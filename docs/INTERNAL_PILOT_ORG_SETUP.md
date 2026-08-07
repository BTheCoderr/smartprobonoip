# Internal Pilot Org Setup — SmartProBono Test Organization

**SmartProBonoIP · Milestone 6 · Internal validation only**

Use this runbook to create the **SmartProBono internal test organization** for end-to-end validation. This is **not** URI Innovations, **not** any external partner, and **not** a public pilot.

**Hard gate:** Do **not** enable `org_account_enabled = true` until:

1. Migrations **017–026** applied and [`scripts/verify-production-schema.ts`](../scripts/verify-production-schema.ts) reports all **PASS**
2. [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md) shows no remaining schema blockers
3. Supabase Auth redirect configured (step 2 below)

---

## 1. Prerequisites

| Requirement | Notes |
| --- | --- |
| Production schema 017–026 | See [`PRODUCTION_DEPLOYMENT_017_026.md`](./PRODUCTION_DEPLOYMENT_017_026.md) |
| Env on deploy host | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` |
| Supabase Auth | Email magic links enabled |
| `{APP}` | `NEXT_PUBLIC_APP_URL` (e.g. `https://smartprobono.org`) |

---

## 2. Supabase Auth redirect (required before login test)

In **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | Value |
| --- | --- |
| Site URL | `{APP}` |
| Redirect URLs | `{APP}/api/organization/auth/callback` |

**Local dev:** also add `http://localhost:3000/api/organization/auth/callback`.

Callback route: `src/app/api/organization/auth/callback/route.ts`  
Login OTP redirect: `src/app/organization/login/OrganizationLoginClient.tsx`

---

## 3. Create `partner_organizations` row (internal test)

Migration **023** adds: `slug`, `registry_partner_id`, `settings`, `org_account_enabled` (see `src/lib/db/partnerOrganizations.ts`).

**Step 3a — Insert with org account disabled (dry run):**

```sql
INSERT INTO public.partner_organizations (
  name,
  slug,
  organization_type,
  contact_name,
  contact_email,
  website,
  status,
  registry_partner_id,   -- optional for internal test; NULL is valid
  org_account_enabled,   -- keep FALSE until validation gate passes
  settings
)
VALUES (
  'SmartProBono Internal Test',
  'smartprobono-internal-test',
  'internal_validation',
  'SmartProBono Ops',
  'ops@smartprobono.org',              -- replace with real admin contact
  'https://smartprobono.org/',
  'active',
  NULL,                                 -- no PARTNER_REGISTRY link required
  false,
  '{"pilot_type":"internal","notes":"Not for external inventors"}'::jsonb
)
RETURNING id, name, slug, registry_partner_id, org_account_enabled;
```

Save returned `id` as `{INTERNAL_ORG_ID}`.

**Why no `registry_partner_id`:** Internal test validates org inbox without routing through URI/PPL registry partners. Inventors share via explicit `organizationId` in the consent API. Optional: set `registry_partner_id` later to test registry lookup flows.

**Step 3b — Enable org account (only after schema verification PASS):**

```sql
UPDATE public.partner_organizations
SET
  org_account_enabled = true,
  status = 'active',
  updated_at = now()
WHERE id = '{INTERNAL_ORG_ID}'
  AND slug = 'smartprobono-internal-test';
```

Verify lookup (no auth):

```bash
curl -s "{APP}/api/organization/lookup?organizationId={INTERNAL_ORG_ID}"
# Or if registry_partner_id set later:
# curl -s "{APP}/api/organization/lookup?registryPartnerId=..."
```

Expected when enabled: `"shareEnabled": true`.

---

## 4. Create Supabase Auth admin user

**Dashboard → Authentication → Users → Add user:**

1. Email: internal admin (e.g. `internal-admin@smartprobono.org`)
2. Confirm email
3. Copy user UUID as `{ADMIN_USER_ID}`

Org login uses magic link only.

---

## 5. Seed `organization_members` admin row

Migration **024** columns: `organization_id`, `user_id`, `email`, `role` (`admin`|`reviewer`), `status` (`active`|`revoked`), `invited_at`, `joined_at`.

```sql
INSERT INTO public.organization_members (
  organization_id,
  user_id,
  email,
  role,
  status,
  joined_at
)
VALUES (
  '{INTERNAL_ORG_ID}',
  '{ADMIN_USER_ID}',
  'internal-admin@smartprobono.org',   -- must match Auth email
  'admin',
  'active',
  now()
)
ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  status = 'active',
  joined_at = COALESCE(organization_members.joined_at, now()),
  updated_at = now()
RETURNING id, role, status;
```

Optional reviewer for RBAC tests:

```sql
INSERT INTO public.organization_members (
  organization_id, user_id, email, role, status, joined_at
) VALUES (
  '{INTERNAL_ORG_ID}',
  '{REVIEWER_USER_ID}',
  'internal-reviewer@smartprobono.org',
  'reviewer',
  'active',
  now()
);
```

---

## 6. Verify org access

| Step | URL / API | Expected |
| --- | --- | --- |
| Magic link login | `{APP}/organization/login` | Redirect to `{APP}/organization` |
| Session | `GET {APP}/api/organization/session` | `role: "admin"`, `status: "active"` |
| Empty inbox | `{APP}/organization` | No referrals yet |
| Unauthorized | `GET {APP}/api/organization/referrals` (no cookie) | `401` |

---

## 7. Explicit: no public pilot until validation green

| Do | Don't |
| --- | --- |
| Use internal test org slug `smartprobono-internal-test` | Enable URI or external org rows |
| Complete [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md) | Set `org_account_enabled = true` on real partners |
| Run E2E checklist below with non-demo inventor session | Announce public org-share pilot |
| Document issues in validation report | Skip schema verification |

---

## 8. E2E workflow checklist (internal pilot)

Replace placeholders: `{APP}`, `{PROJECT_ID}`, `{INTERNAL_ORG_ID}`, `{REFERRAL_ID}`, `{RECOMMENDATION_ID}`.

Based on [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md) — condensed operator sequence.

### 8.1 Inventor → workspace

| Step | Action | URL / endpoint |
| --- | --- | --- |
| 1 | Open portfolio with pilot session | `{APP}/workspace` |
| 2 | Open invention profile | `{APP}/profile/{PROJECT_ID}` |
| 3 | Confirm next-best-step panel | UI on profile/workspace |

### 8.2 Handoff → consent

| Step | Action | URL / endpoint |
| --- | --- | --- |
| 4 | Navigate to handoff (with or without registry rec) | `{APP}/profile/{PROJECT_ID}/handoff?rec={RECOMMENDATION_ID}` |
| 5 | Review consent field defaults | Defaults from `src/lib/organization/consent.ts` |
| 6 | Submit organization share | `POST {APP}/api/records/{PROJECT_ID}/organization-share` |

Example body (internal org — no registry required):

```json
{
  "organizationId": "{INTERNAL_ORG_ID}",
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

Headers: `x-pilot-session` matching project owner; `Content-Type: application/json`.

Expected: `201` or `200` with `referralId`.

### 8.3 Org inbox → status update

| Step | Action | URL / endpoint |
| --- | --- | --- |
| 7 | Admin magic link login | `{APP}/organization/login` |
| 8 | View referral inbox | `{APP}/organization` or `GET {APP}/api/organization/referrals` |
| 9 | Open referral detail | `{APP}/organization/referrals/{REFERRAL_ID}` or `GET {APP}/api/organization/referrals/{REFERRAL_ID}` |
| 10 | Update status | `PATCH {APP}/api/organization/referrals/{REFERRAL_ID}` body `{"status":"reviewing"}` |
| 11 | Verify audit events | SQL: `SELECT event_type, prior_status, new_status FROM organization_referral_events WHERE referral_id = '{REFERRAL_ID}' ORDER BY created_at` |
| 12 | Verify frozen snapshot | Edit inventor title via `PATCH {APP}/api/records/{PROJECT_ID}`; re-fetch referral — snapshot unchanged |

### 8.4 Status transition matrix

Exercise each via `PATCH {APP}/api/organization/referrals/{REFERRAL_ID}`:

- `received` → `reviewing` → `needs_information` → `completed`
- `declined`, `referred_elsewhere`
- Invalid status (e.g. `"approved"`) → expect `400`

### 8.5 Sign-off SQL

```sql
SELECT id, status, shared_snapshot->>'sharedFieldKeys' AS fields, consent_record->>'consentCopyVersion' AS consent_version
FROM organization_referrals
WHERE organization_id = '{INTERNAL_ORG_ID}'
ORDER BY created_at DESC
LIMIT 5;
```

---

## Rollback (internal pilot only)

| Change | Rollback |
| --- | --- |
| `org_account_enabled = true` | `UPDATE partner_organizations SET org_account_enabled = false WHERE id = '{INTERNAL_ORG_ID}'` |
| Member access | `UPDATE organization_members SET status = 'revoked' WHERE organization_id = '{INTERNAL_ORG_ID}'` |
| Test referrals | `DELETE FROM organization_referrals WHERE organization_id = '{INTERNAL_ORG_ID}'` (cascades to events) |

Do **not** drop migrations 024–026 in production without ops review.

---

## Related docs

- Production deploy: [`PRODUCTION_DEPLOYMENT_017_026.md`](./PRODUCTION_DEPLOYMENT_017_026.md)
- Full QA checklist: [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md)
- External org runbook (reference only): [`FIRST_ORGANIZATION_PILOT_RUNBOOK.md`](./FIRST_ORGANIZATION_PILOT_RUNBOOK.md)
- Validation report: [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md)
