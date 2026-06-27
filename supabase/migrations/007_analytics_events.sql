-- Priority 4B: first-party product analytics (no third-party trackers)
-- Run after 006_partner_tracking.sql on your Supabase project.

create table if not exists public.smartprobonoip_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  project_id uuid null references public.smartprobonoip_projects(id) on delete set null,
  pilot_session_id text null,
  anonymous_id text null,
  partner_slug text null,
  partner_name text null,
  source text null,
  campaign text null,
  route text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_spb_analytics_event_name
  on public.smartprobonoip_analytics_events(event_name);

create index if not exists idx_spb_analytics_created_at
  on public.smartprobonoip_analytics_events(created_at desc);

create index if not exists idx_spb_analytics_partner_slug
  on public.smartprobonoip_analytics_events(partner_slug)
  where partner_slug is not null;

create index if not exists idx_spb_analytics_project_id
  on public.smartprobonoip_analytics_events(project_id)
  where project_id is not null;

comment on table public.smartprobonoip_analytics_events is
  'First-party SmartProBonoIP analytics. No raw invention text or recovery tokens.';

alter table public.smartprobonoip_analytics_events enable row level security;
