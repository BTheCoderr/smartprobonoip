# SmartProBonoIP v1.0 Status Matrix

Synced with `table.csv` after app audit (implementation verified by build/lint/tsc).

| Phase / Feature | Vision Description | Current State | Status | Notes |
|-----------------|-------------------|---------------|--------|-------|
| Phase 1: Learn | IP basics, comparisons, risks, costs, mistakes | Interactive `/learn` module (LearnJourney) with 9 expandable topics + Phase 1 journey map; Learn links in intake wizard | **Complete** | Dedicated module at `/learn`. Covers IP comparisons, disclosure risks, ownership, costs/timelines, prototype, mistakes, professional timing. CTAs into packet builder. |
| Phase 2: Prepare | Guided questions with "Why this matters" | Progressive 7-step intake with step-level + field-level collapsible guidance and Learn links per step | **Complete** | `/start` wizard with progress, review step, demo mode, `FieldWhyHelper` on all major fields. |
| Phase 3: Organize | IP Readiness Packet (summary, score, timeline, etc.) | Full packet in sample + generated profiles | **Complete** | Executive summary, readiness score, timeline, materials, ownership, missing info, expert questions — core logic preserved. |
| Phase 4: Research Workspace | Unified searches, saved refs, gap map | ResearchPrepWorkspace + outbound tools in sample + profile | **Complete** | Google Patents, USPTO, WIPO, Espacenet, Lens, Google, Scholar, Trademark, PQAI. Gap map + saved references. |
| Phase 5: Review | Interactive strengthening (missing info, suggestions) | PacketReviewPanel with readiness bar, gaps, improvements | **Complete** | In generated + sample packets. Links to research workspace and after-meeting guide. |
| Phase 6: Export | PDF, JSON, printable + "What to bring" | PDF + JSON/CSV export; labeled buttons; handoff checklist | **Complete** | Profile + sample: "Download IP Readiness Packet" and "Export professional JSON". Printable PDF. |
| Phase 7: Connect | Resource routing (pro bono, clinics, etc.) | ConnectResourcesSection + ResourceRoutingCards | **Complete** | 9 v1 categories on Learn + packet. Signal-based routing preserved. Location-aware = future. |
| Phase 8: After Meeting | Post-conversation guidance | `/after-meeting` + embedded scenarios in packet | **Complete** | Meeting notes template, gather-next, follow-up questions, expert next-step scenarios. |
| Phase 9: Commercialization | Advanced topics | Future-modules section on Learn | **Complete for v1.0** | Licensing, manufacturing, investors, etc. documented as future — not in packet workflow. |
| Institutional Workflows | Pro dashboards, JSON review, metrics | Dashboard + pilot kit + audience pages | **Complete for pilot v1.0** | PDF/JSON review, metrics, demo mode. No marketplace/white-label. |
| Trust Center | Security, privacy, AI scope/limits | Dedicated `/trust` page | **Complete** | Scope, AI, privacy, exports, pilot analytics, contact. Linked site-wide. |
| Product Proof | Screenshots, video, sample preview | Live sample band + UI mocks; no video | **Mostly Complete** | `ProductSamplePreviewBand` → live `/sample`. UI mocks on homepage. Video deferred (stated in UI). |
| Professional Pages | Audience-specific value | `/for-professionals`, `/for/clinics`, `/for/universities` | **Complete** | Problem, value, pilot workflow, limits, CTAs per audience. |
| Pilot Kit | Overview, metrics, etc. | `/pilot` partner launch kit | **Complete** | Tracked links, sample, dashboard demo, outreach, recovery, interest form. |

## Verification

```bash
npm run build
npx tsc --noEmit
npx eslint .
```

## Honest exception

**Product Proof** remains **Mostly Complete** because the vision mentions screenshots/video; v1.0 ships a **live sample packet** and accurate UI mocks instead of a product video or marketing screenshots.
