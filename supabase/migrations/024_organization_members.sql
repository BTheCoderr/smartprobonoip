-- Milestone 6: organization members (Supabase Auth users)

create table if not exists public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  user_id         uuid not null,
  email           text not null,
  role            text not null default 'reviewer'
    check (role in ('admin', 'reviewer')),
  status          text not null default 'active'
    check (status in ('active', 'revoked')),
  invited_at      timestamptz not null default now(),
  joined_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists idx_org_members_user
  on public.organization_members(user_id);

create index if not exists idx_org_members_org
  on public.organization_members(organization_id);

drop trigger if exists organization_members_set_updated_at on public.organization_members;
create trigger organization_members_set_updated_at
  before update on public.organization_members
  for each row execute function public.set_updated_at();

alter table public.organization_members enable row level security;
