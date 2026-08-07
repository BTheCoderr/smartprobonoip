-- Milestone 6: inventor-initiated organization referrals with frozen snapshot

create table if not exists public.organization_referrals (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.partner_organizations(id) on delete cascade,
  project_id          uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  status              text not null default 'received'
    check (status in (
      'received',
      'reviewing',
      'needs_information',
      'completed',
      'declined',
      'referred_elsewhere'
    )),
  shared_snapshot     jsonb not null,
  consent_record      jsonb not null,
  referral_reason     text,
  registry_partner_id text,
  recommendation_id   text,
  first_status_at     timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_org_referrals_org
  on public.organization_referrals(organization_id, created_at desc);

create index if not exists idx_org_referrals_project
  on public.organization_referrals(project_id);

create unique index if not exists idx_org_referrals_org_project
  on public.organization_referrals(organization_id, project_id);

drop trigger if exists organization_referrals_set_updated_at on public.organization_referrals;
create trigger organization_referrals_set_updated_at
  before update on public.organization_referrals
  for each row execute function public.set_updated_at();

alter table public.organization_referrals enable row level security;
