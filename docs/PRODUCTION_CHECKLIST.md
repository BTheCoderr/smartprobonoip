# SmartProBonoIP — Production checklist

Use this before showing to pilot partners or deploying for 10–25 inventors.

## Build & code quality

- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npx eslint .` passes (no errors)

## Demo readiness (Phase 7)

- [ ] **Try demo intake** works from product landing and umbrella `/`
- [ ] Demo flow: disclaimer → pre-filled intake → profile → PDF → dashboard
- [ ] Demo data toggle shows realistic metrics without live pilot data
- [ ] Demo records marked `is_demo` and excluded from live CSV export

## Deployment (Phase 8)

- [ ] Repo pushed to GitHub (`BTheCoderr/smartprobonoip`)
- [ ] Netlify site connected to repo; build command `npm run build`
- [ ] `@netlify/plugin-nextjs` installed (see `netlify.toml`)
- [ ] Production URL loads all routes (200): `/`, `/smartprobonoip`, `/disclaimer`, `/start`, `/dashboard`, `/privacy`
- [ ] `/api/generate` returns a profile without env vars (rule-based fallback)
- [ ] App runs with **zero** env vars (localStorage mode) on production URL

### Environment variables (pilot with Supabase)

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (pilot) | Public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (pilot) | Anon key (reads blocked after RLS migration) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (pilot) | Server-only; powers `/api/records` and `/api/partner` |
| `PARTNER_DASHBOARD_SECRET` | Yes (pilot) | Shared with partner admins only |
| `OPENAI_API_KEY` | No | Optional AI profiles |
| `NEXT_PUBLIC_APP_URL` | No | Canonical URL for exports |

### Alternative: Vercel

- Connect the same GitHub repo
- Set identical environment variables
- Next.js 16 deploys with zero extra config

## Pilot safety (Phase 9)

- [ ] `supabase/migrations/002_pilot_rls.sql` applied (removes permissive anon policies)
- [ ] Service role key is **not** in client bundle or `NEXT_PUBLIC_*`
- [ ] Disclaimer shows privacy notice + **two** consent checkboxes
- [ ] Consent includes confidential-details language
- [ ] `/smartprobonoip/privacy` export/deletion placeholders linked from footer
- [ ] Spot-check profiles: no “you need a patent”, “patentable”, or legal conclusions
- [ ] Run Supabase security advisors (dashboard or MCP) and resolve critical findings

## Pilot workflow (Phase 10)

- [ ] Pre/post clarity scores save on profile page
- [ ] Dashboard filters: IP signals, disclosure risk, referral type, clarity improvement
- [ ] Follow-up 30/60/90 placeholders visible in metrics
- [ ] Partner can unlock live data with `PARTNER_DASHBOARD_SECRET`
- [ ] CSV export downloads from dashboard (`/api/partner/export.csv`)

## Smoke test script

1. Open production URL with no login
2. Click **Try demo intake** → acknowledge disclaimer → generate profile
3. Download PDF from profile page
4. Open dashboard → enable demo data → verify metrics
5. (If Supabase configured) Complete a real intake → verify it does not appear for another browser session
6. Unlock partner dashboard → export CSV

## Pilot scope

- Target: **10–25 inventors**
- Not in scope: patent filing, legal advice, marketplace, full user auth
