import { NextResponse } from "next/server";
import { listProjectEvents } from "@/lib/db/events";
import { getRecordById } from "@/lib/db/records";
import { isValidPilotSessionId, readPilotSession } from "@/lib/security/api";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

/**
 * Read-only. Timeline events are written server-side from state changes the
 * server just made, so a browser can never author its own history.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { id } = await params;
  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  const owned = await getRecordById(id, pilotSession);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const events = await listProjectEvents(id);
  return NextResponse.json({ events });
}
