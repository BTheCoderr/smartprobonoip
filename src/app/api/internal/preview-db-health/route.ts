import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.CONTEXT === "production") {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const sb = getSupabaseService();
    const { data, error } = await sb.from("ventures").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, rows: data?.length ?? 0 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
