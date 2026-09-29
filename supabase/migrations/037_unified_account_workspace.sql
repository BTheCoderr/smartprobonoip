-- SmartProBono unified account + Legal workspace foundation.
-- Additive: existing anonymous pilot-session IP records remain valid.

alter function public.set_updated_at()
  set search_path = public, pg_temp;

alter function public.smartprobonoip_rate_limit_hit(text, integer, integer)
  set search_path = public, pg_temp;

alter function public.smartprobonoip_rate_limit_prune()
  set search_path = public, pg_temp;

create table if not exists public.platform_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_matters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  matter_type text not null default 'general'
    check (matter_type in ('general','document','ri_eviction','record_clearing')),
  title text not null,
  jurisdiction text,
  status text not null default 'active'
    check (status in ('active','archived')),
  source_tool text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_artifacts (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references public.legal_matters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  artifact_type text not null
    check (artifact_type in ('document_review','draft','ri_eviction_summary','record_clearing_summary','note')),
  title text not null,
  content jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pilot_sessions
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

alter table public.smartprobonoip_projects
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_platform_profiles_updated
  on public.platform_profiles(updated_at desc);

create index if not exists idx_legal_matters_user_updated
  on public.legal_matters(user_id, updated_at desc);

create index if not exists idx_legal_artifacts_user_created
  on public.legal_artifacts(user_id, created_at desc);

create index if not exists idx_legal_artifacts_matter_created
  on public.legal_artifacts(matter_id, created_at desc);

create index if not exists idx_pilot_sessions_owner_user
  on public.pilot_sessions(owner_user_id)
  where owner_user_id is not null;

create index if not exists idx_spb_projects_owner_user
  on public.smartprobonoip_projects(owner_user_id, created_at desc)
  where owner_user_id is not null;

drop trigger if exists platform_profiles_set_updated_at on public.platform_profiles;
create trigger platform_profiles_set_updated_at
  before update on public.platform_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists legal_matters_set_updated_at on public.legal_matters;
create trigger legal_matters_set_updated_at
  before update on public.legal_matters
  for each row execute function public.set_updated_at();

drop trigger if exists legal_artifacts_set_updated_at on public.legal_artifacts;
create trigger legal_artifacts_set_updated_at
  before update on public.legal_artifacts
  for each row execute function public.set_updated_at();

alter table public.platform_profiles enable row level security;
alter table public.legal_matters enable row level security;
alter table public.legal_artifacts enable row level security;

revoke all on table public.platform_profiles from anon, authenticated;
revoke all on table public.legal_matters from anon, authenticated;
revoke all on table public.legal_artifacts from anon, authenticated;

grant select, insert, update, delete on table public.platform_profiles to authenticated;
grant select, insert, update, delete on table public.legal_matters to authenticated;
grant select, insert, update, delete on table public.legal_artifacts to authenticated;

drop policy if exists "platform_profiles_select_own" on public.platform_profiles;
create policy "platform_profiles_select_own"
  on public.platform_profiles for select
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "platform_profiles_insert_own" on public.platform_profiles;
create policy "platform_profiles_insert_own"
  on public.platform_profiles for insert
  to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "platform_profiles_update_own" on public.platform_profiles;
create policy "platform_profiles_update_own"
  on public.platform_profiles for update
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()))
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "platform_profiles_delete_own" on public.platform_profiles;
create policy "platform_profiles_delete_own"
  on public.platform_profiles for delete
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "legal_matters_select_own" on public.legal_matters;
create policy "legal_matters_select_own"
  on public.legal_matters for select
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "legal_matters_insert_own" on public.legal_matters;
create policy "legal_matters_insert_own"
  on public.legal_matters for insert
  to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "legal_matters_update_own" on public.legal_matters;
create policy "legal_matters_update_own"
  on public.legal_matters for update
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()))
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "legal_matters_delete_own" on public.legal_matters;
create policy "legal_matters_delete_own"
  on public.legal_matters for delete
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "legal_artifacts_select_own" on public.legal_artifacts;
create policy "legal_artifacts_select_own"
  on public.legal_artifacts for select
  to authenticated
  using (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
    and exists (
      select 1 from public.legal_matters m
      where m.id = matter_id and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "legal_artifacts_insert_own" on public.legal_artifacts;
create policy "legal_artifacts_insert_own"
  on public.legal_artifacts for insert
  to authenticated
  with check (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
    and exists (
      select 1 from public.legal_matters m
      where m.id = matter_id and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "legal_artifacts_update_own" on public.legal_artifacts;
create policy "legal_artifacts_update_own"
  on public.legal_artifacts for update
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()))
  with check (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
    and exists (
      select 1 from public.legal_matters m
      where m.id = matter_id and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "legal_artifacts_delete_own" on public.legal_artifacts;
create policy "legal_artifacts_delete_own"
  on public.legal_artifacts for delete
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "pilot_sessions_select_owner" on public.pilot_sessions;
create policy "pilot_sessions_select_owner"
  on public.pilot_sessions for select
  to authenticated
  using ((select auth.uid()) is not null and owner_user_id = (select auth.uid()));

drop policy if exists "smartprobonoip_projects_select_owner" on public.smartprobonoip_projects;
create policy "smartprobonoip_projects_select_owner"
  on public.smartprobonoip_projects for select
  to authenticated
  using ((select auth.uid()) is not null and owner_user_id = (select auth.uid()));
