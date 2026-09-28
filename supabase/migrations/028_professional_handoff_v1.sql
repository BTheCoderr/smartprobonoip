-- Professional handoff v1: map a founder's canonical factual record into a professional's own intake.

create table if not exists public.smartprobonoip_intake_templates (
  id uuid primary key default gen_random_uuid(),
  partner_organization_id uuid references public.partner_organizations(id) on delete set null,
  organization_name text,
  template_name text not null,
  version text not null default '1',
  source_type text not null default 'manual'
    check (source_type in ('manual','pdf','web_form','api')),
  mapping_status text not null default 'draft'
    check (mapping_status in ('draft','partially_verified','verified','retired')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_intake_questions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.smartprobonoip_intake_templates(id) on delete cascade,
  external_key text,
  section_name text,
  question_text text not null,
  answer_type text not null default 'text'
    check (answer_type in ('text','textarea','boolean','single_select','multi_select','date','number','file','other')),
  required_by_professional boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  display_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_field_mappings (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.smartprobonoip_intake_questions(id) on delete cascade,
  canonical_key text not null,
  mapping_type text not null default 'direct'
    check (mapping_type in ('direct','composite','transform','manual')),
  transform_config jsonb not null default '{}'::jsonb,
  verification_status text not null default 'model_suggested'
    check (verification_status in ('model_suggested','human_verified','rejected')),
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_handoff_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  template_id uuid references public.smartprobonoip_intake_templates(id) on delete set null,
  partner_organization_id uuid references public.partner_organizations(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft','needs_user_input','ready_for_review','approved','exported','cancelled')),
  unresolved_question_count integer not null default 0 check (unresolved_question_count >= 0),
  mapped_question_count integer not null default 0 check (mapped_question_count >= 0),
  approved_at timestamptz,
  exported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_handoff_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.smartprobonoip_handoff_sessions(id) on delete cascade,
  question_id uuid not null references public.smartprobonoip_intake_questions(id) on delete cascade,
  source_canonical_keys text[] not null default '{}',
  answer_value jsonb,
  resolution_method text check (resolution_method in (
    'direct_map','composite_map','user_answered','professional_answered','unresolved'
  )),
  confidence text check (confidence in ('exact','review_required','unresolved')),
  user_approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id, question_id)
);

create table if not exists public.smartprobonoip_handoff_exports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.smartprobonoip_handoff_sessions(id) on delete cascade,
  version integer not null check (version > 0),
  export_format text not null check (export_format in ('pdf','json','csv','md')),
  storage_bucket text,
  storage_path text,
  checksum_sha256 text,
  approved_answer_count integer not null default 0 check (approved_answer_count >= 0),
  generated_at timestamptz not null default now(),
  unique(session_id, version, export_format)
);

create index if not exists idx_spbip_intake_questions_template
  on public.smartprobonoip_intake_questions(template_id, display_order);
create index if not exists idx_spbip_field_mappings_question
  on public.smartprobonoip_field_mappings(question_id);
create index if not exists idx_spbip_handoff_project
  on public.smartprobonoip_handoff_sessions(project_id, status);
create index if not exists idx_spbip_handoff_answers_session
  on public.smartprobonoip_handoff_answers(session_id);

alter table public.smartprobonoip_intake_templates enable row level security;
alter table public.smartprobonoip_intake_questions enable row level security;
alter table public.smartprobonoip_field_mappings enable row level security;
alter table public.smartprobonoip_handoff_sessions enable row level security;
alter table public.smartprobonoip_handoff_answers enable row level security;
alter table public.smartprobonoip_handoff_exports enable row level security;
