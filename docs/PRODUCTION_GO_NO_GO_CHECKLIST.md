# Production GO / NO-GO Checklist

**SmartProBonoIP · smartprobono-platform (`aokzlnljfabuvshldstc`) · Operator checklist**

Use this checklist during the first production deployment of migrations **017–026** and the internal pilot. **Do not apply DDL, create tags, or merge PRs from this document** — it is a gate checklist only.

**Detailed runbooks:**

- Migration apply workflow: [`PRODUCTION_DEPLOYMENT_017_026.md`](./PRODUCTION_DEPLOYMENT_017_026.md)
- Validation report template: [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md)
- Internal test org setup: [`INTERNAL_PILOT_ORG_SETUP.md`](./INTERNAL_PILOT_ORG_SETUP.md)
- E2E QA: [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md)
- Rollback notes: [`PRODUCTION_DEPLOYMENT_017_026.md#rollback-notes-emergency-only`](./PRODUCTION_DEPLOYMENT_017_026.md#rollback-notes-emergency-only)

---

## Before beginning

Complete every item before Phase 0 reconciliation or migration **017**.

- [ ] **[PR #8](https://github.com/BTheCoderr/smartprobonoip/pull/8) merged** (M2–M6 application code on deploy branch)
- [ ] **Release tag created** — `v1.0.0-pilot` on the intended deploy commit ([release tag steps](./PRODUCTION_DEPLOYMENT_017_026.md#release-tag--pilot-baseline-before-phase-0))
- [ ] **Production backup / snapshot confirmed** (Supabase project snapshot or documented restore point)
- [ ] **Quiet maintenance window started** — especially for **017** (ACCESS EXCLUSIVE lock on `smartprobonoip_projects.status` CHECK)
- [ ] **`verify-production-schema` baseline = 0/10** — pre-deploy expected:

  ```bash
  npm run verify:production-schema
  # or: npm run verify:production-schema -- --migration 017
  ```

- [ ] **Rollback plan available** — operator has read [`rollback notes`](./PRODUCTION_DEPLOYMENT_017_026.md#rollback-notes-emergency-only) and knows STOP protocol
- [ ] **Deployment owner assigned** — name recorded in [`PILOT_VALIDATION_REPORT.md` sign-off](./PILOT_VALIDATION_REPORT.md#sign-off)

**Phase 0 (non-DDL history reconciliation):** complete per [`PRODUCTION_DEPLOYMENT_017_026.md` Phase 0](./PRODUCTION_DEPLOYMENT_017_026.md#phase-0--schema_migrations-history-reconciliation-non-ddl-only) before applying **017**.

---

## Deployment (incremental)

Apply **one migration at a time** via [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/aokzlnljfabuvshldstc/sql/new). After each step: run verify → confirm expected partial PASS → **STOP** if UNEXPECTED or STOP.

Set auth once (read-only Management API):

```bash
export SUPABASE_ACCESS_TOKEN="<personal access token>"
export SUPABASE_PROJECT_REF="aokzlnljfabuvshldstc"
```

### Migration apply + verify gates

| Step | Migration | Apply | Record history | Verify command | Expected PASS | Gate checkbox |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Phase 0 | Non-DDL INSERTs only | 002–014, 016 + preserve `durable_rate_limits*` | `npm run verify:production-schema` | **0/10** | - [ ] |
| 1 | **017** | [`017_inventor_workspace.sql`](../supabase/migrations/017_inventor_workspace.sql) | `('017','inventor_workspace')` | `npm run verify:production-schema -- --migration 017` | **2/10** | - [ ] |
| 2 | 018 | [`018_project_events.sql`](../supabase/migrations/018_project_events.sql) | `('018','project_events')` | `npm run verify:production-schema -- --migration 018` | **4/10** | - [ ] |
| 3 | 019 | [`019_recovery_token_scope.sql`](../supabase/migrations/019_recovery_token_scope.sql) | `('019','recovery_token_scope')` | `npm run verify:production-schema -- --migration 019` | **4/10** _(spot-check `scope`)_ | - [ ] |
| 4 | 020 | [`020_invention_documents.sql`](../supabase/migrations/020_invention_documents.sql) | `('020','invention_documents')` | `npm run verify:production-schema -- --migration 020` | **5/10** | - [ ] |
| 5 | 021 | [`021_single_use_recovery_tokens.sql`](../supabase/migrations/021_single_use_recovery_tokens.sql) | `('021','single_use_recovery_tokens')` | `npm run verify:production-schema -- --migration 021` | **6/10** | - [ ] |
| 6 | 022 | [`022_routing_preferences.sql`](../supabase/migrations/022_routing_preferences.sql) | `('022','routing_preferences')` | `npm run verify:production-schema -- --migration 022` | **7/10** | - [ ] |
| 7 | 023 | [`023_extend_partner_organizations.sql`](../supabase/migrations/023_extend_partner_organizations.sql) | `('023','extend_partner_organizations')` | `npm run verify:production-schema -- --migration 023` | **7/10** _(spot-check org cols)_ | - [ ] |
| 8 | 024 | [`024_organization_members.sql`](../supabase/migrations/024_organization_members.sql) | `('024','organization_members')` | `npm run verify:production-schema -- --migration 024` | **8/10** | - [ ] |
| 9 | 025 | [`025_organization_referrals.sql`](../supabase/migrations/025_organization_referrals.sql) | `('025','organization_referrals')` | `npm run verify:production-schema -- --migration 025` | **9/10** | - [ ] |
| 10 | 026 | [`026_organization_referral_events.sql`](../supabase/migrations/026_organization_referral_events.sql) | `('026','organization_referral_events')` | `npm run verify:production-schema -- --migration 026` then `--strict` | **10/10** | - [ ] |

**History INSERT template** (after each migration file succeeds):

```sql
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('017', 'inventor_workspace')
ON CONFLICT (version) DO NOTHING;
-- Replace version/name per row in the table above.
```

### New checks that must PASS (by migration)

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

Migrations **019** and **023** alter existing objects but have no dedicated script checks — run spot-check SQL below.

### Spot-check SQL (019, 023)

```sql
-- 019 — recovery token scope
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'smartprobonoip_recovery_tokens'
  AND column_name = 'scope';

-- 023 — partner org columns
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'partner_organizations'
  AND column_name IN ('slug', 'registry_partner_id', 'org_account_enabled', 'settings');

-- Migration history complete (after 026)
SELECT version, name FROM supabase_migrations.schema_migrations
WHERE version IN ('017','018','019','020','021','022','023','024','025','026')
ORDER BY version;

-- Rate limiter preserved (015 prod-only)
SELECT count(*) AS rate_limit_rows FROM public.smartprobonoip_rate_limits;
```

### Incremental gate summary (checkboxes)

- [ ] Apply **017** → Verify **2/10**
- [ ] Apply **018** → Verify **4/10**
- [ ] Apply **019** → Spot-check `scope` → Verify **4/10**
- [ ] Apply **020** → Verify **5/10**
- [ ] Apply **021** → Verify **6/10**
- [ ] Apply **022** → Verify **7/10**
- [ ] Apply **023** → Spot-check org columns → Verify **7/10**
- [ ] Apply **024** → Verify **8/10**
- [ ] Apply **025** → Verify **9/10**
- [ ] Apply **026** → Verify **10/10** (`--strict`)

**Failure protocol:** On UNEXPECTED, STOP, or wrong PASS count — **do not run the next migration**. Capture verify output + SQL Editor error; see [`failure recovery`](./PRODUCTION_DEPLOYMENT_017_026.md#failure-recovery--stop-do-not-continue).

---

## After deployment

Complete after migration **026** and **`--strict` 10/10 PASS**. Do not enable external organizations until all items below pass.

- [ ] **`npm run verify:production-schema -- --strict`** — **10/10 PASS** (attach output to [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md))
- [ ] **Deploy application** — M2–M6 code (`v1.0.0-pilot` or deploy-branch commit)
- [ ] **Smoke test** — core inventor flows load; no schema mismatch errors
- [ ] **Internal SmartProBono organization created** — [`INTERNAL_PILOT_ORG_SETUP.md`](./INTERNAL_PILOT_ORG_SETUP.md)
- [ ] **One successful inventor → organization referral** — full E2E per [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md)
- [ ] **Audit events verified** — referral events present in `organization_referral_events` (spot-check SQL in deployment runbook)
- [ ] **Metrics verified** — analytics / observability dashboards show expected post-deploy signals

Update [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md) sign-off table when all gates are green.

---

> **External organizations remain disabled until internal validation is complete.**  
> Do not enable URI or other external org accounts until [`PILOT_VALIDATION_REPORT.md`](./PILOT_VALIDATION_REPORT.md) is green and counsel sign-off is recorded.
