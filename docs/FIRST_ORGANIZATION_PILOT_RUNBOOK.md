# First Organization Pilot — Ops Runbook

**SmartProBonoIP · Milestone 6 · Preparation only — not legal advice**

Use this runbook to enable the **first** organization account (`org_account_enabled = true`) before inventors can share consented snapshots via `/api/records/[id]/organization-share`.

**Do not activate any organization until:** migrations are verified on production, Supabase Auth redirect is configured, and the QA checklist in [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md) passes.

---

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Supabase project | `smartprobono-platform` (or pilot project) with service role available server-side only |
| Env vars on deploy host | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` |
| Migrations 017–026 | **Required** for full Milestones 2–6 behavior; see migration section below |
| Supabase Auth | Email magic links enabled for org members |
| No secrets in git | Never commit `.env` or service role keys |

---

## 1. Verify production migration state (manual — do not skip)

The repo **cannot** tell you what production has applied. Run these checks in the Supabase SQL editor **before** applying anything.

### 1.1 List applied migrations

```sql
SELECT version, name
FROM supabase_migrations.schema_migrations
ORDER BY version;
```

Compare the result to the inventory in the reconciliation report (Phase 1). Pay special attention to:

- `014_interest_lead_management` vs `016_interest_lead_management` (renumbered in working tree)
- Whether `017`–`026` appear at all

### 1.2 Spot-check tables/columns from 017–026

```sql
-- 017: inventor workspace status + archived_at
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'smartprobonoip_projects'
  AND column_name IN ('archived_at', 'routing_preferences');

-- 018: project events
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'smartprobonoip_project_events'
) AS project_events_exists;

-- 019–021: recovery token columns + claim function
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'smartprobonoip_recovery_tokens'
  AND column_name IN ('scope', 'consumed_at', 'single_use');

-- 020: documents
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'smartprobonoip_documents'
) AS documents_exists;

-- 023: org account columns on partner_organizations
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'partner_organizations'
  AND column_name IN ('slug', 'registry_partner_id', 'org_account_enabled', 'settings');

-- 024–026: organization tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'organization_members',
    'organization_referrals',
    'organization_referral_events'
  )
ORDER BY table_name;
```

**If a migration version is already recorded but objects are missing:** stop and reconcile manually — do not blindly re-apply.

---

## 2. Apply migrations (ordered)

Apply **in numeric order** via Supabase CLI or dashboard SQL runner. Migrations 023–026 are **required** for organization accounts; 017–022 are **required** for inventor workspace, timeline, documents, recovery hardening, and routing preferences that the org-share flow depends on.

| # | File | Required for org pilot? |
| --- | --- | --- |
| 016 | `016_interest_lead_management.sql` | No (partner lead triage only) — apply if not already applied as `014_interest_lead_management` |
| 017 | `017_inventor_workspace.sql` | **Yes** — extended project status + portfolio index |
| 018 | `018_project_events.sql` | **Yes** — inventor timeline |
| 019 | `019_recovery_token_scope.sql` | Recommended — session-scoped recovery |
| 020 | `020_invention_documents.sql` | **Yes** — document records for export metadata in snapshots |
| 021 | `021_single_use_recovery_tokens.sql` | Recommended — security hardening |
| 022 | `022_routing_preferences.sql` | **Yes** — dismissed recommendations / handoff UI state |
| 023 | `023_extend_partner_organizations.sql` | **Yes** — org account columns |
| 024 | `024_organization_members.sql` | **Yes** |
| 025 | `025_organization_referrals.sql` | **Yes** |
| 026 | `026_organization_referral_events.sql` | **Yes** |

### Renumbering caveat (014 → 016)

On `main`, interest lead management is `014_interest_lead_management.sql`. The working tree renames it to `016_interest_lead_management.sql` (same SQL body). **If production already applied `014_interest_lead_management`, do not apply `016` as a new migration** — mark it satisfied and ensure `schema_migrations` reflects reality. The SQL is idempotent (`ADD COLUMN IF NOT EXISTS`), but duplicate version rows cause Supabase CLI confusion.

### Duplicate 014 numbers

`014_reference_gap_map.sql` also exists on `main` (separate feature). Both `014_*` files may appear in production history — verify both objects exist if both versions are listed.

### Migration 015

**No migration `015` exists in this repo.** Rate limiting is implemented in application code (`src/lib/security/rateLimit.ts`), not as a database migration.

---

## 3. Configure Supabase Auth magic-link redirect

In **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | Value |
| --- | --- |
| Site URL | `{NEXT_PUBLIC_APP_URL}` (e.g. `https://smartprobono.org`) |
| Redirect URLs (allow list) | `{NEXT_PUBLIC_APP_URL}/api/organization/auth/callback` |

