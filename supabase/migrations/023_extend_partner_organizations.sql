-- Milestone 6: extend partner_organizations as Organization entity (additive)

alter table public.partner_organizations
  add column if not exists slug text,
  add column if not exists registry_partner_id text,
  add column if not exists settings jsonb not null default '{}'::jsonb,
  add column if not exists org_account_enabled boolean not null default false;

create unique index if not exists idx_partner_orgs_slug
  on public.partner_organizations(slug)
  where slug is not null;

create index if not exists idx_partner_orgs_registry_partner
  on public.partner_organizations(registry_partner_id)
  where registry_partner_id is not null;

comment on column public.partner_organizations.registry_partner_id is
  'Optional link to in-app PARTNER_REGISTRY id — does not grant org access by itself.';
comment on column public.partner_organizations.org_account_enabled is
  'When true, org members may receive inventor-initiated referrals via explicit consent.';
