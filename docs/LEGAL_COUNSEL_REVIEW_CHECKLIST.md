# Legal Counsel Review Checklist — SmartProBonoIP Pre-Pilot

**Status:** Draft checklist for licensed attorney review  
**Not legal advice.** Nothing in the product copy or this checklist is guaranteed enforceable.  
**Do not merge attorney-facing language as “final” without counsel sign-off.**

Product context: educational IP readiness / preparation tool. No attorney-client relationship. No patentability opinions. Optional AI narrative help. Pilot partners may review aggregated metrics and (with secret) packet summaries.

---

## A. Core liability framework

Review and revise as needed:

- [ ] **As-is / no-warranty** provisions covering software, packets, AI/rule outputs, sample content, and partner materials
- [ ] **Limitation of liability** (direct/indirect/consequential; cap appropriate for pilot)
- [ ] **Indemnification** (user → SmartProBono; optional mutual for partners)
- [ ] **Governing law and venue**
- [ ] **Dispute-resolution terms** (negotiation, arbitration, or court — counsel choice)
- [ ] **Severability / entire agreement / updates to Terms**

Current draft locations (not counsel-approved):

- `src/lib/disclaimer.ts` (`DISCLAIMER`, `TERMS_OF_USE`, privacy notice)
- `src/app/terms/page.tsx` (explicitly marked draft)
- `src/app/privacy/page.tsx`
- `src/app/trust/page.tsx`

---

## B. Pilot / beta limitations

- [ ] Explicit **pilot / beta** status and right to modify or discontinue features
- [ ] **No guarantee of uptime**, export durability, or permanent storage
- [ ] Clear statement that outputs are **educational preparation aids only**
- [ ] **Age and capacity** requirements (e.g., 18+ or parental consent rules for target jurisdictions)
- [ ] Right to suspend accounts/sessions for abuse or security incidents

---

## C. No guarantees — deadlines, filing, confidentiality, results

Flag for counsel to confirm prominence and adequacy:

- [ ] **No guarantee regarding filing deadlines** or statutory bars
- [ ] **No guarantee that use preserves confidentiality** or trade-secret status
- [ ] **No guarantee of patentability, protectability, novelty, non-infringement, or clearance**
- [ ] **No guarantee of funding, clinic acceptance, or partner outcomes**
- [ ] User responsibility to seek **qualified professional review** before disclosure or filing decisions
- [ ] User responsibility for **public disclosures** they make (pitch, social, sales, etc.)

Related product controls (technical, not a substitute for counsel):

- Dual consent on `/disclaimer`
- Forbidden-language filter (`src/lib/safety.ts`)
- PDF / UI “not legal advice” framing

---

## D. Data processing & privacy

- [ ] Roles: controller/processor (or applicable US state-law equivalents) for pilot data
- [ ] **Lawful basis / notice** for intake content, analytics, interest leads, recovery emails
- [ ] Subprocessors disclosure (e.g., Netlify, Supabase, optional OpenAI, optional Resend, GTM/GA4)
- [ ] Retention periods and deletion/export process (today: email request path)
- [ ] International transfer language if any
- [ ] Accuracy of GTM/analytics descriptions vs actual load/event behavior
- [ ] Partner access to metrics/feedback/CSV and inventor expectations

---

## E. Partner / reviewer arrangements

- [ ] **Partner pilot agreement** separate from end-user Terms
- [ ] Restrictions on partners giving legal advice using the product as a vehicle
- [ ] Partner **confidentiality** and data-handling duties
- [ ] Partner **indemnification** for reviewer misconduct
- [ ] Rules for shared `PARTNER_DASHBOARD_SECRET` / future per-partner credentials
- [ ] Attribution / branding limits

---

## F. Marketing, quotes, and testimonials

- [ ] **Quote and testimonial permission** process (written consent, scope, revocation)
- [ ] Restrictions on implying attorney/clinic endorsement without permission
- [ ] Rules for using fictional demo content (e.g., HydroSeal) vs real inventor stories

---

## G. Incident and breach responsibilities

- [ ] Incident response contacts and escalation path
- [ ] Breach notification triggers and timelines under applicable law
- [ ] Evidence preservation expectations
- [ ] Communication templates (user / partner / regulator) — counsel draft

---

## H. Insurance (non-legal but related)

Flag for ops/counsel discussion (not a code task):

- [ ] Cyber liability / tech E&O appropriateness for pilot
- [ ] Coverage exclusions related to IP advice misconceptions

---

## I. Sign-off

| Item | Counsel | Date | Notes |
| --- | --- | --- | --- |
| Terms of use | | | |
| Privacy notice | | | |
| Disclaimer / consent UX copy | | | |
| Partner pilot agreement | | | |
| Limitation of liability / indemnity | | | |
| Breach/incident language | | | |

**Reminder:** Engineering must not present any drafted clause as guaranteed enforceable. Product may continue **fictional testing** under current draft notices; **real inventor pilots** and **public launch** should wait for counsel feedback on sections A–G as prioritized by SmartProBono.
