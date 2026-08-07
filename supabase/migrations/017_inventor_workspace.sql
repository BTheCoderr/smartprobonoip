-- SmartProBonoIP — Inventor Workspace phase 1: portfolio-ready invention rows.
-- Additive only. Every existing project row stays valid without being rewritten.

-- Widen the invention lifecycle. The three original values remain legal, so no
-- existing row changes and no backfill is required for this constraint.
alter table public.smartprobonoip_projects
  drop constraint if exists smartprobonoip_projects_status_check;

alter table public.smartprobonoip_projects
  add constraint smartprobonoip_projects_status_check
  check (
    status in (
      'created',
      'packet_generated',
      'researching',
      'professional_review',
      'archived'
    )
  );

alter table public.smartprobonoip_projects
  add column if not exists archived_at timestamptz;

comment on column public.smartprobonoip_projects.archived_at is
  'Set when an inventor archives an invention from the workspace. Archived inventions stay readable.';

comment on column public.smartprobonoip_projects.status is
  'Inventor-facing lifecycle: created (draft), packet_generated, researching, professional_review, archived.';

comment on column public.smartprobonoip_projects.title is
  'Invention title. Inventor-supplied when provided, otherwise derived from intake answers.';

-- Portfolio listing reads every invention for one pilot session, newest first.
create index if not exists idx_spb_projects_session_created
  on public.smartprobonoip_projects(pilot_session_id, created_at desc);
