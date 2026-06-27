# SmartProBonoIP — Production checklist

Use this before showing to pilot partners or deploying for 10–25 inventors.

## Build & code quality

- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npx eslint .` passes (no errors)

## Demo readiness (Phase 7)

- [ ] **Try demo intake** works from product landing and umbrella `/`
- [ ] Demo flow: disclaimer → pre-filled intake → IP Readiness Packet → packet PDF → dashboard
- [ ] Demo data toggle shows realistic metrics without live pilot data
- [ ] Demo records marked `is_demo` and excluded from live CSV export

## IP Readiness Packet

- [ ] Profile page is titled **Your IP Readiness Packet**
- [ ] Button reads **Download IP Readiness Packet**
- [ ] Packet PDF downloads successfully (filename `smartprobonoip-ip-readiness-packet-*.pdf`)
- [ ] Packet PDF includes: cover page, plain-language summary, readiness snapshot, missing-info checklist, public-sharing/disclosure note, expert conversation prep, suggested next resources, 30/60/90 day plan, and full disclaimer
- [ ] Cover page shows idea label, date, and "Educational readiness tool. Not legal advice."
- [ ] On-screen packet shows readiness snapshot and 30/60/90 day plan
- [ ] No forbidden legal-advice phrases appear in the packet (no "need a patent", "patentable", "you should file", "protectable")

### Patent Prep Mode

- [ ] Packet (screen + PDF) includes a **Patent Prep Mode** section
- [ ] Patent prep checklist lists: what created, problem, main parts, how parts work together, process/workflow, prototype status, supporting materials, public sharing status, user-described differences
- [ ] Development timeline shows fillable date placeholders (idea started, first written/sketched, first prototype, first shared, first pitched/sold/demoed, major improvements)
- [ ] Possible difference map table renders with the note "These are user-described differences only. A professional would need to review whether they matter legally."
- [ ] Drawings and materials checklist renders (sketches, diagrams, flowcharts, wireframes, screenshots, prototype photos, code/technical notes, testing notes, customer/pitch notes)
- [ ] Expert handoff summary renders as the final prep section before the disclaimer
- [ ] Patent Prep Mode uses safe framing only ("If patent protection may be relevant…", "Consider organizing…", "A professional may want to review…") — no legal conclusions

### AI Packet Coach

- [ ] Packet page shows an **AI Packet Coach** section after the generated packet (view mode)
- [ ] All quick-action buttons (including patent search prep) return a helpful, packet-specific prep response
- [ ] Typing a custom prep question returns a response
- [ ] Responses reference the user's actual answers (not generic chatbot output)
- [ ] Rule-based fallback works with no `OPENAI_API_KEY` set (response tagged "Prep guide")
- [ ] When `OPENAI_API_KEY` is set, responses are tagged "AI-assisted" and still safe
- [ ] No forbidden legal-advice phrases appear in any coach response
- [ ] Coach is stateless — refreshing the page clears the conversation

### Similar Patent Discovery Prep

- [ ] Packet page shows **Similar Patent Discovery Prep** after Patent Prep Mode
- [ ] Search keywords are generated from intake answers and IP signals
- [ ] 3–5 suggested search queries appear with safe educational framing
- [ ] Google Patents and USPTO Patent Public Search links are present (with suggested query text)
- [ ] Similar reference worksheet table renders on-screen and in PDF
- [ ] Expert prep questions for similar references are present
- [ ] AI Packet Coach includes 5 patent search prep quick actions
- [ ] No patentability, novelty, clearance, or infringement conclusions appear
- [ ] Safe framing only: "possible similar references", "search terms to try", "not a legal conclusion"

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

- [ ] `supabase/umbrella_schema.sql` applied on project `smartprobono-platform` (RLS enabled; no anon policies on inventor data)
- [ ] Service role key is **not** in client bundle or `NEXT_PUBLIC_*` (enforced at build time via `server-only` import in `src/lib/supabaseServer.ts` and `src/lib/db/records.ts`)
- [ ] Partner API routes (`/api/partner/*`) return 503 when Supabase is unconfigured and 401 without the secret
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

## Supabase persistence (pilot)

- [ ] Non-demo intake (no `?demo=1`) creates rows in `smartprobonoip_projects`, `smartprobonoip_answers`, `smartprobonoip_profiles`, and `smartprobonoip_impact_metrics`
- [ ] `pilot_sessions` row created for browser session (`x-pilot-session` header)
- [ ] Post-clarity score saves via `PATCH /api/records/[id]`
- [ ] Packet PDF still downloads after Supabase save
- [ ] Partner dashboard shows live non-demo records when secret is entered
- [ ] CSV export includes live non-demo records only (`is_demo = false`)
- [ ] Demo records stay separate (`is_demo = true` or localStorage demo mode)
- [ ] Another browser/incognito session cannot read a private packet (`GET /api/records/[id]` returns 404 without matching session)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not in client bundle (grep build output / source for `NEXT_PUBLIC_*SERVICE*`)

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
