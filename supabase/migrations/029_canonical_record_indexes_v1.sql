-- Cover new foreign keys used by canonical record + handoff queries.

create index if not exists idx_spbip_disclosure_timeline_event
  on public.smartprobonoip_disclosure_events(timeline_event_id);
create index if not exists idx_spbip_evidence_links_file
  on public.smartprobonoip_evidence_links(evidence_file_id);
create index if not exists idx_spbip_evidence_links_project
  on public.smartprobonoip_evidence_links(project_id);
create index if not exists idx_spbip_third_party_project
  on public.smartprobonoip_third_party_inputs(project_id);
create index if not exists idx_spbip_intake_templates_partner
  on public.smartprobonoip_intake_templates(partner_organization_id);
create index if not exists idx_spbip_handoff_template
  on public.smartprobonoip_handoff_sessions(template_id);
create index if not exists idx_spbip_handoff_partner
  on public.smartprobonoip_handoff_sessions(partner_organization_id);
create index if not exists idx_spbip_handoff_answers_question
  on public.smartprobonoip_handoff_answers(question_id);
