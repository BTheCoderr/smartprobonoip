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

## Routes

| Route | Description |
| --- | --- |
| `/` | Umbrella **SmartProBono** landing that routes into the product |
| `/smartprobonoip` | Product landing — tagline, positioning, core message, CTA |
| `/smartprobonoip/disclaimer` | Legal disclaimer; must be acknowledged before intake |
| `/smartprobonoip/start` | Guided multi-step intake form (with progress indicator) |
| `/smartprobonoip/profile/[id]` | Generated IP Readiness Profile (editable, PDF export) |
| `/smartprobonoip/dashboard` | Partner/admin dashboard with metrics |
| `/api/generate` | API route that returns a readiness profile (AI if configured, else rule-based) |

---

## How it was built (phases)

1. **Phase 1** — Scaffold, all routes, brand UI shell, shared layout/nav/footer, progress indicator and card components.
2. **Phase 2** — Full guided intake form + rule-based (mock) profile generation that works with **no** API keys. Wires start → generate → profile.
3. **Phase 3** — Supabase persistence with graceful local fallback, plus the SQL schema (`supabase/schema.sql`).
4. **Phase 4** — Client-side PDF export of the readiness profile, with the disclaimer embedded in the PDF.
5. **Phase 5** — Partner/admin dashboard metrics.
6. **Phase 6** — Optional AI profile generation when `OPENAI_API_KEY` exists; otherwise rule-based stays the default. AI output is editable and always includes the disclaimer.

---

## Optional: Supabase

Persistence is optional. To enable it:

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor.
3. Set in `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

If both are present the app writes to Supabase; otherwise it falls back to `localStorage`. The dashboard shows which data source is active.

### Schema tables

`users`, `partner_organizations`, `smartprobonoip_projects`, `smartprobonoip_answers`, `smartprobonoip_profiles`, `smartprobonoip_referrals`, `smartprobonoip_impact_metrics`, `followups`.

> The bundled RLS policies are intentionally permissive so the anon key can drive the MVP demo. Tighten them before any real deployment.

## Optional: AI generation

AI is optional. To enable it set:

```bash
OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini   # optional override
```

When set, `/api/generate` asks the model to draft the profile, grounded by the rule-based draft. The response is validated against an allow-list of IP signals/resources, the disclaimer is always re-attached, the public-disclosure flag is computed deterministically, and a safety filter rejects any forbidden legal-conclusion phrasing (falling back to rule-based if it trips).

---

## Project structure

```
src/
  app/
    page.tsx                         # umbrella landing
    smartprobonoip/                  # product routes
    api/generate/route.ts            # profile generation endpoint
  components/                        # UI shell, intake fields, profile view/editor
  lib/
    generateProfile.ts               # rule-based generator
    generateProfileAI.ts             # optional OpenAI generator + safety filter
    metrics.ts                       # dashboard metrics
    pdf.ts                           # client-side PDF export
    store/                           # storage abstraction (supabase | local)
    types.ts                         # shared, fully-typed domain model
supabase/schema.sql                  # database schema
```

---

## Safety

All generated copy avoids legal conclusions. The rule-based generator only emits safe-framing language, and the AI path enforces the same rules with a post-generation filter. The disclaimer appears on the product page, the intake gate, the profile page, and inside the exported PDF.
