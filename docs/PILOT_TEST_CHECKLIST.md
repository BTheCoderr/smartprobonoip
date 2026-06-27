# SmartProBonoIP — Pilot Test Checklist

Internal checklist for end-to-end pilot verification. Preparation only — not legal advice.

## Packet and research workspace

- [ ] Generate a live (non-demo) packet from `/smartprobonoip/start`
- [ ] Open `/smartprobonoip/profile/[id]` and scroll to **Similar Reference Search Prep**
- [ ] Confirm query cards, **Save reference** form, and saved references list are visible
- [ ] Copy a query and open Google Patents / USPTO / web search links
- [ ] Save a possible similar reference with title, type, and notes
- [ ] Refresh the page — saved reference remains
- [ ] Download PDF — saved reference appears under **Saved Similar References**
- [ ] Use **Help me compare this reference** — output uses safe prep language only

## Session isolation and recovery

- [ ] Open packet UUID in fresh incognito without recovery — blocked (404 / not found)
- [ ] Create recovery link on original session
- [ ] Open recovery link in incognito — packet loads
- [ ] Saved references accessible after recovery claim
- [ ] Wrong session cannot load `/api/research/[projectId]` (404)

## Partner dashboard and export

- [ ] `/smartprobonoip/dashboard` requires partner secret to unlock
- [ ] Failed unlock does not leak packet data
- [ ] CSV export uses `x-partner-secret` header only (no secret in URL)
- [ ] Dashboard metrics exclude demo packets

## Feedback and analytics

- [ ] Pilot feedback submits on packet page
- [ ] Analytics events store safe metadata only (no raw invention text, emails, or tokens)
- [ ] Research events fire: `research_workspace_viewed`, `reference_saved`, `query_copied`, `comparison_helper_used`

## Build verification

- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npx eslint .` passes
