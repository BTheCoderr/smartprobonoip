-- SmartProBonoIP — interest / contact leads (Pilot Launch)
-- Note: 012 is development_timeline; this is 013 per migration order.

create table if not exists public.smartprobonoip_interest_leads (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  email         text not null,
  organization  text,
  role          text,
  interest_type text,
  message       text,
  source        text,
  campaign      text,
  medium        text,
  referrer      text,
  landing_page  text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_spb_interest_leads_created
  on public.smartprobonoip_interest_leads(created_at desc);

comment on table public.smartprobonoip_interest_leads is
  'Partner/pilot interest form submissions — no invention content expected.';

alter table public.smartprobonoip_interest_leads enable row level security;
