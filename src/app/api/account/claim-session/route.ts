import { NextResponse } from "next/server";
import { requirePlatformAuth, isPlatformAuthContext } from "@/lib/account/auth";
import { getSupabaseService } from "@/lib/supabaseServer";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import { logServerError } from "@/lib/security/safeLog";

export async function POST(request: Request) {
  const auth = await requirePlatformAuth();
  if (!isPlatformAuthContext(auth)) return auth;

  const pilotSessionId = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSessionId)) {
    return NextResponse.json({ ok: true, claimedProjects: 0, sessionFound: false });
  }

  try {
    const sb = getSupabaseService();
    const [{ data: session }, { data: projects }] = await Promise.all([
      sb.from("pilot_sessions")
        .select("pilot_session_id, owner_user_id")
        .eq("pilot_session_id", pilotSessionId)
        .maybeSingle(),
      sb.from("smartprobonoip_projects")
        .select("id, owner_user_id")
        .eq("pilot_session_id", pilotSessionId),
    ]);

    const conflicting =
      (session?.owner_user_id && session.owner_user_id !== auth.userId) ||
      (projects ?? []).some(
        (project) => project.owner_user_id && project.owner_user_id !== auth.userId,
      );

    if (conflicting) {
      return NextResponse.json(
        { error: "This browser workspace is already linked to a different account." },
        { status: 409 },
      );
    }

    if (session) {
      const { error } = await sb
        .from("pilot_sessions")
        .update({ owner_user_id: auth.userId })
        .eq("pilot_session_id", pilotSessionId)
        .or(`owner_user_id.is.null,owner_user_id.eq.${auth.userId}`);
      if (error) throw error;
    }

    const { error: projectError } = await sb
      .from("smartprobonoip_projects")
      .update({ owner_user_id: auth.userId })
      .eq("pilot_session_id", pilotSessionId)
      .or(`owner_user_id.is.null,owner_user_id.eq.${auth.userId}`);
    if (projectError) throw projectError;

    return NextResponse.json({
      ok: true,
      sessionFound: Boolean(session),
      claimedProjects: (projects ?? []).length,
    });
  } catch (error) {
    logServerError("account.claim_session", error, { route: "api/account/claim-session" });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
