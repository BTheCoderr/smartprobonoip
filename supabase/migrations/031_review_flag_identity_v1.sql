-- One canonical generated/review flag per project + trigger code.
-- Allows safe upsert without reopening previously resolved/dismissed flags.

create unique index if not exists uq_spbip_review_flag_project_trigger
  on public.smartprobonoip_review_flags(project_id, trigger_code);
