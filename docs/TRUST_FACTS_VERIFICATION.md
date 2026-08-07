# Trust Facts Verification — INTERNAL ONLY

**Status:** Working checklist for Trust Center copy. Not linked from the public site.  
**Last updated:** July 2026

Use this before asserting any fact in the Trust Center, Privacy page, or partner-facing materials.

---

## Verified from codebase (safe to publish)

| Fact | Evidence |
| --- | --- |
| No public packet directory or feed | Live packets are not listed publicly; `/sample` is fictional demo only |
| Session-scoped access | `x-pilot-session` header required for record APIs; records filtered by `pilot_session_id` |
| Recovery links are capability URLs | Raw token in URL; SHA-256 hash stored server-side; ~90-day expiry; anyone with link can open that packet |
| Partner dashboard gated by secret | `PARTNER_DASHBOARD_SECRET` / `x-partner-secret` on `/api/partner/*` |
| Partner metrics API redacts invention narratives | `redactRecordForPartnerMetrics` in partner metrics response |
| Partner CSV export omits invention descriptions | Export columns are ids, signals, clarity, ownership flags — no `what_created` text |
| Analytics metadata blocks invention text | Allowlist + blocked key patterns in `src/lib/analytics/metadata.ts` |
| GTM excludes private app routes | Profile, recover, dashboard paths excluded from marketing analytics |
| Dual consent warns against highly confidential submissions | `CONSENT_CONFIDENTIAL` on disclaimer gate |
| Optional OpenAI for generate + coach | `OPENAI_API_KEY`; rule-based fallback when unset |
| Supabase RLS deny-by-default for anon | Migrations drop anon policies; app uses service role server-side |
| Not a trade-secret vault | Stated in privacy notice |

---

## Verified from OpenAI published policy (API path — re-check periodically)

| Fact | Source | Notes |
| --- | --- | --- |
| API data not used to train models by default | [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data) | Unless customer explicitly opts in via dashboard |
| API abuse-monitoring logs retained up to 30 days by default | Same | Zero Data Retention (ZDR) is opt-in for eligible orgs |
| Consumer ChatGPT tiers differ from API | OpenAI business data page | SmartProBonoIP uses API only when key is configured |

**Action:** Re-verify OpenAI terms when upgrading SDK, changing endpoints, or before institutional pilots.

---

## Operational facts (document honestly; confirm with ops)

| Topic | Current posture | Trust copy rule |
| --- | --- | --- |
| Encryption in transit | HTTPS via Netlify/hosting | State TLS in transit; do not claim app-level field encryption |
| Encryption at rest | Supabase/platform defaults | State platform provider defaults; do not invent custom encryption |
| Admin / developer access | Supabase service role key holders only | List that ops can access DB rows when Supabase mode is on; no named individuals in public copy |
| Retention / deletion | Email request path; no self-serve delete API. Ops delete via `smartprobonoip_projects` only — `smartprobonoip_project_events` (and other children) cascade. Runbook: `supabase/ops/pilot_data_deletion.sql`; notes: `docs/PRIVACY_IMPLEMENTATION_NOTES.md` | State honestly; no SLA unless counsel approves |
| Local-only mode | `localStorage` on device | Packets stay on device until user exports or uses Supabase pilot mode |

---

## Must NOT assert (legal conclusions)

- Whether using SmartProBonoIP is or is not a **public disclosure** under U.S. patent law
- Inventorship determinations or USPTO AI disclosure duties
- Patentability, novelty, clearance, or filing recommendations
- That any patent professional reviewed, validated, or endorsed the product (without written permission)

---

## Pre-ship checklist

- [ ] Partner metrics API returns redacted records only
- [ ] Trust Center "Who can see what" matches this table
- [ ] OpenAI subprocessor listed in privacy notice when AI enabled
- [ ] Counsel review rows checked in `LEGAL_COUNSEL_REVIEW_CHECKLIST.md`
- [ ] Pending USPTO education cards remain unwired until review sign-off
