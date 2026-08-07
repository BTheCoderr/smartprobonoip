# Privacy implementation notes — INTERNAL

**Audience:** Engineering and ops fulfilling export/deletion requests.  
**Not linked from the public site.**  
**Last updated:** August 2026

---

## Deletion model (single path)

Inventor data is rooted at `public.smartprobonoip_projects`.

**Always delete inventions by deleting project rows:**

```sql
DELETE FROM public.smartprobonoip_projects WHERE id = :project_id;
-- or, for a whole browser session:
DELETE FROM public.smartprobonoip_projects WHERE pilot_session_id = :session_id;
```

App entry points (same rule):

- `deleteInventionById` → `src/lib/db/deletion.ts`
- `deleteInventionsForSession` → `src/lib/db/deletion.ts`
- Ops runbook → `supabase/ops/pilot_data_deletion.sql`

There is **no** second deletion path. Do **not** run
`DELETE FROM smartprobonoip_project_events` (or other child tables) as part of
fulfilling a request.

---

## `smartprobonoip_project_events`

| Question | Answer |
| --- | --- |
| FK cascade on project delete? | **Yes.** `project_id … REFERENCES smartprobonoip_projects(id) ON DELETE CASCADE` (migration `018_project_events.sql`). |
| Session-level deletion? | Delete all projects for that `pilot_session_id`. Events cascade with those projects. |
| Why not delete events by `pilot_session_id`? | That column is denormalized for listing. Recovery rebinds `projects.pilot_session_id` without rewriting historical event rows, so session-stamped events can be stale. Ownership for deletion is always the **current** project row. |
| Retention / cleanup jobs? | Demo retention and inventor wipes delete **projects** only. Events are included automatically via cascade. See `supabase/ops/pilot_data_deletion.sql` section C. |
| Orphan check | After deletes, `orphan_project_events` in the ops runbook must be `0`. |

Public copy states that activity history stores milestone names and timestamps,
not invention text. Deleting the invention removes that history with it.

---

## Other child tables

Cascade inventory (keep in sync with migrations):
`src/lib/privacy/deletionCascade.ts`.

| Behavior | Tables |
| --- | --- |
| `ON DELETE CASCADE` | answers, profiles, referrals, impact metrics, followups, recovery tokens, feedback, saved references, **project_events**, documents |
| `ON DELETE SET NULL` | `smartprobonoip_analytics_events.project_id` (anonymized telemetry may remain) |

`pilot_sessions` registry rows are not cascaded from projects. Clearing a
session’s inventions does not by itself remove the `pilot_sessions` row; do that
separately only if the deletion request requires it.

---

## Export / deletion requests (pilot)

1. Verify the request (email to privacy contact).
2. Identify `project_id` and/or `pilot_session_id`.
3. Export if requested (project payload via existing record APIs / SQL).
4. Delete via the single path above.
5. Run the orphan-events verification query; expect `0`.
6. Confirm to the requester within a reasonable timeframe (no automated SLA
   unless counsel approves one).

There is still **no** self-serve delete button in the product.

---

## Related public copy

- Privacy notice retention/deletion paragraphs — `src/lib/disclaimer.ts`
- Trust Center privacy points — `TRUST_COPY` in `src/lib/copy.ts`
- Trust facts checklist — `docs/TRUST_FACTS_VERIFICATION.md`
