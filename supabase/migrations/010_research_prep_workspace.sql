-- SmartProBonoIP — In-App Research Prep Workspace (Priority 8)
-- User-saved possible similar references per project.

create table if not exists public.smartprobonoip_saved_references (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id     text null,
  partner_slug         text null,
  source               text null,
  campaign             text null,
  reference_title      text null,
  reference_url        text null,
  reference_type       text null,
  search_query_used    text null,
  what_looks_similar   text null,
  what_seems_different text null,
  expert_questions     text null,
  notes                text null,
  comparison_notes     jsonb not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_spb_saved_refs_project
  on public.smartprobonoip_saved_references(project_id);

create index if not exists idx_spb_saved_refs_type
  on public.smartprobonoip_saved_references(reference_type)
  where reference_type is not null;

drop trigger if exists smartprobonoip_saved_references_set_updated_at
  on public.smartprobonoip_saved_references;
create trigger smartprobonoip_saved_references_set_updated_at
  before update on public.smartprobonoip_saved_references
  for each row execute function public.set_updated_at();

comment on table public.smartprobonoip_saved_references is
  'User-saved possible similar references for research prep — not legal conclusions.';

alter table public.smartprobonoip_saved_references enable row level security;
