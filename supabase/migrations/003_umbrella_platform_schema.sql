-- Migration 003: SmartProBono umbrella platform schema
-- Recommended Supabase project: smartprobono-platform
-- Fresh install: run this entire file in the Supabase SQL editor.
-- SmartProBonoIP is the first active venture under the umbrella.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared trigger: updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. ventures
-- ---------------------------------------------------------------------------
create table if not exists public.ventures (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  status      text not null default 'active'
    check (status in ('active', 'inactive', 'planned')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists ventures_set_updated_at on public.ventures;
create trigger ventures_set_updated_at
  before update on public.ventures
  for each row execute function public.set_updated_at();

insert into public.ventures (slug, name, description, status) values
  (
    'smartprobonoip',
    'SmartProBonoIP',
    'AI-powered IP readiness and referral tool for overlooked inventors.',
    'active'
  ),
  (
    'smartprobono_legal',
    'SmartProBono Legal Access',
    'Planned venture for legal access pathways.',
    'planned'
  ),
  (
    'smartprobono_family',
    'SmartProBono Family Support',
    'Planned venture for family support resources.',
    'planned'
  ),
  (
    'smartprobono_business',
    'SmartProBono Business Support',
    'Planned venture for founder and small-business support.',
    'planned'
  ),
  (
    'smartprobono_community',
    'SmartProBono Community Resources',
    'Planned venture for community resource routing.',
    'planned'
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 2. partner_organizations
-- ---------------------------------------------------------------------------
create table if not exists public.partner_organizations (
  id              uuid primary key default gen_random_uuid(),
  venture_id      uuid references public.ventures(id) on delete set null,
  name            text not null,
  organization_type text,
  contact_name    text,
  contact_email   text,
  website         text,
  status          text not null default 'prospect'
    check (status in ('prospect', 'active', 'inactive', 'archived')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_partner_orgs_venture
  on public.partner_organizations(venture_id);

drop trigger if exists partner_organizations_set_updated_at on public.partner_organizations;
create trigger partner_organizations_set_updated_at
  before update on public.partner_organizations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. pilot_sessions
-- ---------------------------------------------------------------------------
create table if not exists public.pilot_sessions (
  id                      uuid primary key default gen_random_uuid(),
  venture_id              uuid references public.ventures(id) on delete set null,
  partner_organization_id uuid references public.partner_organizations(id) on delete set null,
  pilot_session_id        text unique not null,
  label                   text,
  is_demo                 boolean not null default false,
  status                  text not null default 'active'
    check (status in ('active', 'closed', 'archived')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists idx_pilot_sessions_venture
  on public.pilot_sessions(venture_id);
create index if not exists idx_pilot_sessions_external_id
  on public.pilot_sessions(pilot_session_id);

drop trigger if exists pilot_sessions_set_updated_at on public.pilot_sessions;
create trigger pilot_sessions_set_updated_at
  before update on public.pilot_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. smartprobonoip_projects
-- ---------------------------------------------------------------------------
create table if not exists public.smartprobonoip_projects (
  id                      uuid primary key default gen_random_uuid(),
  venture_id              uuid not null references public.ventures(id) on delete restrict,
  pilot_session_id        text not null,
  partner_organization_id uuid references public.partner_organizations(id) on delete set null,
  title                   text,
  item_type               text,
  status                  text not null default 'created'
    check (status in ('created', 'packet_generated', 'archived')),
  is_demo                 boolean not null default false,
  -- App compatibility (server API writes only)
  public_disclosure       boolean not null default false,
  generator               text not null default 'rule',
  location                text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists idx_spb_projects_venture
  on public.smartprobonoip_projects(venture_id);
create index if not exists idx_spb_projects_session
  on public.smartprobonoip_projects(pilot_session_id);
create index if not exists idx_spb_projects_demo
  on public.smartprobonoip_projects(is_demo);

drop trigger if exists smartprobonoip_projects_set_updated_at on public.smartprobonoip_projects;
create trigger smartprobonoip_projects_set_updated_at
  before update on public.smartprobonoip_projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. smartprobonoip_answers
-- ---------------------------------------------------------------------------
create table if not exists public.smartprobonoip_answers (
  id                     uuid primary key default gen_random_uuid(),
  project_id             uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  what_created           text,
  problem_solved         text,
  who_for                text,
  how_it_works           text,
  main_parts             text,
  what_different         text,
  prototype_status       text,
  brand_name_status      text,
  public_sharing_status  text,
  public_sharing_notes   text,
  materials_available    text,
  goals_support_needed   text,
  pro_bono_interest      boolean,
  location               text,
  pre_clarity_score      int check (pre_clarity_score between 1 and 5),
  payload                jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create unique index if not exists idx_spb_answers_project
  on public.smartprobonoip_answers(project_id);

drop trigger if exists smartprobonoip_answers_set_updated_at on public.smartprobonoip_answers;
create trigger smartprobonoip_answers_set_updated_at
  before update on public.smartprobonoip_answers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. smartprobonoip_profiles
-- ---------------------------------------------------------------------------
create table if not exists public.smartprobonoip_profiles (
  id                            uuid primary key default gen_random_uuid(),
  project_id                    uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  plain_language_summary        text,
  possible_ip_signals           jsonb not null default '[]'::jsonb,
  missing_information           jsonb not null default '[]'::jsonb,
  recommended_resources         jsonb not null default '[]'::jsonb,
  expert_questions              jsonb not null default '[]'::jsonb,
  public_disclosure_note        text,
  patent_prep                   jsonb not null default '{}'::jsonb,
  similar_patent_discovery_prep jsonb not null default '{}'::jsonb,
  ai_provider                   text,
  disclaimer                    text,
  payload                       jsonb,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now()
);

create unique index if not exists idx_spb_profiles_project
  on public.smartprobonoip_profiles(project_id);

drop trigger if exists smartprobonoip_profiles_set_updated_at on public.smartprobonoip_profiles;
create trigger smartprobonoip_profiles_set_updated_at
  before update on public.smartprobonoip_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. smartprobonoip_referrals
-- ---------------------------------------------------------------------------
create table if not exists public.smartprobonoip_referrals (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  resource_type text not null,
  resource_label text,
  priority      int,
  rationale     text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_spb_referrals_project
  on public.smartprobonoip_referrals(project_id);

-- ---------------------------------------------------------------------------
-- 8. smartprobonoip_impact_metrics
-- ---------------------------------------------------------------------------
create table if not exists public.smartprobonoip_impact_metrics (
  id                     uuid primary key default gen_random_uuid(),
  project_id             uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pre_clarity_score      int check (pre_clarity_score between 1 and 5),
  post_clarity_score     int check (post_clarity_score between 1 and 5),
  packet_completed       boolean not null default false,
  coach_used             boolean not null default false,
  pdf_downloaded         boolean not null default false,
  referral_ready         boolean not null default false,
  followup_30_completed  boolean not null default false,
  followup_60_completed  boolean not null default false,
  followup_90_completed  boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create unique index if not exists idx_spb_metrics_project
  on public.smartprobonoip_impact_metrics(project_id);

drop trigger if exists smartprobonoip_impact_metrics_set_updated_at on public.smartprobonoip_impact_metrics;
create trigger smartprobonoip_impact_metrics_set_updated_at
  before update on public.smartprobonoip_impact_metrics
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. followups
-- ---------------------------------------------------------------------------
create table if not exists public.followups (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  followup_type text not null,
  due_date      date,
  completed_at  timestamptz,
  notes         text,
  status        text not null default 'pending'
    check (status in ('pending', 'done', 'skipped')),
  created_at    timestamptz not null default now()
);

create index if not exists idx_followups_project
  on public.followups(project_id);
create index if not exists idx_followups_type
  on public.followups(project_id, followup_type);

-- ---------------------------------------------------------------------------
-- 10. venture_documents
-- ---------------------------------------------------------------------------
create table if not exists public.venture_documents (
  id            uuid primary key default gen_random_uuid(),
  venture_id    uuid references public.ventures(id) on delete cascade,
  title         text not null,
  document_type text,
  storage_path  text,
  public_url    text,
  is_sample     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_venture_documents_venture
  on public.venture_documents(venture_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — deny direct client access; use service role via API
-- ---------------------------------------------------------------------------
alter table public.ventures                      enable row level security;
alter table public.partner_organizations         enable row level security;
alter table public.pilot_sessions                enable row level security;
alter table public.smartprobonoip_projects       enable row level security;
alter table public.smartprobonoip_answers        enable row level security;
alter table public.smartprobonoip_profiles       enable row level security;
alter table public.smartprobonoip_referrals      enable row level security;
alter table public.smartprobonoip_impact_metrics enable row level security;
alter table public.followups                     enable row level security;
alter table public.venture_documents             enable row level security;

-- No policies for anon/authenticated on private inventor data.
-- Service role bypasses RLS and is used only in Next.js API routes.

comment on table public.ventures is
  'SmartProBono umbrella ventures/products.';
comment on table public.smartprobonoip_projects is
  'SmartProBonoIP intake projects. Written via /api/records using service role.';
comment on column public.smartprobonoip_projects.pilot_session_id is
  'Browser session id from x-pilot-session header; isolates inventor records.';
comment on column public.smartprobonoip_projects.is_demo is
  'True for demo intakes; excluded from live pilot metrics and CSV export.';
comment on column public.smartprobonoip_answers.payload is
  'Full IntakeAnswers JSON for app round-trip; server-only writes.';
comment on column public.smartprobonoip_profiles.payload is
  'Full ReadinessProfile JSON for app round-trip; server-only writes.';
