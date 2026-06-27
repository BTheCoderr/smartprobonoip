-- Priority 4: lightweight partner/source/campaign tracking for pilot partners
-- Run after 005_recovery_tokens.sql on your Supabase project.

alter table public.smartprobonoip_projects
  add column if not exists partner_slug text,
  add column if not exists partner_name text,
  add column if not exists source text,
  add column if not exists campaign text;

alter table public.pilot_sessions
  add column if not exists partner_slug text,
  add column if not exists partner_name text,
  add column if not exists source text,
  add column if not exists campaign text;

create index if not exists idx_spb_projects_partner_slug
  on public.smartprobonoip_projects(partner_slug)
  where partner_slug is not null;

create index if not exists idx_spb_projects_campaign
  on public.smartprobonoip_projects(campaign)
  where campaign is not null;

comment on column public.smartprobonoip_projects.partner_slug is
  'Pilot partner slug from URL param, e.g. rihub, smartprobonoip-ri-pilot';
