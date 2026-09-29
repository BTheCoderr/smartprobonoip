-- SmartProBono least-privilege hardening for browser database roles.
-- Existing IP/org/research data stays server-only through Next.js service-role APIs.
-- Authenticated browser CRUD remains only on account-owned workspace tables.

do $$
declare
  t record;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename not in (
        'platform_profiles',
        'legal_matters',
        'legal_artifacts'
      )
  loop
    execute format('revoke all privileges on table public.%I from anon, authenticated', t.tablename);
  end loop;
end
$$;

-- Keep the account-owned tables explicit and minimal.
revoke all privileges on table public.platform_profiles from anon, authenticated;
revoke all privileges on table public.legal_matters from anon, authenticated;
revoke all privileges on table public.legal_artifacts from anon, authenticated;

grant select, insert, update, delete on table public.platform_profiles to authenticated;
grant select, insert, update, delete on table public.legal_matters to authenticated;
grant select, insert, update, delete on table public.legal_artifacts to authenticated;

-- Trigger helpers do not need to be callable from browser roles.
revoke execute on function public.set_updated_at() from anon, authenticated;
