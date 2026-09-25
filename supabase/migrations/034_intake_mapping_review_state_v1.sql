alter table public.smartprobonoip_intake_questions
  add column if not exists mapping_disposition text not null default 'unreviewed'
    check (mapping_disposition in ('unreviewed','mapped','firm_only')),
  add column if not exists mapping_notes text;

update public.smartprobonoip_intake_questions q
set mapping_disposition = 'mapped'
where exists (
  select 1
  from public.smartprobonoip_field_mappings m
  where m.question_id = q.id
    and m.verification_status = 'human_verified'
);

create unique index if not exists uq_spbip_field_mapping_question_key
  on public.smartprobonoip_field_mappings(question_id, canonical_key);

comment on column public.smartprobonoip_intake_questions.mapping_disposition is
  'Human review state for imported firm questions. mapped = verified canonical mapping; firm_only = intentionally left for direct user input; unreviewed = not yet approved.';
