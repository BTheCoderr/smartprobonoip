/**
 * Read-only production schema verification for migrations 017–026.
 *
 * Usage (pick one auth method):
 *
 *   # Management API (recommended when CLI link is broken)
 *   SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=aokzlnljfabuvshldstc \
 *     npx tsx scripts/verify-production-schema.ts
 *
 *   # Direct Postgres (requires psql on PATH)
 *   DATABASE_URL=postgresql://... npx tsx scripts/verify-production-schema.ts
 *
 *   # Supabase CLI (requires linked project + IPv4 pooler)
 *   npx tsx scripts/verify-production-schema.ts --cli
 *
 * Incremental deploy gate (after applying migration N, stop if unexpected):
 *   npm run verify:production-schema -- --migration 017
 *
 * Full gate before app deploy:
 *   npm run verify:production-schema -- --strict
 *
 * Exit code 0 = checks match expected state; 1 = unexpected FAIL or auth missing.
 */

import { execFileSync } from "node:child_process";

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF?.trim() || "aokzlnljfabuvshldstc";

/** Migration version that first satisfies each check (019/023 have no dedicated checks). */
export const MIGRATION_ORDER = [
  "017",
  "018",
  "019",
  "020",
  "021",
  "022",
  "023",
  "024",
  "025",
  "026",
] as const;

export type MigrationVersion = (typeof MIGRATION_ORDER)[number];

/** Cumulative PASS count after each migration is applied successfully. */
export const EXPECTED_PASS_AFTER: Record<MigrationVersion, number> = {
  "017": 2,
  "018": 4,
  "019": 4,
  "020": 5,
  "021": 6,
  "022": 7,
  "023": 7,
  "024": 8,
  "025": 9,
  "026": 10,
};

interface CheckDef {
  id: string;
  label: string;
  sql: string;
  /** First migration that should make this check PASS. */
  introducedBy: MigrationVersion;
}

export const CHECKS: CheckDef[] = [
  {
    id: "archived_at",
    label: "smartprobonoip_projects.archived_at column exists",
    introducedBy: "017",
    sql: `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'smartprobonoip_projects'
        AND column_name = 'archived_at'
    ) AS pass`,
  },
  {
    id: "status_check_5_values",
    label: "smartprobonoip_projects.status CHECK includes 5 lifecycle values",
    introducedBy: "017",
    sql: `SELECT CASE
      WHEN pg_get_constraintdef(c.oid) LIKE '%researching%'
       AND pg_get_constraintdef(c.oid) LIKE '%professional_review%'
      THEN true ELSE false
    END AS pass
    FROM pg_constraint c
    WHERE c.conrelid = 'public.smartprobonoip_projects'::regclass
      AND c.conname = 'smartprobonoip_projects_status_check'`,
  },
  {
    id: "project_events",
    label: "smartprobonoip_project_events table exists",
    introducedBy: "018",
    sql: `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'smartprobonoip_project_events'
    ) AS pass`,
  },
  {
    id: "documents",
    label: "smartprobonoip_documents table exists",
    introducedBy: "020",
    sql: `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'smartprobonoip_documents'
    ) AS pass`,
  },
  {
    id: "routing_preferences",
    label: "smartprobonoip_projects.routing_preferences column exists",
    introducedBy: "022",
    sql: `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'smartprobonoip_projects'
        AND column_name = 'routing_preferences'
    ) AS pass`,
  },
  {
    id: "organization_members",
    label: "organization_members table exists",
    introducedBy: "024",
    sql: `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'organization_members'
    ) AS pass`,
  },
  {
    id: "organization_referrals",
    label: "organization_referrals table exists",
    introducedBy: "025",
    sql: `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'organization_referrals'
    ) AS pass`,
  },
  {
    id: "organization_referral_events",
    label: "organization_referral_events table exists",
    introducedBy: "026",
    sql: `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'organization_referral_events'
    ) AS pass`,
  },
  {
    id: "claim_recovery_rpc",
    label: "claim_smartprobonoip_recovery_token RPC exists",
    introducedBy: "021",
    sql: `SELECT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'claim_smartprobonoip_recovery_token'
    ) AS pass`,
  },
  {
    id: "project_events_backfill",
    label: "smartprobonoip_project_events backfill count > 0",
    introducedBy: "018",
    sql: `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'smartprobonoip_project_events'
    ) AND (SELECT count(*)::int FROM public.smartprobonoip_project_events) > 0 AS pass`,
  },
];

