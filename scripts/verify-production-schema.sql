-- SmartProBonoIP — read-only production schema verification (migrations 017–026)
-- Run in Supabase Dashboard → SQL Editor (project: smartprobono-platform / aokzlnljfabuvshldstc)
-- Each row: check id, PASS/FAIL, detail

SELECT * FROM (
  SELECT
    'archived_at' AS check_id,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'smartprobonoip_projects'
        AND column_name = 'archived_at'
    ) THEN 'PASS' ELSE 'FAIL' END AS result,
    'column smartprobonoip_projects.archived_at' AS detail

  UNION ALL
  SELECT
    'status_check_5_values',
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_constraint c
      WHERE c.conrelid = 'public.smartprobonoip_projects'::regclass
        AND c.conname = 'smartprobonoip_projects_status_check'
        AND pg_get_constraintdef(c.oid) LIKE '%researching%'
        AND pg_get_constraintdef(c.oid) LIKE '%professional_review%'
    ) THEN 'PASS' ELSE 'FAIL' END,
    coalesce(
      (SELECT pg_get_constraintdef(c.oid)
       FROM pg_constraint c
       WHERE c.conrelid = 'public.smartprobonoip_projects'::regclass
         AND c.conname = 'smartprobonoip_projects_status_check'),
      'constraint missing'
    )

  UNION ALL
  SELECT
    'project_events',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'smartprobonoip_project_events'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'table smartprobonoip_project_events'

  UNION ALL
  SELECT
    'documents',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'smartprobonoip_documents'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'table smartprobonoip_documents'

  UNION ALL
  SELECT
    'routing_preferences',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'smartprobonoip_projects'
        AND column_name = 'routing_preferences'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'column smartprobonoip_projects.routing_preferences'

  UNION ALL
  SELECT
    'organization_members',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'organization_members'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'table organization_members'

  UNION ALL
  SELECT
    'organization_referrals',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'organization_referrals'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'table organization_referrals'

  UNION ALL
  SELECT
    'organization_referral_events',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'organization_referral_events'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'table organization_referral_events'

  UNION ALL
  SELECT
    'claim_recovery_rpc',
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'claim_smartprobonoip_recovery_token'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'function claim_smartprobonoip_recovery_token'

  UNION ALL
  SELECT
    'project_events_backfill',
    CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'smartprobonoip_project_events'
      ) THEN 'FAIL'
      WHEN (SELECT count(*) FROM public.smartprobonoip_project_events) > 0 THEN 'PASS'
      ELSE 'FAIL'
    END,
    CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'smartprobonoip_project_events'
      ) THEN 'table missing'
      ELSE 'row count = ' || (SELECT count(*)::text FROM public.smartprobonoip_project_events)
    END
) checks
ORDER BY check_id;
