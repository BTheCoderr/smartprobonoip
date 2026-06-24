# SmartProBonoIP — IP Readiness Checker

**SmartProBono** is the umbrella platform; **SmartProBonoIP** is its first product, and the **IP Readiness Checker** is its first feature.

> SmartProBonoIP is the digital front door for overlooked inventors.

SmartProBonoIP is an AI-powered IP readiness and referral tool that helps overlooked inventors, creators, students, founders, and small businesses **organize their ideas before they reach** a patent agent, attorney, clinic, nonprofit, or innovation partner.

**It does not replace experts. It helps more people become ready enough to reach them.**

The workflow it proves: **messy idea → guided intake → organized IP Readiness Profile → suggested next resource.**

> ⚠️ This tool is educational only. It never gives legal advice, never says "you need a patent", and never makes legal conclusions. It only uses safe framing ("this may be relevant to…", "consider discussing this with…").

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**No environment variables are required.** With nothing configured, the app runs fully end-to-end using:

- a **local store** (browser `localStorage`) for persistence, and
- a **rule-based generator** for the readiness profile.

To build for production:

```bash
npm run build
npm run start
```

---

## Try the demo (no setup)

Click **Try demo intake** on the product landing or go to `/smartprobonoip/disclaimer?demo=1`.

The demo loads a sample invention (HydroSeal), walks through disclaimer → intake → profile → PDF → dashboard metrics. Demo data is clearly marked and does not pollute live pilot reporting.

---

## Routes

| Route | Description |
| --- | --- |
| `/` | Umbrella **SmartProBono** landing |
| `/smartprobonoip` | Product landing — tagline, positioning, demo CTA |
| `/smartprobonoip/disclaimer` | Legal disclaimer + privacy notice + dual consent |
| `/smartprobonoip/start` | Guided multi-step intake form |
| `/smartprobonoip/profile/[id]` | IP Readiness Profile (editable, PDF export) |
| `/smartprobonoip/dashboard` | Partner dashboard — filters, demo toggle, CSV export |
| `/smartprobonoip/privacy` | Privacy summary + data export/deletion placeholders |
| `/api/generate` | Profile generation (AI if configured, else rule-based) |
| `/api/coach` | AI Packet Coach prep responses (AI if configured, else rule-based) |
| `/api/records` | Session-scoped persistence (Supabase pilot) |
| `/api/partner/metrics` | Partner metrics (requires secret) |
| `/api/partner/export.csv` | Pilot CSV export (requires secret) |

---

## Deploy to Netlify

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import from Git** → select the repo.
3. Build settings (also in `netlify.toml`):
   - Build command: `npm run build`
   - Plugin: `@netlify/plugin-nextjs`
4. Deploy. The app works with **no env vars** (local fallback).
5. For pilot with Supabase, set env vars in Netlify UI (see table below).
6. Follow [`docs/PRODUCTION_CHECKLIST.md`](./docs/PRODUCTION_CHECKLIST.md) before inviting inventors.

### Alternative: Vercel

Connect the same GitHub repo and set the same environment variables. Next.js 16 deploys with zero extra configuration.

---

## Environment variables

| Variable | Required | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Pilot only | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pilot only | Client detects Supabase mode |
| `SUPABASE_SERVICE_ROLE_KEY` | Pilot only | Server API routes (never public) |
| `PARTNER_DASHBOARD_SECRET` | Pilot only | Protects `/api/partner/*` |
| `OPENAI_API_KEY` | No | Optional AI profiles |
| `OPENAI_MODEL` | No | AI model override |
| `NEXT_PUBLIC_APP_URL` | No | Canonical URL in exports |

Copy [`.env.example`](./.env.example) to `.env.local` for local development.

---

## Build phases

1. **Phases 1–6** — MVP: routes, intake, rule-based/AI profiles, Supabase, PDF, dashboard, optional AI.
2. **Phase 7** — Demo mode: sample invention, demo dashboard data, walkthrough checklist.
3. **Phase 8** — Deployment: Netlify config, production checklist, env documentation.
4. **Phase 9** — Pilot safety: tightened RLS, dual consent, privacy page, API-backed writes.
5. **Phase 10** — Pilot workflow: clarity deltas, follow-up placeholders, dashboard filters, CSV export.

---

## Supabase (pilot)

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor.
3. Run [`supabase/migrations/002_pilot_rls.sql`](./supabase/migrations/002_pilot_rls.sql) before real inventor data.
4. Set `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, and `PARTNER_DASHBOARD_SECRET`.

With Supabase configured, inventor data is written via `/api/records` using session-scoped server routes. Partners unlock live metrics on the dashboard with the partner secret.

Without Supabase, the app falls back to `localStorage` on the user's device.

### Schema tables

`users`, `partner_organizations`, `smartprobonoip_projects`, `smartprobonoip_answers`, `smartprobonoip_profiles`, `smartprobonoip_referrals`, `smartprobonoip_impact_metrics`, `followups`.

---

## Optional: AI generation

```bash
OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini
```

When set, `/api/generate` uses AI grounded by the rule-based draft, with safety validation and disclaimer always attached.

---

## AI Packet Coach

On the IP Readiness Packet page, the **AI Packet Coach** helps users clarify their answers, find missing information, and prepare for an expert conversation. It uses the user's actual packet/intake/profile as context — it is not a general chatbot.

- Quick actions: missing information, expert questions, explain my idea, describe differences, development timeline, organize materials, expert handoff summary.
- Users can also type a custom prep question.
- `/api/coach` uses OpenAI when `OPENAI_API_KEY` is set, with a strict safety system prompt and forbidden-language validation; otherwise it returns a rule-based prep response.
- The coach never gives legal advice or legal conclusions, and is stateless (messages are not stored).

---

## Project structure

```
src/
  app/
    api/records/          # Session-scoped CRUD (pilot)
    api/partner/          # Partner metrics + CSV export
    smartprobonoip/       # Product routes
  components/
  lib/
    demo.ts               # Demo invention + sample records
    safety.ts             # Forbidden-phrase guardrails
    store/                # local | API-backed Supabase
supabase/
  schema.sql
  migrations/002_pilot_rls.sql
docs/PRODUCTION_CHECKLIST.md
netlify.toml
```

---

## Safety

All generated copy avoids legal conclusions. The rule-based generator and AI path share a safety filter. The disclaimer appears on the product page, intake gate, profile page, and exported PDF. Dual consent is required before intake, including a confidential-details acknowledgment.

---

## Pilot readiness

Before testing with 10–25 inventors, complete [`docs/PRODUCTION_CHECKLIST.md`](./docs/PRODUCTION_CHECKLIST.md).
