-- SmartProBonoIP — invention timeline events.
-- Append-only history shown to the inventor on their own invention.
-- Distinct from smartprobonoip_analytics_events, which is product telemetry and
-- is sanitized/soft-failing; this table is user-facing and must not lose writes.

create table if not exists public.smartprobonoip_project_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  event_type text not null check (
    event_type in (
      'idea_created',
      'materials_recorded',
      'packet_generated',
      'packet_updated',
      'research_reference_added',
      'timeline_updated',
      'document_generated',
      'professional_handoff_prepared',
      'clarity_recorded',
      'status_changed',
      'title_updated',
      'recovered'
    )
  ),
  source text not null default 'system' check (source in ('system', 'user')),
  occurred_at timestamptz not null default now(),
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  -- Stable key for events that must exist at most once per invention. Null for
  -- events that legitimately repeat (exports, reference saves).
  dedupe_key text,
  created_at timestamptz not null default now()
);

create index if not exists idx_spb_project_events_project
  on public.smartprobonoip_project_events(project_id, occurred_at desc);

create index if not exists idx_spb_project_events_session
  on public.smartprobonoip_project_events(pilot_session_id, occurred_at desc)
  where pilot_session_id is not null;

create unique index if not exists idx_spb_project_events_dedupe
  on public.smartprobonoip_project_events(project_id, dedupe_key)
  where dedupe_key is not null;

comment on table public.smartprobonoip_project_events is
  'Inventor-facing invention history. Records preparation milestones only — never legal conclusions.';
comment on column public.smartprobonoip_project_events.detail is
  'Short human-readable note. Must not contain invention free text.';
comment on column public.smartprobonoip_project_events.dedupe_key is
  'Non-null for at-most-once events so backfill and runtime inserts are idempotent.';

alter table public.smartprobonoip_project_events enable row level security;
-- Deny direct anon/authenticated access, matching every other data table.
-- Service role bypasses RLS and is used only in Next.js API routes.

-- Backfill from timestamps we already hold. No values are invented.

insert into public.smartprobonoip_project_events
  (project_id, pilot_session_id, event_type, source, occurred_at, detail, dedupe_key)
select
  p.id,
  p.pilot_session_id,
  'idea_created',
  'system',
  p.created_at,
  'Invention record created from intake.',
  'idea_created'
from public.smartprobonoip_projects p
on conflict do nothing;

insert into public.smartprobonoip_project_events
  (project_id, pilot_session_id, event_type, source, occurred_at, detail, dedupe_key)
select
  p.id,
  p.pilot_session_id,
  'materials_recorded',
  'system',
  p.created_at,
  'Prototype and supporting materials noted during intake.',
  'materials_recorded'
from public.smartprobonoip_projects p
join public.smartprobonoip_answers a on a.project_id = p.id
where a.prototype_status = 'yes'
   or coalesce(a.materials_available, '') <> ''
on conflict do nothing;

insert into public.smartprobonoip_project_events
  (project_id, pilot_session_id, event_type, source, occurred_at, detail, dedupe_key)
select
  p.id,
  p.pilot_session_id,
  'packet_generated',
  'system',
  coalesce(pr.created_at, p.created_at),
  'IP Readiness Packet generated.',
  'packet_generated'
from public.smartprobonoip_projects p
join public.smartprobonoip_profiles pr on pr.project_id = p.id
on conflict do nothing;

insert into public.smartprobonoip_project_events
  (project_id, pilot_session_id, event_type, source, occurred_at, detail, dedupe_key)
select
  r.project_id,
  p.pilot_session_id,
  'research_reference_added',
  'system',
  r.created_at,
  'Possible similar reference saved to the research workspace.',
  'reference:' || r.id::text
from public.smartprobonoip_saved_references r
join public.smartprobonoip_projects p on p.id = r.project_id
on conflict do nothing;

insert into public.smartprobonoip_project_events
  (project_id, pilot_session_id, event_type, source, occurred_at, detail, dedupe_key)
select
  p.id,
  p.pilot_session_id,
  'timeline_updated',
  'system',
  p.updated_at,
  'Development dates added to the invention timeline.',
  'timeline_updated'
from public.smartprobonoip_projects p
where p.development_timeline is not null
  and p.development_timeline <> '{}'::jsonb
on conflict do nothing;

insert into public.smartprobonoip_project_events
  (project_id, pilot_session_id, event_type, source, occurred_at, detail, dedupe_key)
select
  m.project_id,
  p.pilot_session_id,
  'clarity_recorded',
  'system',
  coalesce(m.updated_at, p.created_at),
  'Clarity rating recorded after reviewing the packet.',
  'clarity_recorded'
from public.smartprobonoip_impact_metrics m
join public.smartprobonoip_projects p on p.id = m.project_id
where m.post_clarity_score is not null
on conflict do nothing;
