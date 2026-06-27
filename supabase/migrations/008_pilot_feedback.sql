-- Priority 5: pilot feedback and resource routing support
-- Run after 007_analytics_events.sql on your Supabase project.

create table if not exists public.smartprobonoip_feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text not null,
  partner_slug text,
  partner_name text,
  source text,
  campaign text,
  clarity_helped text,
  would_bring_to_expert text,
  support_needed text[] not null default '{}'::text[],
  confusion_note text,
  follow_up_requested boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_spb_feedback_project
  on public.smartprobonoip_feedback(project_id);

create index if not exists idx_spb_feedback_partner_slug
  on public.smartprobonoip_feedback(partner_slug)
  where partner_slug is not null;

comment on table public.smartprobonoip_feedback is
  'Pilot user feedback tied to packets. Optional confusion notes stored server-side only.';

alter table public.smartprobonoip_feedback enable row level security;
