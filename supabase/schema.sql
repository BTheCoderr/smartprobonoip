-- DEPRECATED for new Supabase projects.
-- Use supabase/umbrella_schema.sql instead (SmartProBono umbrella platform).
-- This legacy file remains for reference only.

-- SmartProBonoIP — legacy database schema (pre-umbrella)
-- For fresh installs, run:
--   1. supabase/umbrella_schema.sql
--   OR supabase/migrations/003_umbrella_platform_schema.sql

create extension if not exists "pgcrypto";

-- Legacy schema retained below for historical reference.
-- Do not use on new Supabase projects.

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
  org_type      text,
  contact_email text,
  location      text,
  created_at    timestamptz not null default now()
);

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
  generator         text not null default 'rule',
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
  status                  text not null default 'suggested',
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
  interval_days int,
  due_at        timestamptz,
  status        text not null default 'pending',
  notes         text,
  created_at    timestamptz not null default now()
);
