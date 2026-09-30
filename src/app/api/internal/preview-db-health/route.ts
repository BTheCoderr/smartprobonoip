import { NextResponse } from "next/server";
import {
  getSupabaseService,
  isSupabaseServerConfigured,
} from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.CONTEXT === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const diagnostics = {
    configured: isSupabaseServerConfigured(),
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  try {
    const sb = getSupabaseService();
    const { data, error } = await sb.from("ventures").select("id").limit(1);
    if (error) {
      return NextResponse.json(
        {
          ok: false,
          ...diagnostics,
          dbErrorCode: error.code ?? null,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: true, ...diagnostics, rows: data?.length ?? 0 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        ...diagnostics,
        errorType: error instanceof Error ? error.name : "unknown",
      },
      { status: 503 },
    );
  }
}
