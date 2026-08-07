-- Milestone 4: session-scoped routing UI preferences (dismissed recommendations).
-- Projects are already scoped to pilot_session_id — no separate session table needed.

alter table public.smartprobonoip_projects
  add column if not exists routing_preferences jsonb not null default '{}'::jsonb;

comment on column public.smartprobonoip_projects.routing_preferences is
  'Per-project routing UI state for the owning pilot session (e.g. dismissed recommendation ids).';
