-- Priority 2: packet recovery tokens (hash-only storage)
-- Run after umbrella_schema.sql on your Supabase project.

create table if not exists public.smartprobonoip_recovery_tokens (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  token_hash   text not null,
  email        text,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz,
  last_used_at timestamptz,
  revoked_at   timestamptz
);

create index if not exists idx_recovery_tokens_project
  on public.smartprobonoip_recovery_tokens(project_id);

create index if not exists idx_recovery_tokens_hash_active
  on public.smartprobonoip_recovery_tokens(token_hash)
  where revoked_at is null;

comment on table public.smartprobonoip_recovery_tokens is
  'Hashed recovery tokens for SmartProBonoIP packet access. Raw tokens are never stored.';

alter table public.smartprobonoip_recovery_tokens enable row level security;