export function migrationIndex(version: MigrationVersion): number {
  return MIGRATION_ORDER.indexOf(version);
}

export function checkShouldPass(
  check: CheckDef,
  atMigration: MigrationVersion,
): boolean {
  return migrationIndex(check.introducedBy) <= migrationIndex(atMigration);
}

export function parseArgs(argv: string[]): {
  useCli: boolean;
  strict: boolean;
  atMigration: MigrationVersion | null;
} {
  const useCli = argv.includes("--cli");
  const strict = argv.includes("--strict");
  let atMigration: MigrationVersion | null = null;

  const migrationFlagIndex = argv.findIndex((arg) => arg === "--migration");
  if (migrationFlagIndex !== -1) {
    const value = argv[migrationFlagIndex + 1]?.trim();
    if (value && MIGRATION_ORDER.includes(value as MigrationVersion)) {
      atMigration = value as MigrationVersion;
    }
  }

  return { useCli, strict, atMigration };
}

export function evaluateResults(
  results: Array<{ check: CheckDef; pass: boolean }>,
  options: { atMigration: MigrationVersion | null; strict: boolean },
): {
  passCount: number;
  expectedPassCount: number | null;
  unexpectedFailures: CheckDef[];
  exitCode: number;
  summaryLine: string;
} {
  const passCount = results.filter((r) => r.pass).length;
  const expectedPassCount = options.atMigration
    ? EXPECTED_PASS_AFTER[options.atMigration]
    : options.strict
      ? CHECKS.length
      : null;

  const unexpectedFailures: CheckDef[] = [];
  if (options.atMigration) {
    for (const { check, pass } of results) {
      if (checkShouldPass(check, options.atMigration) && !pass) {
        unexpectedFailures.push(check);
      }
    }
  } else if (options.strict) {
    for (const { check, pass } of results) {
      if (!pass) unexpectedFailures.push(check);
    }
  } else {
    for (const { check, pass } of results) {
      if (!pass) unexpectedFailures.push(check);
    }
  }

  let summaryLine: string;
  let exitCode: number;

  if (options.atMigration) {
    const expected = EXPECTED_PASS_AFTER[options.atMigration];
    const ok =
      passCount === expected && unexpectedFailures.length === 0;
    summaryLine = ok
      ? `${passCount}/${CHECKS.length} PASS (expected ${expected}/${CHECKS.length} after migration ${options.atMigration}) — gate OK. Proceed to next migration.`
      : `${passCount}/${CHECKS.length} PASS (expected ${expected}/${CHECKS.length} after migration ${options.atMigration}) — STOP. Do not continue.`;
    exitCode = ok ? 0 : 1;
  } else if (passCount === CHECKS.length) {
    summaryLine = `${passCount}/${CHECKS.length} PASS — all migrations 017–026 verified.`;
    exitCode = 0;
  } else {
    summaryLine = `${passCount}/${CHECKS.length} PASS — migrations 017–026 not fully applied. Use --migration N after each apply, or --strict before app deploy.`;
    exitCode = 1;
  }

  return {
    passCount,
    expectedPassCount,
    unexpectedFailures,
    exitCode,
    summaryLine,
  };
}

function readKeychainToken(): string | null {
  try {
    return execFileSync(
      "security",
      ["find-generic-password", "-s", "Supabase CLI", "-w"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    return null;
  }
}

async function queryManagementApi(
  token: string,
  sql: string,
): Promise<unknown> {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql, read_only: true }),
    },
  );
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function queryPsql(databaseUrl: string, sql: string): unknown {
  const out = execFileSync(
    "psql",
    [databaseUrl, "-t", "-A", "-c", sql],
    { encoding: "utf8" },
  ).trim();
  if (out === "t" || out === "true" || out === "1") return [{ pass: true }];
  if (out === "f" || out === "false" || out === "0") return [{ pass: false }];
  return [{ pass: out.toLowerCase() === "pass" || out === "1" }];
}

function querySupabaseCli(sql: string): unknown {
  const out = execFileSync(
    "npx",
    [
      "supabase",
      "db",
      "query",
      "--linked",
      "--dns-resolver",
      "https",
      "--output",
      "json",
      sql,
    ],
    { encoding: "utf8", cwd: process.cwd() },
  );
  return JSON.parse(out);
}

