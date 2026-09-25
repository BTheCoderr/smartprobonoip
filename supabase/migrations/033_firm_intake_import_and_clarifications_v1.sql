-- Firm intake importer + professional clarification requests.
-- Additive migration for SmartProBonoIP canonical handoff v1.

create table if not exists public.smartprobonoip_intake_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  created_by_user_id uuid not null,
  import_name text not null,
  source_mode text not null check (source_mode in ('paste','text_file')),
  source_filename text,
  raw_text text not null,
  raw_text_sha256 text,
  status text not null default 'parsed'
    check (status in ('parsed','failed','retired')),
  extracted_question_count integer not null default 0
    check (extracted_question_count >= 0),
  parser text not null default 'rule'
    check (parser in ('rule','ai','rule_fallback')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.smartprobonoip_intake_templates
  add column if not exists source_import_id uuid
    references public.smartprobonoip_intake_imports(id) on delete set null;

create table if not exists public.smartprobonoip_clarification_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  referral_id uuid not null references public.organization_referrals(id) on delete cascade,
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  asked_by_user_id uuid not null,
  canonical_key text,
  question_text text not null,
  context_note text,
  status text not null default 'open'
    check (status in ('open','answered','closed')),
  answer_text text,
  answered_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_spbip_intake_imports_org_created
  on public.smartprobonoip_intake_imports(organization_id, created_at desc);

create index if not exists idx_spbip_intake_templates_source_import
  on public.smartprobonoip_intake_templates(source_import_id);

create index if not exists idx_spbip_clarifications_org_referral
  on public.smartprobonoip_clarification_requests(organization_id, referral_id, created_at);

create index if not exists idx_spbip_clarifications_project_status
  on public.smartprobonoip_clarification_requests(project_id, status, created_at);

alter table public.smartprobonoip_intake_imports enable row level security;
alter table public.smartprobonoip_clarification_requests enable row level security;

comment on table public.smartprobonoip_intake_imports is
  'Organization-owned source text used to create intake templates. Importing preserves the professional form instead of replacing it.';
comment on table public.smartprobonoip_clarification_requests is
  'Questions a professional organization sends back to an inventor after an inventor-initiated referral. Questions request facts/clarification only and do not modify inventor facts directly.';
