import { NextResponse } from "next/server";
import { createRecoveryLink } from "@/lib/db/recovery";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const pilotSession = request.headers.get("x-pilot-session");
  if (!pilotSession) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      projectId?: string;
      email?: string;
    };

    if (!body.projectId?.trim()) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }

    const result = await createRecoveryLink({
      projectId: body.projectId.trim(),
      pilotSessionId: pilotSession,
      email: body.email,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
