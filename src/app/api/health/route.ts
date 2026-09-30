import { NextResponse } from "next/server";
import {
  isSupabaseConfigured,
  isSupabaseServerConfigured,
} from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    supabasePublicConfigured: isSupabaseConfigured(),
    supabaseServerConfigured: isSupabaseServerConfigured(),
  };
  const ok = checks.supabasePublicConfigured && checks.supabaseServerConfigured;

  return NextResponse.json(
    { ok, checks },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
