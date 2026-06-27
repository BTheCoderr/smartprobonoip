-- Priority 9: recovery token expiry hardening (pilot default 90 days in app)
-- Does not alter existing rows; new tokens always receive expires_at from the API.

comment on column public.smartprobonoip_recovery_tokens.expires_at is
  'Required for active recovery links. App sets 90-day pilot expiry on create; null expires_at is rejected on claim.';
