# SmartProBonoIP — Priority 9 Security & Privacy Audit

**Date:** June 2026  
**Scope:** API routes, Supabase RLS, recovery, session isolation, dashboard, analytics, CSV, rate limiting, secrets.

## Executive summary

SmartProBonoIP uses a **service-role API gateway** model: Postgres RLS is enabled with **no public anon policies** (deny-by-default). Private packet data is accessed only through Next.js API routes that verify `x-pilot-session` ownership or `PARTNER_DASHBOARD_SECRET`.

This sprint adds in-memory rate limiting, timing-safe partner secret comparison, header-only partner auth (no secret in URLs), 90-day recovery token expiry, CSV formula-injection mitigation, session-gated generate/coach, generic server errors on sensitive routes, and expanded privacy copy.

---

## 1. API route audit

| Route | Who can call | Reads / writes | Ownership | Service role | Sensitive logging | Rate limit | Response leaks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /api/records` | Client with `x-pilot-session` | Writes project, answers, profile, metrics | Session stored on create | Yes (`server-only`) | No raw answers in logs | No (create is low-frequency) | Returns full record to owner session only |
| `GET/PATCH /api/records/[id]` | Owner session | Reads/updates clarity, profile | `getRecordById(id, session)` | Yes | No | No | 404 if not owner |
| `POST /api/generate` | Valid session header | Reads answers in body; no DB write | Session required (format validated) | No DB | No | **12 / 15 min** per session | Returns profile only |
| `POST /api/recovery/create` | Owner session | Inserts hashed token; revokes prior | `getRecordById` before create | Yes | Raw token never stored/logged | **6 / hour** per IP | Returns recovery URL once (expected) |
| `POST /api/recovery/claim` | Any session (incognito OK) | Updates `pilot_session_id`; sets `last_used_at` | Token hash lookup | Yes | Generic error on failure | **24 / hour** per IP | Same error for invalid/expired/revoked |
| `GET/POST /api/feedback` | Owner session | Reads/writes feedback row | `getRecordById` + session on save | Yes | No free-text in analytics | **12 / hour** per session | 404 if not owner (GET) |
| `GET/POST /api/research/[projectId]` | Owner session | CRUD saved references | `getResearchWorkspace` checks session | Yes | No | **80 / hour** per session | 404 if not owner |
| `POST /api/compare-reference` | Owner session (via research flow) | Rule-based comparison | Session on parent project | No DB | No | **40 / 15 min** per IP | Comparison text only |
| `POST /api/analytics/track` | Any client | Inserts sanitized event | Optional `projectId` (not cryptographically bound) | Yes | Metadata allowlist only | **150 / 15 min** per IP | Safe metadata only |
| `GET /api/partner/metrics` | `x-partner-secret` header | Aggregated live metrics | Secret gate | Yes | No | **40 / 15 min** per IP | Metrics + redacted record summaries; invention narratives omitted |
| `GET /api/partner/export.csv` | `x-partner-secret` header | Live record summaries | Secret gate; demo excluded | Yes | No | **40 / 15 min** per IP | Signals/clarity/ownership flags; no raw descriptions |
| `GET /api/partner/analytics` | `x-partner-secret` header | Event aggregates | Secret gate | Yes | No | **40 / 15 min** per IP | Aggregates only |
| `GET /api/partner/feedback` | `x-partner-secret` header | Pilot feedback rows | Secret gate | Yes | Notes visible to secret holder by design | **40 / 15 min** per IP | Intended pilot reporting |
| `POST /api/coach` | Owner session | AI/rule coach on packet context | `getRecordById` for non-demo | Optional AI keys | No | **24 / 15 min** per session | Coach text only |

**Notes**

- Partner routes no longer accept `?secret=` query params (header only).
- `POST /api/records` still trusts client-supplied profile payload — deferred hardening (server-side regeneration).
- `/api/coach` was in scope for session gating; not in original list but hardened in same pass.

---

## 2. Supabase RLS audit

| Table | RLS enabled | Anon read | Anon write | Notes |
| --- | --- | --- | --- | --- |
| `pilot_sessions` | Yes (003) | Denied | Denied | No policies |
| `smartprobonoip_projects` | Yes | Denied | Denied | Session column for ownership |
| `smartprobonoip_answers` | Yes | Denied | Denied | |
| `smartprobonoip_profiles` | Yes | Denied | Denied | |
| `smartprobonoip_impact_metrics` | Yes | Denied | Denied | |
| `smartprobonoip_recovery_tokens` | Yes (005) | Denied | Denied | Stores `token_hash` only |
| `smartprobonoip_analytics_events` | Yes (007) | Denied | Denied | |
| `smartprobonoip_feedback` | Yes (008) | Denied | Denied | |
| `smartprobonoip_saved_references` | Yes (010) | Denied | Denied | |

- Legacy `mvp_anon_all` policies dropped in `002_pilot_rls.sql`.
- Service role: `src/lib/supabaseServer.ts` (`import "server-only"`), used only from `src/lib/db/*` and API routes.
- Client bundle: `SUPABASE_SERVICE_ROLE_KEY` appears only as env var name in server chunks; no key value committed (see secret scan).
- Raw recovery tokens are never persisted; only SHA-256 hash.

---

## 3. Recovery security

| Control | Status |
| --- | --- |
| 32-byte random token (`randomBytes`) | OK |
| SHA-256 hash stored | OK |
| Claim uses generic error (no existence leak) | OK |
| `last_used_at` updated on claim | OK |
| `revoked_at` respected | OK |
| `expires_at` enforced (null rejected) | OK |
| Default 90-day expiry on create | OK (`DEFAULT_EXPIRY_DAYS = 90`) |
| Prior tokens revoked on new link | OK |

**Deferred:** single-use tokens; moving token out of URL query string (UX tradeoff).

---

## 4. Session isolation

- Profile page loads via `getStore().getRecord(id)` which calls `GET /api/records/[id]` with session header.
- Fresh incognito has new random session → UUID guess returns 404.
- Recovery claim attaches packet to **current** session only (`pilot_session_id` update).
- Demo packets excluded from recovery create.

---

## 5. Dashboard security

- Unlock requires `PARTNER_DASHBOARD_SECRET` via `x-partner-secret` header.
- Timing-safe comparison (`crypto.timingSafeEqual`).
- Failed unlock returns generic `{ error: "Unauthorized." }` — no data leak.
- CSV/metrics/analytics/feedback routes share same secret gate.
- `listLiveRecords()` excludes `is_demo = true`.
- Secret not placed in URL (DashboardClient updated).

---

## 6. Analytics privacy

`sanitizeAnalyticsMetadata()` allowlists keys and blocks patterns matching description, email, token, invention, etc. Values capped at 120 chars; emails and long tokens stripped.

Allowed: event name, project id, partner/source/campaign, route, step, signal keys, booleans, safe counts, error codes.

Not stored in analytics metadata: raw invention text, full intake answers, emails, recovery tokens, research notes.

---

## 7. Feedback and research privacy

- Feedback tied to `project_id` + session via `saveFeedback` / `getFeedbackForProject`.
- Research workspace CRUD requires matching session on project.
- Partner feedback route exposes notes to secret holders (intended pilot reporting).
- Public routes return 404 for non-owners.

---

## 8. Input / output safety

- No `dangerouslySetInnerHTML` in codebase.
- React default escaping for user text in UI.
- PDF generation uses structured text fields (no HTML execution).
- CSV export uses `escapeCsvField()` — prefixes `=`, `+`, `-`, `@` with apostrophe.

---

## 9. Rate limiting

In-memory sliding window (`src/lib/security/rateLimit.ts`). Suitable for single-instance / low-traffic pilot; not distributed.

| Route | Limit |
| --- | --- |
| `/api/generate` | 12 / 15 min (session) |
| `/api/coach` | 24 / 15 min (session) |
| `/api/compare-reference` | 40 / 15 min (IP) |
| `/api/recovery/create` | 6 / hour (IP) |
| `/api/recovery/claim` | 24 / hour (IP) |
| `/api/feedback` | 12 / hour (session) |
| `/api/research/[projectId]` | 80 / hour (session) |
| `/api/analytics/track` | 150 / 15 min (IP) |
| Partner routes | 40 / 15 min (IP) |

**Deferred:** Redis/Upstash for multi-instance Netlify.

---

## 10. Secret scan

Checked source (excluding `.env*`, `node_modules`):

- No committed Supabase service role key values.
- No hardcoded `PARTNER_DASHBOARD_SECRET`.
- No API keys (`sk-`, `re_`) in tracked files.
- `.env.local` not committed.

---

## 11. Privacy / disclaimer copy

Updated `PRIVACY_NOTICE` in `src/lib/disclaimer.ts`:

- Educational readiness only; not legal advice; no attorney-client relationship.
- What/why data is collected.
- Partner dashboard / pilot reporting scope.
- Recovery link hashing and expiry.
- Deletion request path (email during pilot).

Rendered on `/smartprobonoip/privacy` and disclaimer page.

---

## Risks found and fixes

| Risk | Fix |
| --- | --- |
| Partner secret in URL query string | Header-only auth |
| Timing-attack on partner secret | `timingSafeEqual` |
| No rate limits on abuse-prone routes | In-memory limits added |
| CSV formula injection | `escapeCsvField` |
| Optional recovery expiry | 90-day default; null rejected on claim |
| Generate/coach without session gate | Session header required |
| Feedback GET leaked existence | 404 when not owner |
| Generic Supabase errors on some routes | Generic server error strings |

---

## Deferred items

1. Server-side profile regeneration on `POST /api/records`.
2. Distributed rate limiting for multi-instance deploys.
3. Single-use recovery tokens.
4. Cryptographically signed analytics when `projectId` is present.
5. Recovery token in POST body instead of URL (referrer/history exposure).

---

## Manual tests

1. Fresh incognito → direct profile UUID → not found (via API/session gate).
2. Recovery link claim in new incognito → packet loads under new session.
3. Dashboard without secret → unauthorized.
4. CSV export uses header only (no `?secret=`).
5. Research workspace save/load requires matching session.

---

## Verification

- `npm run build` — pass
- `npx tsc --noEmit` — pass
- `npx eslint .` — pass
