# Pilot Validation Report

**SmartProBonoIP · Internal pilot · Template**

**Project:** smartprobono-platform (`aokzlnljfabuvshldstc`)  
**Report date:** 2026-08-07  
**Environment:** Production  
**Scope:** Migrations 017–026 + internal org pilot readiness  

---

## Executive summary

| Area | Status | Notes |
| --- | --- | --- |
| Schema 017–026 | **BLOCKED** | All verification checks FAIL (pre-deploy) |
| Migration history (Phase 0) | **PENDING** | Only `durable_rate_limits*` rows in `schema_migrations` |
| Internal test org | **NOT STARTED** | Blocked on schema |
| External organizations | **NOT READY** | Gate: this report green + QA checklist |

**Current prod status constraint (pre-017):** `smartprobonoip_projects.status` allows only `created`, `packet_generated`, `archived`.

---

## Five-phase release checklist

High-level release sequence for the first pilot. Detailed migration steps live in [`PRODUCTION_DEPLOYMENT_017_026.md`](./PRODUCTION_DEPLOYMENT_017_026.md). **Operator GO/NO-GO checklist:** [`PRODUCTION_GO_NO_GO_CHECKLIST.md`](./PRODUCTION_GO_NO_GO_CHECKLIST.md).

| Phase | Scope | Gate |
| --- | --- | --- |
| **1 — Production schema** | Phase 0 reconciliation + apply **017 → 026** one at a time | Incremental verify after each migration (`--migration N`); **`--strict` 10/10 PASS** before app deploy |
| **2 — Application deploy** | Merge and deploy **[PR #8](https://github.com/BTheCoderr/smartprobonoip/pull/8)** (M2–M6 code) | Deploy only after Phase 1 **10/10**; tag baseline e.g. `v1.0.0-pilot` on deployed commit |
| **3 — Internal pilot org** | Create internal test org + full E2E inventor → org workflow | [`INTERNAL_PILOT_ORG_SETUP.md`](./INTERNAL_PILOT_ORG_SETUP.md) + [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md) |
| **4 — One-week validation** | Exercise product wearing **inventor** and **org reviewer** hats | All gates in [Deployment gate checklist](#deployment-gate-checklist-incremental-verify) green; issues logged below |
| **5 — External pilot** | Small external cohort (e.g. URI) | **Only after** Phase 4 internal green + counsel sign-off |

**Permanent pattern (every migration release):** Build → Test → Deploy **one** migration → Verify → Continue → Pilot → Learn.

---

## Schema verification results

**Method:** Supabase Management API read-only SQL (2026-08-07)  
**Script:** [`scripts/verify-production-schema.ts`](../scripts/verify-production-schema.ts)

| Check | Result | Detail |
| --- | --- | --- |
| `archived_at` | **FAIL** | Column missing |
| `status_check_5_values` | **FAIL** | CHECK still 3 values only |
| `project_events` | **FAIL** | Table missing |
| `documents` | **FAIL** | Table missing |
| `routing_preferences` | **FAIL** | Column missing |
| `organization_members` | **FAIL** | Table missing |
| `organization_referrals` | **FAIL** | Table missing |
| `organization_referral_events` | **FAIL** | Table missing |
| `claim_recovery_rpc` | **FAIL** | RPC missing |
| `project_events_backfill` | **FAIL** | Table missing (query error expected) |

**Summary:** 0/10 PASS — consistent with prior audit ([Full schema reconciliation audit](dd3fa0bf-3c70-4b7c-b58e-0963aa41142d)).

> **Verify gate note:** `--migration 017` showing **0/10** before Phase 1 step 1 means **017 not yet applied** (pre-deploy baseline), not a script failure. Expect **2/10** only after migration 017 succeeds.

**Re-run after each migration (incremental gate):**

```bash
npm run verify:production-schema -- --migration 017   # expect 2/10 PASS
# … repeat through 026 …
npm run verify:production-schema -- --strict           # expect 10/10 PASS before app deploy
```

---

## Issues found

| ID | Severity | Issue | Found |
| --- | --- | --- | --- |
| SCH-001 | **Blocker** | Migrations 017–026 not applied to production | 2026-08-07 |
| SCH-002 | **Blocker** | `schema_migrations` missing 002–016 version rows (objects live, history not reconciled) | 2026-08-07 |
| OPS-001 | **High** | Supabase CLI `db query --linked` fails (IPv6); use Dashboard SQL or Management API | 2026-08-07 |
| ORG-001 | **Info** | Internal test org not created | 2026-08-07 |
| QA-001 | **Info** | E2E inventor → org inbox flow not executed | 2026-08-07 |

_Add rows as validation proceeds._

---

## Issues fixed

| ID | Fix | Verified | Date |
| --- | --- | --- | --- |
| — | _(none yet)_ | — | — |

---

## Deployment gate checklist (incremental verify)

Use this checklist during Phase 1 apply. **Stop and report** if any step shows UNEXPECTED or STOP. Do **not** enable org accounts or deploy app code until the final row passes.

| # | Gate | Command / evidence | Expected | Status |
| --- | --- | --- | --- | --- |
| 0 | Phase 0 history reconciliation (non-DDL INSERTs only) | `schema_migrations` query output attached | 002–014, 016 + `durable_rate_limits*`; **not** 017–026 | ⬜ |
| 1 | 017 quiet window scheduled | Ops calendar note | Off-peak US Eastern | ⬜ |
| 2 | After 017 | `npm run verify:production-schema -- --migration 017` | **2/10 PASS**, gate OK | ⬜ |
| 3 | After 018 | `--migration 018` | **4/10 PASS**, gate OK | ⬜ |
| 4 | After 019 | `--migration 019` + spot-check `scope` column | **4/10 PASS**, gate OK | ⬜ |
| 5 | After 020 | `--migration 020` | **5/10 PASS**, gate OK | ⬜ |
| 6 | After 021 | `--migration 021` | **6/10 PASS**, gate OK | ⬜ |
| 7 | After 022 | `--migration 022` | **7/10 PASS**, gate OK | ⬜ |
| 8 | After 023 | `--migration 023` + spot-check `partner_organizations` cols | **7/10 PASS**, gate OK | ⬜ |
| 9 | After 024 | `--migration 024` | **8/10 PASS**, gate OK | ⬜ |
| 10 | After 025 | `--migration 025` | **9/10 PASS**, gate OK | ⬜ |
| 11 | After 026 | `--migration 026` then `--strict` | **10/10 PASS** | ⬜ |
| 12 | App deploy M2–M6 | Deploy log | After row 11 green | ⬜ |
| 13 | Internal test org + E2E | QA checklist + referral/event SQL | Full workflow PASS | ⬜ |
| 14 | External orgs (URI, etc.) | Product + counsel sign-off | **Only after row 13** | ❌ blocked |

**Failure protocol:** On any UNEXPECTED result, capture verify output + SQL Editor error, **do not continue** to the next migration, and update Issues Found below.

---

## Remaining blockers

| Blocker | Owner | Resolution |
| --- | --- | --- |
| Apply migrations 017–026 per [`PRODUCTION_DEPLOYMENT_017_026.md`](./PRODUCTION_DEPLOYMENT_017_026.md) | Ops | Phase 0 reconciliation → incremental apply + verify → `--strict` 10/10 |
| Schedule 017 quiet window | Ops | Off-peak; CHECK lock on `smartprobonoip_projects` |
| Deploy M2–M6 application code | Ops | After `--strict` 10/10 PASS |
| Create internal test org | Product/Ops | [`INTERNAL_PILOT_ORG_SETUP.md`](./INTERNAL_PILOT_ORG_SETUP.md) |
| Complete E2E QA checklist | QA | [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md) |

---

## Readiness for external organizations

| Criterion | Status | Evidence |
| --- | --- | --- |
| Schema 017–026 verified | ❌ | 0/10 checks PASS |
| Internal pilot E2E complete | ❌ | Not started |
| No narrative leak in org API | ⬜ | Pending QA |
| Magic link auth configured | ⬜ | Pending setup |
| Counsel / privacy review | ⬜ | See `docs/LEGAL_COUNSEL_REVIEW_CHECKLIST.md` |
| URI or external org enabled | ❌ **Do not proceed** | Blocked until internal validation green |

**External org go/no-go:** **NO-GO** until all blockers cleared and sign-off table below complete.

---

## Test execution log

| Date | Test | Result | Notes |
| --- | --- | --- | --- |
| 2026-08-07 | `verify-production-schema.ts` | FAIL (0/10) | Pre-deploy baseline |
| | Internal org magic link | — | Not run |
| | Inventor consent share | — | Not run |
| | Org status transitions | — | Not run |
| | Cross-org isolation | — | Not run |
| | `npm test` | — | Run before pilot sign-off |

---

## Sign-off

| Role | Name | Date | Go / No-Go | Notes |
| --- | --- | --- | --- | --- |
| Ops / deploy | | | No-Go | Schema 017–026 pending |
| Product / QA | | | No-Go | Verification 0/10 |
| Engineering | | | No-Go | Awaiting migration apply |

---

## Next update triggers

Update this report when:

1. Phase 0 reconciliation completes (attach `schema_migrations` query output)
2. Each Phase 1 migration step completes (attach incremental verify output — 2/10 … 10/10)
3. Phase 2 `--strict` gate passes (attach 10/10 output before app deploy)
4. Internal org E2E completes (attach referral ID + event SQL output)
5. Any production issue discovered during pilot

---

## Related docs

- [`PRODUCTION_GO_NO_GO_CHECKLIST.md`](./PRODUCTION_GO_NO_GO_CHECKLIST.md)
- [`PRODUCTION_DEPLOYMENT_017_026.md`](./PRODUCTION_DEPLOYMENT_017_026.md)
- [`INTERNAL_PILOT_ORG_SETUP.md`](./INTERNAL_PILOT_ORG_SETUP.md)
- [`FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md`](./FIRST_ORGANIZATION_PILOT_QA_CHECKLIST.md)
