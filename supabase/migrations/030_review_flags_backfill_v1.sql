-- Backfill canonical review flags for existing SmartProBonoIP records.
-- These are preparation/review states only, never legal conclusions.

insert into public.smartprobonoip_review_flags (
  project_id, pilot_session_id, trigger_code, flag_type,
  canonical_key, factual_basis, user_message
)
select
  p.id,
  p.pilot_session_id,
  'AUTO_CONTRIBUTORSHIP',
  case
    when s.other_contributors_known = 'yes' then 'professional_review_recommended'
    else 'needs_user_clarification'
  end,
  'people.contributions',
  jsonb_build_object(
    'contributorsInvolved', a.contributors_involved,
    'contributorTypes', a.contributor_types
  ),
  case
    when s.other_contributors_known = 'yes'
      then 'More than one person may have contributed to the technical work. Preserve what each person contributed for professional review.'
    else 'Contributor details are not clear yet. Add who helped and what they contributed before professional review.'
  end
from public.smartprobonoip_projects p
join public.smartprobonoip_screening s on s.project_id = p.id
left join public.smartprobonoip_answers a on a.project_id = p.id
where s.other_contributors_known in ('yes','unknown')
  and not exists (
    select 1 from public.smartprobonoip_review_flags f
    where f.project_id = p.id and f.trigger_code = 'AUTO_CONTRIBUTORSHIP'
  );

insert into public.smartprobonoip_review_flags (
  project_id, pilot_session_id, trigger_code, flag_type,
  canonical_key, factual_basis, user_message
)
select
  p.id,
  p.pilot_session_id,
  'AUTO_EXTERNAL_DISCLOSURE',
  'professional_review_recommended',
  'disclosure.events',
  jsonb_build_object('publicSharingStatus', a.public_sharing_status),
  'You reported sharing information outside your private team. Preserve what was shared, when, with whom, and any confidentiality terms for professional review.'
from public.smartprobonoip_projects p
join public.smartprobonoip_screening s on s.project_id = p.id
left join public.smartprobonoip_answers a on a.project_id = p.id
where s.external_disclosure_known = 'yes'
  and not exists (
    select 1 from public.smartprobonoip_review_flags f
    where f.project_id = p.id and f.trigger_code = 'AUTO_EXTERNAL_DISCLOSURE'
  );

insert into public.smartprobonoip_review_flags (
  project_id, pilot_session_id, trigger_code, flag_type,
  canonical_key, factual_basis, user_message
)
select
  p.id,
  p.pilot_session_id,
  'AUTO_FUNDING_RIGHTS',
  'professional_review_recommended',
  'funding.sources',
  jsonb_build_object('institutionRelationship', a.employer_school_grant_flag),
  'You reported an employer, school, grant, or institutional relationship. Preserve the related funding, resource, and agreement details for professional review.'
from public.smartprobonoip_projects p
join public.smartprobonoip_screening s on s.project_id = p.id
left join public.smartprobonoip_answers a on a.project_id = p.id
where s.institution_resources_known = 'yes'
  and not exists (
    select 1 from public.smartprobonoip_review_flags f
    where f.project_id = p.id and f.trigger_code = 'AUTO_FUNDING_RIGHTS'
  );

insert into public.smartprobonoip_review_flags (
  project_id, pilot_session_id, trigger_code, flag_type,
  canonical_key, factual_basis, user_message
)
select
  p.id,
  p.pilot_session_id,
  'AUTO_ASSIGNMENT_OWNERSHIP',
  case
    when s.assignment_relationship_known = 'yes' then 'professional_review_recommended'
    else 'needs_user_clarification'
  end,
  'ownership.relationships',
  jsonb_build_object(
    'agreementStatus', a.agreement_status,
    'agreementTypes', a.agreement_types
  ),
  case
    when s.assignment_relationship_known = 'yes'
      then 'You reported an agreement that may address inventions or IP. Preserve the agreement for professional review.'
    else 'The agreement or ownership facts are not clear yet. Record any employment, contractor, founder, school, or funding agreements you know about.'
  end
from public.smartprobonoip_projects p
join public.smartprobonoip_screening s on s.project_id = p.id
left join public.smartprobonoip_answers a on a.project_id = p.id
where s.assignment_relationship_known in ('yes','unknown')
  and not exists (
    select 1 from public.smartprobonoip_review_flags f
    where f.project_id = p.id and f.trigger_code = 'AUTO_ASSIGNMENT_OWNERSHIP'
  );
