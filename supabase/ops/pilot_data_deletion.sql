-- SmartProBonoIP — pilot data deletion & retention (ops runbook)
--
-- SINGLE DELETION PATH
-- --------------------
-- Always delete inventions via:
--
--   DELETE FROM public.smartprobonoip_projects WHERE …;
--
-- Postgres `ON DELETE CASCADE` removes child rows, including
-- public.smartprobonoip_project_events. Do NOT run a separate
-- DELETE against the events table (or documents, answers, etc.).
--
-- Session deletion = delete every project currently owned by that
-- pilot_session_id. Do not delete events by their denormalized
-- pilot_session_id column — recovery may leave that column stale.
--
-- Apply only with a verified deletion/export request. Run in a transaction.

begin;

-- ---------------------------------------------------------------------------
-- A) Delete one invention (replace the UUID)
-- ---------------------------------------------------------------------------
-- delete from public.smartprobonoip_projects
-- where id = '00000000-0000-0000-0000-000000000000';

-- ---------------------------------------------------------------------------
-- B) Delete every invention for one pilot session (replace the session id)
-- ---------------------------------------------------------------------------
-- delete from public.smartprobonoip_projects
-- where pilot_session_id = 'replace-with-pilot-session-id';

-- ---------------------------------------------------------------------------
-- C) Retention: remove aged demo inventions (cascade includes project_events)
-- ---------------------------------------------------------------------------
-- delete from public.smartprobonoip_projects
-- where is_demo = true
--   and created_at < now() - interval '30 days';

-- ---------------------------------------------------------------------------
-- D) Retention: expire unused recovery tokens (does not touch events)
-- ---------------------------------------------------------------------------
-- update public.smartprobonoip_recovery_tokens
-- set revoked_at = coalesce(revoked_at, now())
-- where revoked_at is null
--   and (
--     (expires_at is not null and expires_at < now())
--     or (single_use and consumed_at is not null and consumed_at < now() - interval '30 days')
--   );

-- ---------------------------------------------------------------------------
-- E) Post-delete verification — must return 0 orphan timeline events
-- ---------------------------------------------------------------------------
select count(*) as orphan_project_events
from public.smartprobonoip_project_events e
where not exists (
  select 1
  from public.smartprobonoip_projects p
  where p.id = e.project_id
);

-- After deleting a specific invention, this must return 0:
-- select count(*) as surviving_events
-- from public.smartprobonoip_project_events
-- where project_id = '00000000-0000-0000-0000-000000000000';

-- Analytics telemetry uses ON DELETE SET NULL and may retain anonymized rows.
-- That is intentional and is not inventor timeline history.

commit;
