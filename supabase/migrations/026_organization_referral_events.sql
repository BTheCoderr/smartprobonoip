-- Milestone 6: append-only organization referral audit trail (no invention narrative)

create table if not exists public.organization_referral_events (
  id              uuid primary key default gen_random_uuid(),
  referral_id     uuid not null references public.organization_referrals(id) on delete cascade,
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  event_type      text not null
    check (event_type in (
      'referral_created',
      'status_changed',
      'snapshot_shared',
      'snapshot_updated',
      'member_access_revoked'
    )),
  actor_type      text not null
    check (actor_type in ('inventor', 'org_member', 'system')),
  actor_id        text,
  prior_status    text,
  new_status      text,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_org_referral_events_referral
  on public.organization_referral_events(referral_id, created_at desc);

create index if not exists idx_org_referral_events_org
  on public.organization_referral_events(organization_id, created_at desc);

alter table public.organization_referral_events enable row level security;
