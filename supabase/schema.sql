-- SmartProBonoIP — database schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- All app tables are prefixed with `smartprobonoip_`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- People & partners
-- ---------------------------------------------------------------------------
create table if not exists users (
  id           uuid primary key default gen_random_uuid(),
  email        text unique,
  display_name text,
  location     text,
  created_at   timestamptz not null default now()
);

create table if not exists partner_organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  org_type      text,                -- e.g. law_school_clinic, patent_pro_bono, ptrc, accelerator
  contact_email text,
  location      text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Intake projects
-- ---------------------------------------------------------------------------
create table if not exists smartprobonoip_projects (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references users(id) on delete set null,
  pilot_session_id  uuid,
  is_demo           boolean not null default false,
  title             text,
  idea_summary      text,
  item_type         text,
  public_disclosure boolean not null default false,
  location          text,
  generator         text not null default 'rule',  -- 'rule' | 'ai'
  created_at        timestamptz not null default now()
);

create table if not exists smartprobonoip_answers (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references smartprobonoip_projects(id) on delete cascade,
  payload    jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists smartprobonoip_profiles (
  id                    uuid primary key default gen_random_uuid(),
  project_id            uuid not null references smartprobonoip_projects(id) on delete cascade,
  payload               jsonb not null,
  signals               text[] not null default '{}',
  recommended_resources text[] not null default '{}',
  generator             text not null default 'rule',
  created_at            timestamptz not null default now()
);

create table if not exists smartprobonoip_referrals (
  id                      uuid primary key default gen_random_uuid(),
  project_id              uuid not null references smartprobonoip_projects(id) on delete cascade,
  partner_organization_id uuid references partner_organizations(id) on delete set null,
  resource_category       text not null,
  referral_type           text,
  status                  text not null default 'suggested',  -- suggested | sent | accepted | closed
  created_at              timestamptz not null default now()
);

create table if not exists smartprobonoip_impact_metrics (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references smartprobonoip_projects(id) on delete cascade,
  pre_clarity  int check (pre_clarity between 1 and 5),
  post_clarity int check (post_clarity between 1 and 5),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists followups (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references smartprobonoip_projects(id) on delete cascade,
  interval_days int,                 -- 30 | 60 | 90
  due_at        timestamptz,
  status        text not null default 'pending',  -- pending | done | skipped
  notes         text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_spb_answers_project on smartprobonoip_answers(project_id);
create index if not exists idx_spb_profiles_project on smartprobonoip_profiles(project_id);
create index if not exists idx_spb_referrals_project on smartprobonoip_referrals(project_id);
create index if not exists idx_spb_metrics_project on smartprobonoip_impact_metrics(project_id);
create index if not exists idx_spb_followups_project on followups(project_id);
create index if not exists idx_spb_projects_session on smartprobonoip_projects(pilot_session_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- For pilot: run supabase/migrations/002_pilot_rls.sql after this schema.
-- Fresh installs: RLS is enabled below; migration removes permissive policies.
-- ---------------------------------------------------------------------------
alter table smartprobonoip_projects       enable row level security;
alter table smartprobonoip_answers        enable row level security;
alter table smartprobonoip_profiles       enable row level security;
alter table smartprobonoip_referrals      enable row level security;
alter table smartprobonoip_impact_metrics enable row level security;
alter table followups                     enable row level security;

-- MVP local dev only: permissive policies (removed by 002_pilot_rls.sql for production)
do $$
declare t text;
begin
  foreach t in array array[
    'smartprobonoip_projects',
    'smartprobonoip_answers',
    'smartprobonoip_profiles',
    'smartprobonoip_referrals',
    'smartprobonoip_impact_metrics'
  ] loop
    execute format('drop policy if exists "mvp_anon_all" on %I;', t);
    execute format(
      'create policy "mvp_anon_all" on %I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
