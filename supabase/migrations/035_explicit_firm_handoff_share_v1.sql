alter table public.smartprobonoip_handoff_sessions
  add column if not exists shared_referral_id uuid
    references public.organization_referrals(id) on delete set null,
  add column if not exists shared_at timestamptz;

create index if not exists idx_spbip_handoff_shared_referral
  on public.smartprobonoip_handoff_sessions(shared_referral_id, shared_at)
  where shared_at is not null;

comment on column public.smartprobonoip_handoff_sessions.shared_at is
  'Explicit inventor-controlled share timestamp. Organization portals must not read handoff answers unless this is set.';
