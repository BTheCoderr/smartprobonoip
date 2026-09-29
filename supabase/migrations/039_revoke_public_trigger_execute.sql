-- Remove PostgreSQL's default PUBLIC execution grant from the trigger helper.
-- Table triggers continue to invoke this function internally.

revoke execute on function public.set_updated_at() from public;
