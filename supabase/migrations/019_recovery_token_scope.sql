-- SmartProBonoIP — recovery links can restore a whole portfolio, not just one packet.
--
-- 'project' reproduces today's behaviour exactly and stays the default, so every
-- token issued before this migration keeps its original single-packet scope.
-- 'session' is issued by the workspace "save your portfolio" prompt and restores
-- every invention that shared the originating pilot session.

alter table public.smartprobonoip_recovery_tokens
  add column if not exists scope text not null default 'project';

alter table public.smartprobonoip_recovery_tokens
  drop constraint if exists smartprobonoip_recovery_tokens_scope_check;

alter table public.smartprobonoip_recovery_tokens
  add constraint smartprobonoip_recovery_tokens_scope_check
  check (scope in ('project', 'session'));

comment on column public.smartprobonoip_recovery_tokens.scope is
  'project = restore only the linked packet (default, matches pre-existing tokens). session = restore every invention from the same pilot session.';
