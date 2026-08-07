# Production Deployment — Migrations 017–026

**SmartProBonoIP · smartprobono-platform (`aokzlnljfabuvshldstc`) · Preparation only**

This document is the operator runbook for applying Milestones 2–6 database changes to production. **Do not apply DDL until Phase 0 is approved and a maintenance window is scheduled for migration 017.**

**Operator GO/NO-GO checklist:** [`PRODUCTION_GO_NO_GO_CHECKLIST.md`](./PRODUCTION_GO_NO_GO_CHECKLIST.md)

**Approved operational sequence:**

0. Create pilot baseline release tag (see [Release tag — pilot baseline](#release-tag--pilot-baseline-before-phase-0))
1. Phase 0 — migration history reconciliation (**non-DDL INSERTs only**)
2. Schedule quiet window for **017** (status CHECK exclusive lock)
3. Apply **017 → 026** sequentially via **Supabase Dashboard SQL Editor** (CLI unreliable)
4. **After EACH migration:** run verification → confirm expected partial PASS → **STOP** if unexpected
5. **10/10 PASS** required before app deploy
6. Deploy M2–M6 app code
7. Internal SmartProBono test org + full E2E workflow
8. **No URI or external orgs** until internal pilot passes

**Prior audit ([Full schema reconciliation audit](dd3fa0bf-3c70-4b7c-b58e-0963aa41142d)):** live objects through **002–016** are present; **017–026 are missing**. `schema_migrations` currently records only prod-only rate limiter rows. **Do not re-run 002–016 SQL.**

---

## Preconditions

| Item | Status (2026-08-07) |
| --- | --- |
| Supabase project | `smartprobono-platform` / ref `aokzlnljfabuvshldstc` |
| CLI authenticated | Yes (Management API read-only verified) |
| CLI `db push --linked` | **Broken** — IPv6 pooler error; use **Dashboard SQL Editor** |
| App deploy | M2–M6 code on branch ready; deploy **after** schema 017–026 verified **10/10** |
| Internal pilot org | Follow [`INTERNAL_PILOT_ORG_SETUP.md`](./INTERNAL_PILOT_ORG_SETUP.md) **after** 10/10 PASS + app deploy |
| External orgs (URI, etc.) | **Blocked** until [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md) green |

---

## Release tag — pilot baseline (before Phase 0)

Before any production DDL, cut a **clean git reference** for the first pilot deployment.

1. **Merge [PR #8](https://github.com/BTheCoderr/smartprobonoip/pull/8)** (M2–M6 application code) if not already on the deploy branch — or tag the exact commit you intend to deploy after schema work completes.
2. Create and push the pilot baseline tag (**document only — do not run in automation without approval**):

```bash
git tag v1.0.0-pilot
git push origin v1.0.0-pilot
```

**Why:** Operators, QA, and rollback discussions can point at one immutable commit (`v1.0.0-pilot`) for the first internal pilot, independent of ongoing main-branch commits.

**Five-phase release overview:** See [Five-phase release checklist](./PILOT_VALIDATION_REPORT.md#five-phase-release-checklist) in [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md).

---

## Phase 0 — `schema_migrations` history reconciliation (non-DDL only)

> **This phase performs INSERTs into `supabase_migrations.schema_migrations` only.**  
> It does **not** run `CREATE`, `ALTER`, `DROP`, or any other DDL. Live 002–016 objects are already present.

Production applied 002–016 outside Supabase CLI tracking. Only these rows exist today:

```sql
SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;
-- 20260729153702 | durable_rate_limits
-- 20260729153819 | durable_rate_limits_fix_return
```

**Goal:** Tell the CLI that 002–014 and 016 are satisfied **without re-running SQL**, while **preserving** the two `durable_rate_limits*` rows (prod-only migration 015).

### 0.1 Verify live objects (read-only)

Run [`scripts/verify-production-schema.sql`](../scripts/verify-production-schema.sql) or:

```bash
npm run verify:production-schema
```

Expect **0/10 PASS** (all 017–026 checks FAIL) until Phase 1 completes.

> **Verify gate note:** `npm run verify:production-schema -- --migration 017` showing **0/10 PASS** means migration **017 is not yet applied** (pre-deploy baseline). This is **expected** before Phase 1 step 1 — not a script error. After 017 applies successfully, the same command must show **2/10 PASS**.

Confirm 002–016 objects exist (spot-check from [`FIRST_ORGANIZATION_PILOT_RUNBOOK.md`](./FIRST_ORGANIZATION_PILOT_RUNBOOK.md) §1.2).

### 0.2 Do NOT re-apply (DDL)

| Range | Reason |
| --- | --- |
| 002–014 | Tables, columns, indexes already live |
| 015 (rate limits) | Prod-only; table `smartprobonoip_rate_limits` + RPCs live; **preserve existing rows** |
| 016 (interest lead mgmt) | Columns/indexes on `smartprobonoip_interest_leads` already live |

### 0.3 Renumbering caveat — 014 vs 016

Repo has two files prefixed `014`:

- `014_reference_gap_map.sql` — applied in prod
- `014_interest_lead_management.sql` — same SQL body as documented **016**; prod columns exist

**If interest-lead objects are live:** mark **016** satisfied in history. **Do not** INSERT a second `014_interest_lead_management` version row.

### 0.4 Record satisfied versions (non-DDL — Dashboard SQL Editor)

Open [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/aokzlnljfabuvshldstc/sql/new).

**Preferred (CLI repair, after IPv4 link fixed):**

```bash
npx supabase link --project-ref aokzlnljfabuvshldstc --yes
for v in 002 003 005 006 007 008 009 010 011 012 013 014 016; do
  npx supabase migration repair --status applied "$v"
done
# Do NOT repair 015 — prod uses timestamp versions durable_rate_limits*
```

**Recommended fallback (Dashboard SQL Editor — one transaction, INSERTs only):**

```sql
BEGIN;

-- NON-DDL: history reconciliation only. No CREATE/ALTER/DROP.
-- Preserve existing rate-limiter history (015 prod-only):
-- DO NOT DELETE FROM supabase_migrations.schema_migrations
--   WHERE name LIKE 'durable_rate_limits%';

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES
  ('002', 'pilot_rls'),
  ('003', 'umbrella_platform_schema'),
  ('005', 'recovery_tokens'),
  ('006', 'partner_tracking'),
  ('007', 'analytics_events'),
  ('008', 'pilot_feedback'),
  ('009', 'ownership_readiness'),
  ('010', 'research_prep_workspace'),
  ('011', 'recovery_expiry_hardening'),
  ('012', 'interest_leads'),
  ('013', 'editable_development_timeline'),
  ('014', 'reference_gap_map'),
  ('016', 'interest_lead_management')
ON CONFLICT (version) DO NOTHING;

COMMIT;
```

**Verify (read-only):**

```sql
SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;
-- Expect: 002–014, 016, plus durable_rate_limits*
-- Expect NOT: 017–026 yet
```

Re-run `npm run verify:production-schema` — still expect **0/10 PASS** (Phase 0 does not apply 017–026 DDL).

### 0.5 Prod drift — leave untouched

- Extra `ip_*` tables and extra `smartprobonoip_answers` columns
- Non-partial partner/campaign indexes from 006 (functional; optional cleanup later)
- All rows in `smartprobonoip_rate_limits` — **never truncate during reconciliation**

---

## Phase 1 — Apply 017–026 (one at a time, verify after each)

> **Do NOT queue all 10 migrations blindly.** Apply one file, record history, verify, then proceed only if the incremental gate passes.

### Dashboard SQL Editor workflow (recommended)

1. Open [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/aokzlnljfabuvshldstc/sql/new)
2. For each row in the table below:
   - Paste and run the **full contents** of the migration file
   - Run the **history INSERT** for that version
   - Run **`npm run verify:production-schema -- --migration N`**
   - Confirm **expected partial PASS** and **Match = OK** for all rows
   - **STOP** if any **UNEXPECTED** result or summary says **STOP**
3. After migration **026**, run **`npm run verify:production-schema -- --strict`** — must show **10/10 PASS**

Set auth once (read-only Management API):

```bash
export SUPABASE_ACCESS_TOKEN="<personal access token>"
export SUPABASE_PROJECT_REF="aokzlnljfabuvshldstc"
```

### Incremental apply + verify table

| Step | Migration | Run file | Record history (`schema_migrations`) | Verify command | Expected PASS | New checks that must PASS |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **017** | [`017_inventor_workspace.sql`](../supabase/migrations/017_inventor_workspace.sql) | `('017','inventor_workspace')` | `npm run verify:production-schema -- --migration 017` | **2/10** | `archived_at`, `status_check_5_values` |
| 2 | 018 | [`018_project_events.sql`](../supabase/migrations/018_project_events.sql) | `('018','project_events')` | `--migration 018` | **4/10** | + `project_events`, `project_events_backfill` |
| 3 | 019 | [`019_recovery_token_scope.sql`](../supabase/migrations/019_recovery_token_scope.sql) | `('019','recovery_token_scope')` | `--migration 019` | **4/10** | _(no script checks; spot-check `scope` column)_ |
| 4 | 020 | [`020_invention_documents.sql`](../supabase/migrations/020_invention_documents.sql) | `('020','invention_documents')` | `--migration 020` | **5/10** | + `documents` |
| 5 | 021 | [`021_single_use_recovery_tokens.sql`](../supabase/migrations/021_single_use_recovery_tokens.sql) | `('021','single_use_recovery_tokens')` | `--migration 021` | **6/10** | + `claim_recovery_rpc` |
| 6 | 022 | [`022_routing_preferences.sql`](../supabase/migrations/022_routing_preferences.sql) | `('022','routing_preferences')` | `--migration 022` | **7/10** | + `routing_preferences` |
| 7 | 023 | [`023_extend_partner_organizations.sql`](../supabase/migrations/023_extend_partner_organizations.sql) | `('023','extend_partner_organizations')` | `--migration 023` | **7/10** | _(no script checks; spot-check org columns on `partner_organizations`)_ |
| 8 | 024 | [`024_organization_members.sql`](../supabase/migrations/024_organization_members.sql) | `('024','organization_members')` | `--migration 024` | **8/10** | + `organization_members` |
| 9 | 025 | [`025_organization_referrals.sql`](../supabase/migrations/025_organization_referrals.sql) | `('025','organization_referrals')` | `--migration 025` | **9/10** | + `organization_referrals` |
| 10 | 026 | [`026_organization_referral_events.sql`](../supabase/migrations/026_organization_referral_events.sql) | `('026','organization_referral_events')` | `--migration 026` then `--strict` | **10/10** | + `organization_referral_events` |

**History INSERT template** (after each migration file succeeds):

```sql
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('017', 'inventor_workspace')
ON CONFLICT (version) DO NOTHING;
-- Replace version/name per row in the table above.
```

### Check → migration map (full reference)

| Check | First PASS after migration |
| --- | --- |
| `archived_at` | 017 |
| `status_check_5_values` | 017 |
| `project_events` | 018 |
| `project_events_backfill` | 018 |
| `documents` | 020 |
| `claim_recovery_rpc` | 021 |
| `routing_preferences` | 022 |
| `organization_members` | 024 |
| `organization_referrals` | 025 |
| `organization_referral_events` | 026 |

Migrations **019** and **023** alter existing objects but have no dedicated script checks — use spot-check SQL in Phase 2.

### 017 quiet-window warning

Schedule step **1 (017)** during **low traffic** (evenings/weekends US Eastern). Migration **017** runs:

```sql
ALTER TABLE public.smartprobonoip_projects
  DROP CONSTRAINT smartprobonoip_projects_status_check;
ALTER TABLE public.smartprobonoip_projects
  ADD CONSTRAINT smartprobonoip_projects_status_check CHECK (...);
```

This takes an **ACCESS EXCLUSIVE** lock on `smartprobonoip_projects`. Current prod constraint allows only 3 values: `created`, `packet_generated`, `archived`.

**Mitigation:** Complete 017 in one transaction; avoid concurrent long-running writes on projects during the window.

### Failure recovery — STOP, do not continue

If verification reports **STOP**, **UNEXPECTED**, or an expected check **FAIL**s:

1. **Do not run the next migration file.**
2. Capture: migration number, SQL Editor error text, full verify script output, and `SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;`
3. Report to engineering with the above artifacts.
4. Assess whether partial DDL applied (e.g. table exists but history row missing).
5. Prefer **forward fix** (complete the failed migration in a new SQL Editor session) over rollback unless data loss is imminent.

**Common failure modes:**

| Symptom | Likely cause | Action |
| --- | --- | --- |
| Expected check FAIL after apply | Migration SQL incomplete or wrong file order | Re-run correct file; do not skip ahead |
| PASS count higher than expected | Prior partial apply or manual DDL | Stop; reconcile with engineering before continuing |
| History row missing but objects exist | Forgot INSERT after SQL | INSERT history row only; re-verify |
| 017 lock timeout | Peak traffic | Retry in quiet window; do not stack 018+ in same session until 017 gate passes |

### Rollback notes (emergency only)

| Migration | Rollback (emergency only) |
| --- | --- |
| **017** | Restore 3-value CHECK; `ALTER TABLE ... DROP COLUMN archived_at`; drop `idx_spb_projects_session_created` |
| **018** | `DROP TABLE public.smartprobonoip_project_events CASCADE` — **loses backfilled timeline** |
| **019** | `ALTER TABLE smartprobonoip_recovery_tokens DROP COLUMN scope` (+ drop CHECK) |
| **020** | `DROP TABLE public.smartprobonoip_documents CASCADE` |
| **021** | `DROP FUNCTION claim_smartprobonoip_recovery_token`; restore `idx_recovery_tokens_hash_active`; drop `consumed_at`, `single_use` |
| **022** | `ALTER TABLE smartprobonoip_projects DROP COLUMN routing_preferences` |
| **023** | Drop cols `slug`, `registry_partner_id`, `settings`, `org_account_enabled`; drop indexes `idx_partner_orgs_slug`, `idx_partner_orgs_registry_partner` |
| **024** | `DROP TABLE public.organization_members CASCADE` |
| **025** | `DROP TABLE public.organization_referrals CASCADE` |
| **026** | `DROP TABLE public.organization_referral_events CASCADE` |

**Org tables (024–026):** drop in reverse FK order: 026 → 025 → 024.

Treat schema rollback as **forward-only** in normal ops; prefer disabling `org_account_enabled` over dropping org tables.

### Apply methods (alternatives)

**Option A — CLI (only if IPv4 link fixed):**

```bash
npx supabase link --project-ref aokzlnljfabuvshldstc --yes
npx supabase db push --linked
```

Even with CLI, **still run incremental verify after each migration** if applying individually is not possible, run `--strict` immediately after push and treat any FAIL as STOP.

**Option B — Concatenated script (not recommended):**

Avoid applying all files in one paste unless unavoidable — you lose per-migration STOP gates. If used, schedule 017 quiet window first; verify `--strict` only after entire block.

---

## Phase 2 — Post-deploy verification (10/10 gate)

Run after migration **026**:

```bash
npm run verify:production-schema -- --strict
```

Or paste [`scripts/verify-production-schema.sql`](../scripts/verify-production-schema.sql) in SQL Editor.

### Expected results (all PASS)

| Check | SQL concept |
| --- | --- |
| `archived_at` | Column on `smartprobonoip_projects` |
| `status_check_5_values` | CHECK includes `researching`, `professional_review` |
| `project_events` | Table exists |
| `documents` | Table exists |
| `routing_preferences` | Column on `smartprobonoip_projects` |
| `organization_members` | Table exists |
| `organization_referrals` | Table exists |
| `organization_referral_events` | Table exists |
| `claim_recovery_rpc` | Function `claim_smartprobonoip_recovery_token` |
| `project_events_backfill` | `count(*) > 0` on `smartprobonoip_project_events` |

### Additional spot-checks (019, 023)

```sql
-- Partner org columns (023)
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'partner_organizations'
  AND column_name IN ('slug', 'registry_partner_id', 'org_account_enabled', 'settings');

-- Recovery token hardening (019–021)
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'smartprobonoip_recovery_tokens'
  AND column_name IN ('scope', 'consumed_at', 'single_use');

-- Migration history complete
SELECT version, name FROM supabase_migrations.schema_migrations
WHERE version IN ('017','018','019','020','021','022','023','024','025','026')
ORDER BY version;

-- Rate limiter preserved (015)
SELECT count(*) AS rate_limit_rows FROM public.smartprobonoip_rate_limits;
```

### Dashboard SQL fallback (CLI link broken)

If `npx supabase db push` or `db query --linked` fails with IPv6 errors:

1. Use [SQL Editor](https://supabase.com/dashboard/project/aokzlnljfabuvshldstc/sql/new) for Phase 0, Phase 1, and Phase 2
2. Use [Management API](https://supabase.com/docs/reference/api/v1-run-a-query) with `read_only: true` for verification scripts
3. Fix link: Dashboard → Project Settings → Database → enable IPv4 add-on / pooler, then `npx supabase link --project-ref aokzlnljfabuvshldstc --yes`

---

## Phase 3 — App deploy + internal pilot (after 10/10)

| Step | Action | Gate |
| --- | --- | --- |
| 1 | Deploy M2–M6 application code | `--strict` 10/10 PASS |
| 2 | Create internal SmartProBono test org | [`INTERNAL_PILOT_ORG_SETUP.md`](./INTERNAL_PILOT_ORG_SETUP.md) |
| 3 | Run full E2E inventor → org workflow | [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md) |
| 4 | Update [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md) | All gates green |
| 5 | External orgs (URI, etc.) | **Only after** internal pilot sign-off |

**Do not enable org accounts or external organizations until Phase 3 completes.**

---

## Approval gates

| Gate | Owner | Blocker |
| --- | --- | --- |
| Phase 0 reconciliation SQL reviewed | Ops | Duplicate version rows; accidental 002–016 re-apply |
| 017 maintenance window scheduled | Ops | CHECK lock during peak traffic |
| Each Phase 1 step incremental verify | Ops | Any UNEXPECTED / STOP → do not continue |
| Phase 2 `--strict` 10/10 PASS | Ops/QA | Any FAIL → do not deploy app or enable orgs |
| App deploy with M2–M6 code | Ops | Schema mismatch |
| Internal pilot org + E2E | Product/QA | [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md) green |
| External org (URI, etc.) | Product + counsel | Internal pilot QA complete |

---

## Related docs

- GO/NO-GO checklist: [`PRODUCTION_GO_NO_GO_CHECKLIST.md`](./PRODUCTION_GO_NO_GO_CHECKLIST.md)
- Internal pilot setup: [`INTERNAL_PILOT_ORG_SETUP.md`](./INTERNAL_PILOT_ORG_SETUP.md)
- Validation report: [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md)
- QA checklist: [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md)
- Prior audit: [Full schema reconciliation audit](dd3fa0bf-3c70-4b7c-b58e-0963aa41142d)
