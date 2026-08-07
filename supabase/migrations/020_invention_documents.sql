-- SmartProBonoIP — generated document records per invention.
--
-- Today every artifact is produced in the browser and saved straight to the
-- inventor's device, so the storage columns below stay null and "download"
-- means regenerate. They exist now so that moving artifacts into Supabase
-- Storage later is a backfill, not a schema redesign: set storage_bucket,
-- storage_path, content_type, byte_size and checksum, and readers switch from
-- regenerating to serving the stored object.
--
-- Not merged into public.venture_documents: that table is venture-scoped
-- (venture_id, is_sample, public_url) with no project or pilot session column,
-- so inventor-private artifacts would lose per-session ownership scoping.
-- Column names are kept aligned with it so the two stay recognisably related.

create table if not exists public.smartprobonoip_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,

  title text not null,
  document_type text not null check (
    document_type in (
      'readiness_packet',
      'attorney_brief',
      'attorney_export',
      'intake_summary'
    )
  ),
  file_format text not null check (file_format in ('pdf', 'json', 'csv', 'md')),
  origin text not null default 'generated' check (origin in ('generated', 'uploaded')),

  -- Populated only once an artifact is persisted rather than regenerated.
  storage_bucket text,
  storage_path text,
  public_url text,
  content_type text,
  byte_size bigint,
  checksum text,

  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_spb_documents_project
  on public.smartprobonoip_documents(project_id, created_at desc);

create index if not exists idx_spb_documents_session
  on public.smartprobonoip_documents(pilot_session_id, created_at desc)
  where pilot_session_id is not null;

drop trigger if exists smartprobonoip_documents_set_updated_at
  on public.smartprobonoip_documents;

create trigger smartprobonoip_documents_set_updated_at
  before update on public.smartprobonoip_documents
  for each row execute function public.set_updated_at();

comment on table public.smartprobonoip_documents is
  'Artifacts generated for an invention (packet PDF, attorney export, intake summary). Preparation records only.';
comment on column public.smartprobonoip_documents.origin is
  'generated = produced by the app on demand. uploaded = reserved for inventor uploads, which are not implemented.';
comment on column public.smartprobonoip_documents.storage_path is
  'Null while artifacts are regenerated client-side. Set when the artifact is persisted to Supabase Storage.';
comment on column public.smartprobonoip_documents.title is
  'Human-readable document name. Must not contain invention free text.';

alter table public.smartprobonoip_documents enable row level security;
-- Deny direct anon/authenticated access, matching every other data table.
-- Service role bypasses RLS and is used only in Next.js API routes.

-- Carry over any document milestones already recorded as timeline events by
-- migration 018, so no generated artifact is lost from an inventor's history.
insert into public.smartprobonoip_documents
  (project_id, pilot_session_id, title, document_type, file_format, origin, created_at)
select
  e.project_id,
  e.pilot_session_id,
  case e.metadata ->> 'format'
    when 'packet_pdf' then 'IP Readiness Packet'
    when 'attorney_brief_pdf' then 'One-page professional brief'
    when 'attorney_json' then 'Professional handoff data'
    when 'attorney_csv' then 'Professional handoff data'
  end,
  case e.metadata ->> 'format'
    when 'packet_pdf' then 'readiness_packet'
    when 'attorney_brief_pdf' then 'attorney_brief'
    when 'attorney_json' then 'attorney_export'
    when 'attorney_csv' then 'attorney_export'
  end,
  case e.metadata ->> 'format'
    when 'packet_pdf' then 'pdf'
    when 'attorney_brief_pdf' then 'pdf'
    when 'attorney_json' then 'json'
    when 'attorney_csv' then 'csv'
  end,
  'generated',
  e.occurred_at
from public.smartprobonoip_project_events e
where e.event_type = 'document_generated'
  and e.metadata ->> 'format' in (
    'packet_pdf', 'attorney_brief_pdf', 'attorney_json', 'attorney_csv'
  )
  and not exists (
    select 1
    from public.smartprobonoip_documents d
    where d.project_id = e.project_id
      and d.created_at = e.occurred_at
  );
