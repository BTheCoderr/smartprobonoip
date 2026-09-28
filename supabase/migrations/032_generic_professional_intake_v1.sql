-- Generic professional patent-intake template v1.
-- This is a mapping target, not a legal filing form and not a substitute for a firm's own intake.

alter table public.smartprobonoip_intake_templates
  add column if not exists template_key text;

create unique index if not exists uq_spbip_intake_templates_key
  on public.smartprobonoip_intake_templates(template_key)
  where template_key is not null;

insert into public.smartprobonoip_intake_templates (
  template_key, organization_name, template_name, version, source_type, mapping_status, notes
)
values (
  'patent_professional_core_v1',
  'Generic patent professional',
  'Core invention intake',
  '1',
  'manual',
  'verified',
  'Neutral professional handoff template for factual preparation. Not a law-firm-specific intake and not a filing form.'
)
on conflict (template_key) where template_key is not null
do update set
  organization_name = excluded.organization_name,
  template_name = excluded.template_name,
  version = excluded.version,
  mapping_status = excluded.mapping_status,
  notes = excluded.notes,
  updated_at = now();

with template as (
  select id from public.smartprobonoip_intake_templates
  where template_key = 'patent_professional_core_v1'
),
question_data(external_key, section_name, question_text, answer_type, required_by_professional, display_order) as (
  values
    ('invention_title','Invention','What is the working title of the invention?','text',true,10),
    ('problem_or_need','Invention','What problem or need does the invention address?','textarea',true,20),
    ('detailed_description','Invention','Describe the invention in detail.','textarea',true,30),
    ('components_steps','Invention','What are the key components, steps, or elements?','textarea',true,40),
    ('how_it_works','Invention','How does it work?','textarea',true,50),
    ('best_implementation','Invention','What is the best or preferred implementation you currently know?','textarea',false,60),
    ('alternatives','Invention','What alternatives or variations could also work?','textarea',false,70),
    ('contributors','People','Who contributed, and what did each person contribute?','textarea',true,80),
    ('disclosures','Disclosure','Describe any external sharing, publication, presentation, demo, sale, offer, or use.','textarea',true,90),
    ('funding_resources','Funding and institutions','Identify any funding, employer, school, or institutional resources connected to the work.','textarea',false,100),
    ('agreements','Ownership and agreements','Identify any employment, contractor, founder, assignment, license, NDA, or other relevant agreements.','textarea',false,110),
    ('prior_filings','Prior filings','Identify any prior patent applications or related filings.','textarea',false,120),
    ('known_references','Known references','Identify similar patents, products, publications, or other references already known to you.','textarea',false,130)
)
insert into public.smartprobonoip_intake_questions (
  template_id, external_key, section_name, question_text,
  answer_type, required_by_professional, display_order
)
select
  t.id, q.external_key, q.section_name, q.question_text,
  q.answer_type, q.required_by_professional, q.display_order
from template t
cross join question_data q
where not exists (
  select 1
  from public.smartprobonoip_intake_questions existing
  where existing.template_id = t.id
    and existing.external_key = q.external_key
);

with template as (
  select id from public.smartprobonoip_intake_templates
  where template_key = 'patent_professional_core_v1'
),
mapping_data(external_key, canonical_key, mapping_type) as (
  values
    ('invention_title','project.title','direct'),
    ('problem_or_need','technical.problem_or_need','direct'),
    ('detailed_description','technical.detailed_description','direct'),
    ('components_steps','technical.key_components_or_steps','direct'),
    ('how_it_works','technical.how_it_works','direct'),
    ('best_implementation','technical.best_known_implementation','direct'),
    ('alternatives','technical.alternatives_variations','direct'),
    ('contributors','contributors.collection','composite'),
    ('disclosures','disclosure_events.collection','composite'),
    ('funding_resources','funding_sources.collection','composite'),
    ('agreements','ownership_relationships.collection','composite'),
    ('prior_filings','prior_applications.collection','composite'),
    ('known_references','saved_references.collection','composite')
)
insert into public.smartprobonoip_field_mappings (
  question_id, canonical_key, mapping_type, verification_status, verified_by, verified_at
)
select
  q.id, m.canonical_key, m.mapping_type, 'human_verified', 'SmartProBonoIP canonical v1', now()
from template t
join public.smartprobonoip_intake_questions q on q.template_id = t.id
join mapping_data m on m.external_key = q.external_key
where not exists (
  select 1 from public.smartprobonoip_field_mappings existing
  where existing.question_id = q.id
    and existing.canonical_key = m.canonical_key
);
