-- SmartProBonoIP — newly issued recovery tokens are single-use.
--
-- Backwards compatibility: existing rows get single_use = false and remain
-- reusable until they expire or are revoked. New inserts from the app set
-- single_use = true.
--
-- Atomicity: claim_smartprobonoip_recovery_token locks the token row, validates
-- it, rebinds the project or session, and marks the token consumed in one
-- transaction so two concurrent claims cannot both succeed.

alter table public.smartprobonoip_recovery_tokens
  add column if not exists consumed_at timestamptz;

alter table public.smartprobonoip_recovery_tokens
  add column if not exists single_use boolean not null default false;

comment on column public.smartprobonoip_recovery_tokens.consumed_at is
  'Set when a single-use token is successfully claimed. Null for unused or legacy multi-use tokens.';
comment on column public.smartprobonoip_recovery_tokens.single_use is
  'true = newly issued tokens that burn on first successful claim. false = legacy tokens that remain reusable until expiry or revocation.';

-- Claimable lookup: active, and either multi-use or not yet consumed.
drop index if exists idx_recovery_tokens_hash_active;
create index if not exists idx_recovery_tokens_hash_claimable
  on public.smartprobonoip_recovery_tokens(token_hash)
  where revoked_at is null
    and (single_use = false or consumed_at is null);

create or replace function public.claim_smartprobonoip_recovery_token(
  p_token_hash text,
  p_new_pilot_session_id text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_token public.smartprobonoip_recovery_tokens%rowtype;
  v_project_id uuid;
  v_is_demo boolean;
  v_origin_session text;
  v_scope text;
  v_restored_ids uuid[];
  v_now timestamptz := now();
begin
  if p_token_hash is null or length(btrim(p_token_hash)) = 0 then
    return jsonb_build_object('status', 'invalid');
  end if;

  if p_new_pilot_session_id is null
     or length(btrim(p_new_pilot_session_id)) < 12
     or length(btrim(p_new_pilot_session_id)) > 128 then
    return jsonb_build_object('status', 'invalid');
  end if;

  select *
  into v_token
  from public.smartprobonoip_recovery_tokens
  where token_hash = btrim(p_token_hash)
  for update;

  if not found then
    return jsonb_build_object('status', 'invalid');
  end if;

  if v_token.revoked_at is not null then
    return jsonb_build_object('status', 'invalid');
  end if;

  if v_token.expires_at is null or v_token.expires_at < v_now then
    return jsonb_build_object('status', 'invalid');
  end if;

  if v_token.single_use and v_token.consumed_at is not null then
    return jsonb_build_object('status', 'already_used');
  end if;

  select p.id, p.is_demo, p.pilot_session_id
  into v_project_id, v_is_demo, v_origin_session
  from public.smartprobonoip_projects p
  where p.id = v_token.project_id
  for update;

  if v_project_id is null or v_is_demo then
    return jsonb_build_object('status', 'invalid');
  end if;

  v_scope := coalesce(nullif(v_token.scope, ''), 'project');

  if v_scope = 'session'
     and v_origin_session is not null
     and v_origin_session <> btrim(p_new_pilot_session_id) then
    select coalesce(array_agg(p.id order by p.created_at), array[v_project_id])
    into v_restored_ids
    from public.smartprobonoip_projects p
    where p.pilot_session_id = v_origin_session
      and p.is_demo = false;

    if not (v_project_id = any (v_restored_ids)) then
      v_restored_ids := array_append(v_restored_ids, v_project_id);
    end if;
  else
    v_restored_ids := array[v_project_id];
  end if;

  -- Serialize rebinds across concurrent claims for the same inventions.
  perform 1
  from public.smartprobonoip_projects p
  where p.id = any (v_restored_ids)
  for update;

  update public.smartprobonoip_projects
  set
    pilot_session_id = btrim(p_new_pilot_session_id),
    updated_at = v_now
  where id = any (v_restored_ids);

  update public.smartprobonoip_recovery_tokens
  set
    last_used_at = v_now,
    consumed_at = case
      when v_token.single_use then v_now
      else consumed_at
    end
  where id = v_token.id;

  return jsonb_build_object(
    'status', 'ok',
    'project_id', v_project_id,
    'scope', v_scope,
    'restored_ids', to_jsonb(v_restored_ids),
    'restored_count', coalesce(cardinality(v_restored_ids), 0)
  );
end;
$$;

comment on function public.claim_smartprobonoip_recovery_token(text, text) is
  'Atomically validates a recovery token, rebinds project or session ownership, and consumes single-use tokens. Returns jsonb status: ok | invalid | already_used.';

revoke all on function public.claim_smartprobonoip_recovery_token(text, text) from public;
revoke all on function public.claim_smartprobonoip_recovery_token(text, text) from anon, authenticated;
-- service_role is not the owner and does not keep PUBLIC's default EXECUTE.
grant execute on function public.claim_smartprobonoip_recovery_token(text, text) to service_role;
