-- SmartProBonoIP — editable development timeline on packet page (Pilot Launch)

alter table public.smartprobonoip_projects
  add column if not exists development_timeline jsonb not null default '{}'::jsonb;

comment on column public.smartprobonoip_projects.development_timeline is
  'User-entered approximate development dates (free text) — preparation only, not legal conclusions.';
