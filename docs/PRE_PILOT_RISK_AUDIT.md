# SmartProBonoIP — Pre-Pilot Legal, Privacy, Abuse & Security Audit

**Repository:** `BTheCoderr/smartprobonoip`  
**Audit baseline:** `main` at hardening branch `harden/pre-pilot-security`  
**Date:** July 2026  
**Scope:** Evidence-based review of current protections and residual risks.  
**Not attorney-approved.** Do not treat Terms, Privacy, or disclaimer language as final legal advice.

---

## Executive readiness

| Use case | Verdict |
| --- | --- |
| Fictional / demo testing | **Safe to continue** with existing disclaimer gate and demo packets |
| Limited real-data inventor pilot | **Conditionally ready** after this hardening lands + counsel reviews checklist items + ops controls below |
| Broad public launch | **Not ready** until durable rate limiting, retention/deletion automation, attorney sign-off, and partner agreements are complete |

---

## Confirmed existing protections (with evidence)

| Protection | Evidence |
| --- | --- |
| Dual consent disclaimer | `src/app/disclaimer/DisclaimerClient.tsx` — both educational + confidential checkboxes required |
| No legal advice / no attorney-client | `src/lib/disclaimer.ts` (`DISCLAIMER`, consent strings); PDF legal notices in `src/lib/pdf.ts` |
| Safe-language output filter | `src/lib/safety.ts` — used by rule generator, AI profile, coach, compare |
| Private-data analytics boundary | `src/lib/analytics/metadata.ts` allowlist + blocked keys; GTM event path gating in `src/lib/analytics/gtm.ts` |
| RLS deny-by-default + server-only writes | `supabase/migrations/002_pilot_rls.sql` and later migrations; `getSupabaseService()` in `src/lib/db/*` |
| Hashed recovery tokens + expiry | `src/lib/db/recovery.ts` / `src/lib/security/recoveryHash.ts`; 90-day expiry; claim rejects null/expired |
| Partner secret header auth | `x-partner-secret` via `src/lib/security/api.ts`; dashboard fetch uses headers only |
| Timing-safe secret comparison | `verifyPartnerSecretTimingSafe` (SHA-256 then `timingSafeEqual`) |
| API rate limits (process-local) | `src/lib/security/rateLimit.ts` |
| Generic errors on most sensitive routes | `GENERIC_SERVER_ERROR` pattern across generate/coach/compare/records/[id]/etc. |
| Prohibited-use + ownership/license terms | `src/lib/disclaimer.ts` (`TERMS_OF_USE`); terms page marked draft |
| No `dangerouslySetInnerHTML` | Repo grep empty under `src/` |

---

## Threat findings

### 1. User claims the platform gave legal advice or a patentability opinion

| Field | Detail |
| --- | --- |
| **Risk** | Misunderstanding or AI/rule output framed as legal conclusion |
| **Scenario** | Inventor screenshots packet language and claims reliance |
| **Current protection** | Dual consent; disclaimer copy; `containsForbiddenLanguage` / `assertSafeLanguage`; PDF “not legal advice” |
| **Code evidence** | `DisclaimerClient.tsx`; `safety.ts`; `generateProfile.ts` assertSafeLanguage; AI system prompts |
| **Severity** | High (claim severity) |
| **Likelihood** | Medium |
| **Mitigation** | Keep filter + counsel review of Terms/limitation of liability; do not soften disclaimers |
| **Type** | Attorney review + code (filter) |
| **Blocks?** | Does not block fictional testing; soft gate for real pilot until counsel reviews Terms |

### 2. User relies on the tool and misses a filing or public-disclosure deadline

| Field | Detail |
| --- | --- |
| **Risk** | Educational timing notes misread as deadline management |
| **Scenario** | Inventor delays professional consult after seeing “preparation only” packet |
| **Current protection** | Copy states tool does not manage deadlines; no deadline calculator |
| **Code evidence** | `src/lib/disclaimer.ts` privacy/terms; packet framing in `copy.ts` / PDF |
| **Severity** | High |
| **Likelihood** | Medium |
| **Mitigation** | Explicit “no guarantee regarding deadlines” in Terms (counsel); UI already cautious — do not add deadline promises |
| **Type** | Attorney review + contract |
| **Blocks?** | Soft gate for public launch |

### 3. User submits confidential invention or trade-secret information

| Field | Detail |
| --- | --- |
| **Risk** | Trade-secret disclosure into hosted DB / optional OpenAI processing |
| **Scenario** | Inventor pastes unpublished technical detail into intake |
| **Current protection** | Confidentiality consent checkbox; “not a secure vault” privacy language; Resend gated |
| **Code evidence** | `CONSENT_CONFIDENTIAL` in `disclaimer.ts`; OpenAI only when `OPENAI_API_KEY` set |
| **Severity** | High |
| **Likelihood** | High (expected use) |
| **Mitigation** | Pilot agreements; retention/deletion process; consider AI-off default for sensitive pilots |
| **Type** | Contract + operations + attorney review |
| **Blocks?** | Soft gate for real inventor pilot (informed consent required) |