function parsePass(result: unknown): { pass: boolean; detail: string } {
  if (Array.isArray(result) && result.length > 0) {
    const row = result[0] as Record<string, unknown>;
    if ("pass" in row) {
      return { pass: Boolean(row.pass), detail: JSON.stringify(row) };
    }
  }
  if (result && typeof result === "object") {
    const obj = result as Record<string, unknown>;
    if (obj.message || obj.error) {
      return { pass: false, detail: String(obj.message || obj.error) };
    }
  }
  return { pass: false, detail: JSON.stringify(result).slice(0, 300) };
}

function printInstructions(): void {
  console.error(`
Production schema verification requires database access.

Set one of:

  1. Management API (read-only):
     export SUPABASE_ACCESS_TOKEN="<personal access token from supabase.com/dashboard/account/tokens>"
     export SUPABASE_PROJECT_REF="aokzlnljfabuvshldstc"

  2. Direct Postgres (requires psql):
     export DATABASE_URL="postgresql://postgres.[ref]:[password]@..."

  3. Supabase CLI (linked project):
     npx tsx scripts/verify-production-schema.ts --cli

After each migration (incremental gate):
  npm run verify:production-schema -- --migration 017

Before app deploy (full gate):
  npm run verify:production-schema -- --strict

Or run the SQL file manually in Supabase Dashboard → SQL Editor:
  scripts/verify-production-schema.sql
`);
}

async function main(): Promise<void> {
  const { useCli, strict, atMigration } = parseArgs(process.argv.slice(2));
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const accessToken =
    process.env.SUPABASE_ACCESS_TOKEN?.trim() || readKeychainToken();

  if (!useCli && !databaseUrl && !accessToken) {
    printInstructions();
    process.exit(1);
  }

  type Runner = (sql: string) => Promise<unknown> | unknown;
  let runQuery: Runner;

  if (useCli) {
    runQuery = (sql) => querySupabaseCli(sql);
  } else if (databaseUrl) {
    runQuery = (sql) => queryPsql(databaseUrl, sql);
  } else {
    runQuery = (sql) => queryManagementApi(accessToken!, sql);
  }

  console.log("SmartProBonoIP production schema verification");
  console.log(`Project ref: ${PROJECT_REF}`);
  if (atMigration) {
    console.log(
      `Gate: after migration ${atMigration} (expect ${EXPECTED_PASS_AFTER[atMigration]}/${CHECKS.length} PASS)`,
    );
  } else if (strict) {
    console.log(`Gate: strict (${CHECKS.length}/${CHECKS.length} PASS required)`);
  }
  console.log("");

  const results: Array<{ check: CheckDef; pass: boolean; detail: string }> =
    [];

  console.log("| Check | Result | Expected after | Match | Detail |");
  console.log("| --- | --- | --- | --- | --- |");

  for (const check of CHECKS) {
    let pass = false;
    let detail = "";
    try {
      const result = await runQuery(check.sql);
      ({ pass, detail } = parsePass(result));
    } catch (err) {
      detail = err instanceof Error ? err.message : String(err);
    }

    const expectedAfter = check.introducedBy;
    const match =
      atMigration !== null
        ? pass === checkShouldPass(check, atMigration)
          ? "OK"
          : "UNEXPECTED"
        : pass
          ? "OK"
          : "—";

    results.push({ check, pass, detail });
    console.log(
      `| ${check.id} | ${pass ? "PASS" : "FAIL"} | ${expectedAfter} | ${match} | ${detail.replace(/\|/g, "\\|").slice(0, 100)} |`,
    );
  }

  const evaluation = evaluateResults(
    results.map(({ check, pass }) => ({ check, pass })),
    { atMigration, strict },
  );

  console.log("");
  console.log(evaluation.summaryLine);

  if (evaluation.unexpectedFailures.length > 0) {
    console.log("");
    console.log("Unexpected failures (STOP — do not apply next migration):");
    for (const check of evaluation.unexpectedFailures) {
      console.log(`  - ${check.id} (expected PASS after migration ${check.introducedBy})`);
    }
  }

  process.exit(evaluation.exitCode);
}

const invokedDirectly =
  process.argv[1]?.endsWith("verify-production-schema.ts") ||
  process.argv[1]?.endsWith("verify-production-schema.js");

if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
