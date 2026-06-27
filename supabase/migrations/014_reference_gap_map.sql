-- SmartProBonoIP — reference gap map fields (Pilot Launch analytics sprint)

alter table public.smartprobonoip_saved_references
  add column if not exists gap_map jsonb not null default '{}'::jsonb;

comment on column public.smartprobonoip_saved_references.gap_map is
  'User gap-map prep fields and safe generated output — not legal conclusions.';