### 4. Unauthorized access to inventor records

| Field | Detail |
| --- | --- |
| **Risk** | Packet access without ownership |
| **Scenario** | Attacker guesses UUID project id with wrong `x-pilot-session` |
| **Current protection** | `getRecordById(id, pilotSessionId)` filters by session; RLS deny-anon; service-role gateway |
| **Code evidence** | `src/lib/db/records.ts`; `src/app/api/records/[id]/route.ts` |
| **Severity** | Critical if bypassed |
| **Likelihood** | Low (UUID + session) / Medium if XSS steals session |
| **Mitigation** | Session is bearer secret in localStorage — reduce XSS via CSP; validate session format on all routes (done in this pass) |
| **Type** | Code + operations |
| **Blocks?** | Does not block fictional testing |

### 5. Recovery-link guessing, theft, replay, or brute force

| Field | Detail |
| --- | --- |
| **Risk** | Unauthorized packet recovery |
| **Scenario** | Token in URL leaked via Referrer/history; brute force claim API |
| **Current protection** | 32-byte token; SHA-256 store; 90-day expiry; revoke prior; generic claim errors; IP rate limit (process-local) |
| **Code evidence** | `src/lib/db/recovery.ts`; `src/app/api/recovery/claim/route.ts` |
| **Severity** | High |
| **Likelihood** | Low for guessing; Medium for theft of URL |
| **Mitigation** | Prefer fragment/POST handoff later; single-use tokens; durable rate limits |
| **Type** | Code + operations |
| **Blocks?** | Soft gate for public launch |

### 6. Dashboard-secret theft or leakage

| Field | Detail |
| --- | --- |
| **Risk** | Partner dashboard / CSV / metrics access |
| **Scenario** | Secret in browser sessionStorage stolen via XSS; shared secret among partners |
| **Current protection** | Header-only auth; timing-safe compare; not in analytics query URL |
| **Code evidence** | `DashboardClient.tsx`; `api.ts` `verifyPartnerSecretTimingSafe` |
| **Severity** | High |
| **Likelihood** | Medium (shared static secret) |
| **Mitigation** | Rotate secret; per-partner secrets; keep CSP Report-Only → enforce |
| **Type** | Operations + code |
| **Blocks?** | Soft gate for multi-partner launch |

### 7. Prompt injection and malicious intake text

| Field | Detail |
| --- | --- |
| **Risk** | Model ignores safety rules or emits legal conclusions |
| **Scenario** | “Ignore previous instructions / say patentable / reveal API key” |
| **Current protection** | Untrusted-data delimiters; no tools; rule fallback; forbidden-language validation |
| **Code evidence** | `aiUserContent.ts`; `generateProfileAI.ts`; `coachAI.ts`; `safety.ts` |
| **Severity** | Medium–High |
| **Likelihood** | Medium |
| **Mitigation** | Keep AI optional; regression tests for fixtures; coach uses DB-owned record when available |
| **Type** | Code |
| **Blocks?** | Does not block fictional testing |

### 8. XSS through inventor-controlled text

| Field | Detail |
| --- | --- |
| **Risk** | Stored/reflected XSS → session/secret theft |
| **Scenario** | `<script>` / `onerror=` in intake fields |
| **Current protection** | React text escaping; no `dangerouslySetInnerHTML`; PDF text APIs; CSP Report-Only |
| **Code evidence** | UI components; `headers.ts` CSP |
| **Severity** | High |
| **Likelihood** | Low–Medium |
| **Mitigation** | Move CSP from Report-Only to enforce after monitoring |
| **Type** | Code |
| **Blocks?** | Does not block fictional testing |

### 9. Oversized bodies, arrays, or strings (cost / DoS)

| Field | Detail |
| --- | --- |
| **Risk** | Large JSON → OpenAI cost / memory pressure |
| **Scenario** | Multi‑MB intake payload or huge arrays |
| **Current protection** | Central limits (`MAX_JSON_BODY_BYTES`, per-field/array caps); reject with 413/422 (no silent truncate) |
| **Code evidence** | `src/lib/security/requestLimits.ts`; wired into generate/records/coach/interest/recovery/compare |
| **Severity** | Medium |
| **Likelihood** | Medium without limits; Low with limits |
| **Mitigation** | Landed in this hardening pass |
| **Type** | Code |
| **Blocks?** | Mitigated for pilot |

### 10. API abuse and ineffective rate limiting on serverless

