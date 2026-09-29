import "server-only";

import { getPlatformAuth } from "@/lib/account/auth";
import { getRecordById } from "@/lib/db/records";
import { isValidPilotSessionId, readPilotSession } from "@/lib/security/api";
import { getSupabaseService } from "@/lib/supabaseServer";
import type { ProjectRecord } from "@/lib/types";

export type ProjectAccessContext = {
  record: ProjectRecord;
  pilotSessionId: string;
  userId: string | null;
  via: "pilot_session" | "account";
};

export async function resolveProjectAccess(
  request: Request,
  projectId: string,
): Promise<ProjectAccessContext | null> {
  const pilotSession = readPilotSession(request);
  if (isValidPilotSessionId(pilotSession)) {
    const record = await getRecordById(projectId, pilotSession);
    if (record) {
      return {
        record,
        pilotSessionId: pilotSession,
        userId: null,
        via: "pilot_session",
      };
    }
  }

  const auth = await getPlatformAuth().catch(() => null);
  if (!auth) return null;

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_projects")
    .select("pilot_session_id")
    .eq("id", projectId)
    .eq("owner_user_id", auth.userId)
    .maybeSingle();

  if (error || !data?.pilot_session_id) return null;

  const record = await getRecordById(projectId, data.pilot_session_id as string);
  if (!record) return null;

  return {
    record,
    pilotSessionId: data.pilot_session_id as string,
    userId: auth.userId,
    via: "account",
  };
}