The callback route exchanges the auth code and redirects to `/organization` (or `?next=` param):

- Callback: `src/app/api/organization/auth/callback/route.ts`
- Login sends OTP with redirect: `src/app/organization/login/OrganizationLoginClient.tsx`

**Local dev:** add `http://localhost:3000/api/organization/auth/callback` to redirect allow list.

---

## 4. Create or identify `partner_organizations` row

Organization accounts extend the existing `partner_organizations` table (migration 023). Example — **replace all example values**:

```sql
-- Example only — use real org name and contact details
INSERT INTO public.partner_organizations (
  name,
  slug,
  organization_type,
  contact_name,
  contact_email,
  website,
  status,
  registry_partner_id,
  org_account_enabled,
  settings
)
VALUES (
  'URI Innovations',                          -- example
  'uri-innovations',                          -- example: unique slug
  'university_tech_transfer',
  'Example Contact Name',
  'contact@example.org',
  'https://uriinnovations.org/',
  'active',
  'uri_innovations',                          -- links to PARTNER_REGISTRY id
  false,                                      -- keep false until step 5
  '{}'::jsonb
)
RETURNING id, name, slug, registry_partner_id;
```

Save the returned `id` as `{ORGANIZATION_ID}` for later steps.

To use an existing row:

```sql
SELECT id, name, slug, registry_partner_id, org_account_enabled, status
FROM public.partner_organizations
WHERE slug = 'uri-innovations';  -- example
```

---

## 5. Enable organization account (when ready)

**Only after QA prep — not during initial row creation if you want a dry run.**

```sql
UPDATE public.partner_organizations
SET
  org_account_enabled = true,
  registry_partner_id = COALESCE(registry_partner_id, 'uri_innovations'),  -- example
  status = 'active',
  updated_at = now()
WHERE id = '{ORGANIZATION_ID}';  -- example UUID
```

Verify public lookup (no auth required):

```bash
curl -s "{NEXT_PUBLIC_APP_URL}/api/organization/lookup?registryPartnerId=uri_innovations"
```

Expected when enabled: `"shareEnabled": true` and `"organization": { "id": "...", ... }`.

---

## 6. Link `registry_partner_id` (recommended)

When set, inventors routed to a registry partner can resolve the org for in-app share:

| Registry ID | Partner name |
| --- | --- |
| `uri_innovations` | URI Innovations |
| `ppl_ptrc` | Providence Public Library PTRC |

Registry metadata **does not grant org access** — only `org_account_enabled` + active membership do (`src/lib/db/partnerOrganizations.ts`).

---

## 7. Create initial Supabase Auth admin user

In **Supabase Dashboard → Authentication → Users → Add user**:

1. Email: admin work address (e.g. `admin@example.org`)
2. Confirm email (or send invite)
3. Copy the user's **UUID** as `{ADMIN_USER_ID}`

Org login uses magic link only — no password required if OTP is enabled.

---

## 8. Seed admin organization membership

