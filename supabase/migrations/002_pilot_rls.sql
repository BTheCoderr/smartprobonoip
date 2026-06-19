-- SmartProBonoIP — pilot RLS migration
-- Run after schema.sql on existing projects.

alter table smartprobonoip_projects
  add column if not exists pilot_session_id uuid,
  add column if not exists is_demo boolean not null default false;

create index if not exists idx_spb_projects_session
  on smartprobonoip_projects(pilot_session_id);

alter table followups enable row level security;

-- Drop permissive MVP policies
do $$
declare t text;
begin
  foreach t in array array[
    'smartprobonoip_projects',
    'smartprobonoip_answers',
    'smartprobonoip_profiles',
    'smartprobonoip_referrals',
    'smartprobonoip_impact_metrics',
    'followups'
  ] loop
    execute format('drop policy if exists "mvp_anon_all" on %I;', t);
  end loop;
end $$;

-- Deny direct anon access; app uses service role via Next.js API routes.
-- No policies are created for anon/authenticated on data tables.
-- Service role bypasses RLS.

comment on column smartprobonoip_projects.pilot_session_id is
  'Browser session UUID; set server-side from x-pilot-session header.';
comment on column smartprobonoip_projects.is_demo is
  'True for demo intakes; excluded from live pilot metrics.';