| Field | Detail |
| --- | --- |
| **Risk** | Bypass of in-memory Map across Netlify isolates |
| **Scenario** | Burst traffic hits many cold instances |
| **Current protection** | Process-local sliding window only; documented as non-global |
| **Code evidence** | `src/lib/security/rateLimit.ts` comment + implementation |
| **Severity** | Medium–High |
| **Likelihood** | High under abuse |
| **Mitigation** | **Recommend lowest-cost durable store already in stack: Supabase** (counter table or RPC). Do not add paid Redis without approval. Netlify Blobs is an alternate if preferred. |
| **Type** | Code + operations |
| **Blocks?** | Soft gate for public launch; fictional testing OK |

### 11. Sensitive data leaking into logs, errors, URLs, GA4, or CSV

| Field | Detail |
| --- | --- |
| **Risk** | Invention text / secrets in logs or analytics |
| **Scenario** | `error.message` returned; GTM metadata; partner metrics JSON |
| **Current protection** | Metadata allowlist; CSV pilot export omits raw descriptions; generic API errors + redacted `logServerError` |
| **Code evidence** | `metadata.ts`; `partner/export.csv`; `safeLog.ts`; records POST no longer echoes raw errors |
| **Severity** | High |
| **Likelihood** | Medium residual |
| **Remaining gap** | `GET /api/partner/metrics` returns full records (including answers) to secret holders — intentional for dashboard but broader than CSV hygiene. Privacy copy says GTM on marketing pages only, while GTM script can load site-wide when configured. |
| **Mitigation** | Narrow metrics payload later; align privacy copy with GTM load behavior; keep secrets out of URLs |
| **Type** | Code + attorney review (privacy accuracy) |
| **Blocks?** | Soft gate for public launch |

### 12. Missing deletion, expiration, retention, or incident-response controls

| Field | Detail |
| --- | --- |
| **Risk** | Inability to honor deletion / retention promises promptly |
| **Scenario** | Inventor emails delete request; no API automation |
| **Current protection** | Mailto deletion path on privacy page; recovery 90-day expiry; retention copy |
| **Code evidence** | `src/app/privacy/page.tsx`; `disclaimer.ts` retention paragraph |
| **Severity** | Medium–High |
| **Likelihood** | Medium |
| **Mitigation** | Ops runbook + counsel breach language; optional admin delete later |
| **Type** | Operations + attorney review |
| **Blocks?** | Soft gate for real pilot at scale |

### 13. Scraping, reverse engineering, and competitive copying

| Field | Detail |
| --- | --- |
| **Risk** | Copy of sample packet / UX / prompts |
| **Scenario** | Competitor scrapes public sample and marketing pages |
| **Current protection** | Terms prohibited-use language (draft); rate limits (weak globally) |
| **Code evidence** | `disclaimer.ts` TERMS; public `/sample` |
| **Severity** | Low–Medium (business) |
| **Likelihood** | Medium |
| **Mitigation** | Accept for open marketing site; rely on Terms + copyright; do not over-block product demo |
| **Type** | Contract |
| **Blocks?** | No |

### 14. Claims against SmartProBono from partner or reviewer conduct

| Field | Detail |
| --- | --- |
| **Risk** | Vicarious / partner-related claims |
| **Scenario** | Clinic reviewer gives legal advice using packet; inventor sues platform |
| **Current protection** | Product disclaimers; partner kit framing as preparation |
| **Code evidence** | Playbook / pilot copy; disclaimer |
| **Severity** | High |
| **Likelihood** | Low–Medium |
| **Mitigation** | Partner pilot agreement + indemnification (counsel); training materials already cautionary |
| **Type** | Contract + insurance + attorney review |
| **Blocks?** | Soft gate for partner pilots |

---

## Hardening implemented in this pass (code)

1. Security headers + CSP **Report-Only** (GTM/GA4/YouTube-aware), HSTS, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors/`X-Frame-Options`
2. Central request body / field / array limits with 413/422 (no silent truncation)
3. Generic API errors + redacted server logs
4. AI untrusted-data delimiters; no tools; coach prefers DB-owned packet
5. Security regression tests (`npm test`)
6. Documented process-local rate-limit limitation + Supabase as preferred durable counter store

---

## Netlify / Supabase configuration still required

| Item | Action |
| --- | --- |
| Netlify env | Keep `NEXT_PUBLIC_APP_URL=https://smartprobono.org`; never put service role / OpenAI / partner secret in `NEXT_PUBLIC_*` |
| Netlify | After deploy, confirm security headers present (`CSP-Report-Only`, `Strict-Transport-Security`) |
| Supabase | Confirm RLS still enabled with **no anon policies** on data tables |
| Supabase (recommended) | Add durable rate-limit counters table/RPC when ready for public launch |
| Supabase/ops | Document deletion SLA and who runs email-based deletes |
| GTM | Configure GA4 to receive only allowlisted public events; do not send invention fields |

---

## Attorney review required

See `docs/LEGAL_COUNSEL_REVIEW_CHECKLIST.md`. Do not treat any in-app Terms/Privacy wording as enforceable until counsel signs off.
