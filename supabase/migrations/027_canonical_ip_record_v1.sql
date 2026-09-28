-- Canonical IP Record v1: normalized factual preparation layer.
-- Additive: preserves existing SmartProBonoIP project/answer/profile tables.

alter table public.smartprobonoip_projects
  add column if not exists canonical_schema_version text not null default '1.0',
  add column if not exists readiness_mode text not null default 'factual_completeness'
    check (readiness_mode in ('factual_completeness'));

comment on column public.smartprobonoip_projects.canonical_schema_version is
  'Version of the normalized SmartProBonoIP factual record schema.';
comment on column public.smartprobonoip_projects.readiness_mode is
  'Readiness measures factual completeness only; never patentability.';

create table if not exists public.smartprobonoip_technical_disclosures (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  problem_or_need text,
  detailed_description text,
  key_components_or_steps text,
  how_it_works text,
  how_to_make text,
  how_to_use text,
  advantages_improvements text,
  alternatives_variations text,
  best_known_implementation text,
  drawings_available boolean,
  prototype_status text check (prototype_status in ('yes','no','unknown')),
  prototype_location text,
  prototype_tested text check (prototype_tested in ('yes','no','unknown')),
  prototype_test_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_screening (
  project_id uuid primary key references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  other_contributors_known text check (other_contributors_known in ('yes','no','unknown')),
  external_disclosure_known text check (external_disclosure_known in ('yes','no','unknown')),
  upcoming_disclosure_known text check (upcoming_disclosure_known in ('yes','no','unknown')),
  sale_or_offer_known text check (sale_or_offer_known in ('yes','no','unknown')),
  external_use_known text check (external_use_known in ('yes','no','unknown')),
  external_funding_known text check (external_funding_known in ('yes','no','unknown')),
  institution_resources_known text check (institution_resources_known in ('yes','no','unknown')),
  third_party_materials_known text check (third_party_materials_known in ('yes','no','unknown')),
  assignment_relationship_known text check (assignment_relationship_known in ('yes','no','unknown')),
  prior_filing_known text check (prior_filing_known in ('yes','no','unknown')),
  known_reference_known text check (known_reference_known in ('yes','no','unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_contributors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  legal_first_name text,
  legal_middle_name text,
  legal_last_name text,
  email text,
  phone text,
  employer_affiliation text,
  position_department text,
  other_affiliations text,
  contribution_description text,
  contribution_started_on date,
  contribution_ended_on date,
  user_identified_role text check (user_identified_role in ('contributor','possible_inventor','unknown')),
  residence_city text,
  residence_region text,
  residence_country text,
  mailing_address_json jsonb,
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_timeline_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  event_type text not null,
  event_date date,
  date_precision text check (date_precision in ('exact','month','year','approximate','unknown')),
  anticipated boolean not null default false,
  date_documented boolean,
  description text,
  organization text,
  location_or_channel text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_disclosure_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  timeline_event_id uuid references public.smartprobonoip_timeline_events(id) on delete set null,
  event_type text not null check (event_type in (
    'publication','website_post','oral_presentation','poster','demo',
    'external_discussion','sale_offer','sale','external_use',
    'investor_pitch','customer_pitch','other'
  )),
  event_date date,
  date_precision text check (date_precision in ('exact','month','year','approximate','unknown')),
  anticipated boolean not null default false,
  what_was_shared text,
  audience_description text,
  access_scope text check (access_scope in ('named_people','limited_group','general_public','unknown')),
  confidentiality_basis text check (confidentiality_basis in (
    'written_nda','other_written_restriction','oral_confidentiality','none_known','unknown'
  )),
  location_or_channel text,
  reference_title text,
  submission_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_funding_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  source_type text check (source_type in (
    'federal','state_local_government','university','company',
    'foundation','sbir_sttr','personal','other','unknown'
  )),
  sponsor_name text,
  grant_contract_number text,
  awardee_entity text,
  start_date date,
  end_date date,
  institution_resources_used text check (institution_resources_used in ('yes','no','unknown')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_third_party_inputs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  provider_name text,
  input_description text,
  agreement_type text check (agreement_type in ('mta','license','sra','nda','collaboration','other','unknown')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_ownership_relationships (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  relationship_type text check (relationship_type in (
    'employee','contractor','founder','university_affiliate','sponsor','assignee','licensee','other'
  )),
  party_name text,
  agreement_type text check (agreement_type in (
    'employment_ip','contractor_ip','assignment','license',
    'sponsored_research','joint_research','other','unknown'
  )),
  obligation_to_assign_reported text check (obligation_to_assign_reported in ('yes','no','unknown')),
  effective_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_prior_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  application_type text check (application_type in (
    'provisional','nonprovisional_utility','pct','foreign','design','other','unknown'
  )),
  application_number text,
  authority_country text,
  filing_date date,
  title text,
  relationship_type text check (relationship_type in (
    'related_subject_matter','domestic_benefit','foreign_priority','continuation_family','unknown'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_evidence_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  storage_bucket text not null default 'smartprobonoip-evidence',
  storage_path text not null,
  original_filename text not null,
  mime_type text,
  size_bytes bigint,
  checksum_sha256 text,
  evidence_type text check (evidence_type in (
    'drawing','photo','video','email','presentation','paper','notebook',
    'agreement','prototype_record','search_result','other'
  )),
  document_date date,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_evidence_links (
  id uuid primary key default gen_random_uuid(),
  evidence_file_id uuid not null references public.smartprobonoip_evidence_files(id) on delete cascade,
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  canonical_key text,
  relation_label text,
  created_at timestamptz not null default now()
);

create table if not exists public.smartprobonoip_review_flags (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smartprobonoip_projects(id) on delete cascade,
  pilot_session_id text,
  trigger_code text not null,
  flag_type text not null check (flag_type in (
    'missing_information','needs_user_clarification',
    'professional_review_recommended','date_sensitive_professional_review',
    'firm_question'
  )),
  subject_type text,
  subject_id uuid,
  canonical_key text,
  factual_basis jsonb not null default '{}'::jsonb,
  user_message text,
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.smartprobonoip_saved_references
  add column if not exists reference_identifier text,
  add column if not exists publication_date date,
  add column if not exists how_found text,
  add column if not exists user_notes text;

insert into storage.buckets (id, name, public)
values ('smartprobonoip-evidence', 'smartprobonoip-evidence', false)
on conflict (id) do update set public = false;

create index if not exists idx_spbip_technical_project on public.smartprobonoip_technical_disclosures(project_id);
create index if not exists idx_spbip_contributors_project on public.smartprobonoip_contributors(project_id);
create index if not exists idx_spbip_timeline_project_date on public.smartprobonoip_timeline_events(project_id, event_date);
create index if not exists idx_spbip_disclosure_project_date on public.smartprobonoip_disclosure_events(project_id, event_date);
create index if not exists idx_spbip_funding_project on public.smartprobonoip_funding_sources(project_id);
create index if not exists idx_spbip_ownership_project on public.smartprobonoip_ownership_relationships(project_id);
create index if not exists idx_spbip_prior_apps_project on public.smartprobonoip_prior_applications(project_id);
create index if not exists idx_spbip_evidence_project on public.smartprobonoip_evidence_files(project_id);
create index if not exists idx_spbip_review_project_status on public.smartprobonoip_review_flags(project_id, status);

alter table public.smartprobonoip_technical_disclosures enable row level security;
alter table public.smartprobonoip_screening enable row level security;
alter table public.smartprobonoip_contributors enable row level security;
alter table public.smartprobonoip_timeline_events enable row level security;
alter table public.smartprobonoip_disclosure_events enable row level security;
alter table public.smartprobonoip_funding_sources enable row level security;
alter table public.smartprobonoip_third_party_inputs enable row level security;
alter table public.smartprobonoip_ownership_relationships enable row level security;
alter table public.smartprobonoip_prior_applications enable row level security;
alter table public.smartprobonoip_evidence_files enable row level security;
alter table public.smartprobonoip_evidence_links enable row level security;
alter table public.smartprobonoip_review_flags enable row level security;

insert into public.smartprobonoip_technical_disclosures (
  project_id, pilot_session_id, problem_or_need, detailed_description,
  key_components_or_steps, how_it_works, advantages_improvements, prototype_status
)
select
  p.id, p.pilot_session_id, a.problem_solved, a.what_created,
  a.main_parts, a.how_it_works, a.what_different,
  case when a.prototype_status in ('yes','no') then a.prototype_status else 'unknown' end
from public.smartprobonoip_projects p
join public.smartprobonoip_answers a on a.project_id = p.id
on conflict (project_id) do nothing;

insert into public.smartprobonoip_screening (
  project_id, pilot_session_id, other_contributors_known,
  external_disclosure_known, external_funding_known,
  institution_resources_known, assignment_relationship_known,
  upcoming_disclosure_known, sale_or_offer_known, external_use_known,
  third_party_materials_known, prior_filing_known, known_reference_known
)
select
  p.id,
  p.pilot_session_id,
  case when a.contributors_involved = 'solo' then 'no'
       when a.contributors_involved is null then 'unknown' else 'yes' end,
  case when a.public_sharing_status = 'none' then 'no'
       when a.public_sharing_status is null then 'unknown' else 'yes' end,
  case when a.employer_school_grant_flag = 'yes' then 'yes'
       when a.employer_school_grant_flag = 'no' then 'no' else 'unknown' end,
  case when a.employer_school_grant_flag = 'yes' then 'yes'
       when a.employer_school_grant_flag = 'no' then 'no' else 'unknown' end,
  case when a.agreement_status = 'yes' then 'yes'
       when a.agreement_status in ('no','not_applicable') then 'no' else 'unknown' end,
  'unknown','unknown','unknown','unknown','unknown',
  case when exists (
    select 1 from public.smartprobonoip_saved_references r where r.project_id = p.id
  ) then 'yes' else 'unknown' end
from public.smartprobonoip_projects p
left join public.smartprobonoip_answers a on a.project_id = p.id
on conflict (project_id) do nothing;