Run **after** the Auth user exists:

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
  '{ORGANIZATION_ID}',     -- example UUID from step 4
  '{ADMIN_USER_ID}',       -- example UUID from step 7
  'admin@example.org',     -- must match Auth user email
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

Alternatively, an existing admin can add members via API after first login:

```bash
POST /api/organization/members
Authorization: (Supabase session cookie)
Content-Type: application/json

{
  "userId": "{ADMIN_USER_ID}",
  "email": "admin@example.org",
  "role": "admin"
}
```

---

## 9. Verify magic-link login

1. Open `{NEXT_PUBLIC_APP_URL}/organization/login`
2. Enter the seeded admin email
3. Click the magic link in email
4. Confirm redirect to `/organization` (inbox)

Check session:

```bash
curl -s -b "cookies-from-browser" "{NEXT_PUBLIC_APP_URL}/api/organization/session"
```

Expected: membership with `role: "admin"`, `status: "active"`.

---

## 10. Verify org dashboard access

| URL | Expected |
| --- | --- |
| `/organization` | Referral inbox (empty initially) |
| `/organization/metrics` | Metrics summary (zeros) |
| `/organization/referrals/{id}` | Detail view after a test referral |

API equivalents (authenticated):

- `GET /api/organization/referrals`
- `GET /api/organization/metrics`

---

## 11. Verify unauthorized user rejection

| Test | Expected |
| --- | --- |
| Unauthenticated `GET /api/organization/referrals` | `401` |
| Auth user **without** `organization_members` row | `403` |
| Auth user with `status = 'revoked'` | `403` |
| Inventor pilot session (no Supabase Auth) on org routes | No org data |

---

## 12. Verify reviewer vs admin permissions

| Action | Admin | Reviewer |
| --- | --- | --- |
| View referrals | Yes | Yes |
| Update referral status (`PATCH /api/organization/referrals/[id]`) | Yes | Yes |
| List members (`GET /api/organization/members`) | Yes | **403** |
| Add member (`POST /api/organization/members`) | Yes | **403** |
| Revoke member (`DELETE /api/organization/members/[id]`) | Yes | **403** |

Seed a reviewer for testing:

```sql
INSERT INTO public.organization_members (
  organization_id, user_id, email, role, status, joined_at
) VALUES (
  '{ORGANIZATION_ID}',
  '{REVIEWER_USER_ID}',
  'reviewer@example.org',
  'reviewer',
  'active',
  now()
);
```

---

## 13. Verify referral inbox starts empty

```sql
SELECT count(*) FROM public.organization_referrals
WHERE organization_id = '{ORGANIZATION_ID}';
-- Expected: 0 before any inventor consent share
```

---

## 14. End-to-end inventor share (smoke test)

After org is enabled, run one inventor consent share (see QA checklist for full cases):

1. Complete intake for a non-demo project → note `{PROJECT_ID}`
2. Open handoff for a registry partner with org enabled
3. Confirm share field defaults (title/summary **unchecked**)
4. Submit consent → `POST /api/records/{PROJECT_ID}/organization-share`
5. Confirm referral appears in org inbox with **frozen** snapshot

---

## Rollback notes (organization pilot only)

| Change | Rollback |
| --- | --- |
| `org_account_enabled = true` | `UPDATE ... SET org_account_enabled = false` — stops new shares; existing referrals remain |
| Member access | `UPDATE organization_members SET status = 'revoked'` |
| Test referrals | `DELETE FROM organization_referrals WHERE organization_id = '{ORGANIZATION_ID}'` (cascades to events) |
| Migrations 024–026 | **Do not drop in production** without ops review — prefer disable flag over schema rollback |

Full schema rollback of 017–026 is not documented here; treat migrations as forward-only.

---

## Related docs

- QA checklist: [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md)
- Env reference: `.env.example`
- Privacy / deletion: `docs/PRIVACY_IMPLEMENTATION_NOTES.md`
- Trust facts: `docs/TRUST_FACTS_VERIFICATION.md`
