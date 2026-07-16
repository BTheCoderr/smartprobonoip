-- SmartProBonoIP — lightweight lead management on interest submissions

alter table public.smartprobonoip_interest_leads
  add column if not exists status text not null default 'new',
  add column if not exists priority text not null default 'normal',
  add column if not exists internal_notes text,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists follow_up_at timestamptz;

create index if not exists idx_spb_interest_leads_status
  on public.smartprobonoip_interest_leads(status);

create index if not exists idx_spb_interest_leads_follow_up
  on public.smartprobonoip_interest_leads(follow_up_at);

comment on column public.smartprobonoip_interest_leads.status is
  'Partner workflow status for the lead (new, reviewing, contacted, follow_up, qualified, closed, archived).';
comment on column public.smartprobonoip_interest_leads.priority is
  'Partner triage priority (low, normal, high, urgent).';
comment on column public.smartprobonoip_interest_leads.internal_notes is
  'Private partner notes — not shown to submitters.';
comment on column public.smartprobonoip_interest_leads.last_contacted_at is
  'When the partner last reached out to this lead.';
comment on column public.smartprobonoip_interest_leads.follow_up_at is
  'Optional reminder date for partner follow-up.';
