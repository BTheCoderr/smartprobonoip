import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { getRecordById, updatePostClarity, updateProfile } from "@/lib/db/records";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import type { ReadinessProfile } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { id } = await params;
  const pilotSession = request.headers.get("x-pilot-session");
  if (!pilotSession) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  const record = await getRecordById(id, pilotSession);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ record });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { id } = await params;
  const pilotSession = request.headers.get("x-pilot-session");
  if (!pilotSession) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      postClarity?: number;
      profile?: ReadinessProfile;
    };

    if (typeof body.postClarity === "number") {
      await updatePostClarity(id, pilotSession, body.postClarity);
      const existing = await getRecordById(id, pilotSession);
      await trackServerEvent("clarity_after_recorded", {
        projectId: id,
        pilotSessionId: pilotSession,
        anonymousId: request.headers.get("x-anonymous-id"),
        partnerSlug: existing?.partnerSlug,
        partnerName: existing?.partnerName,
        source: existing?.source,
        campaign: existing?.campaign,
        metadata: { clarityRating: body.postClarity },
      });
    }
    if (body.profile) {
      await updateProfile(id, pilotSession, body.profile);
    }

    const record = await getRecordById(id, pilotSession);
    return NextResponse.json({ record });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
