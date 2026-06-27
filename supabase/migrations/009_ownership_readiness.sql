-- SmartProBonoIP — ownership / agreement readiness (Priority 7)
-- Denormalized intake fields for partner CSV and reporting.

alter table smartprobonoip_answers
  add column if not exists ownership_signal boolean default false,
  add column if not exists contributors_involved text,
  add column if not exists contributor_types text,
  add column if not exists agreement_status text,
  add column if not exists agreement_types text,
  add column if not exists employer_school_grant_flag text;
