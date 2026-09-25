import { NextResponse } from "next/server";
import {
  createContributor,
  deleteContributor,
  listContributors,
  updateContributor,
} from "@/lib/db/canonicalWorkspace";
import { getRecordById } from "@/lib/db/records";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import {
  assertTextWithinLimit,
  limitErrorResponse,
  MAX_TEXT,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import type { CanonicalContributor } from "@/lib/types";

const ROLES = new Set(["contributor", "possible_inventor", "unknown"]);

async function ownedProject(request: Request, id: string) {
  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) return null;
  const record = await getRecordById(id, pilotSession);
  return record ? { record, pilotSession } : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const { id } = await params;
  const owned = await ownedProject(request, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    return NextResponse.json({ contributors: await listContributors(id) });
  } catch (err) {
    logServerError("canonical.contributors.get", err, { projectId: id });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const { id } = await params;
  const owned = await ownedProject(request, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = (await readJsonWithLimit(request)) as {
      action?: "create" | "update" | "delete";
      contributorId?: string;
      legalFirstName?: string;
      legalMiddleName?: string;
      legalLastName?: string;
      email?: string;
      phone?: string;
      employerAffiliation?: string;
      positionDepartment?: string;
      otherAffiliations?: string;
      contributionDescription?: string;
      contributionStartedOn?: string;
      contributionEndedOn?: string;
      userIdentifiedRole?: CanonicalContributor["userIdentifiedRole"];
      residenceCity?: string;
      residenceRegion?: string;
      residenceCountry?: string;
      isPrimaryContact?: boolean;
    };

    for (const value of [
      body.legalFirstName,
      body.legalMiddleName,
      body.legalLastName,
      body.email,
      body.phone,
      body.employerAffiliation,
      body.positionDepartment,
      body.otherAffiliations,
      body.residenceCity,
      body.residenceRegion,
      body.residenceCountry,
    ]) {
      assertTextWithinLimit(value, MAX_TEXT.standard);
    }
    assertTextWithinLimit(body.contributionDescription, MAX_TEXT.long);

    if (body.action === "delete") {
      if (!body.contributorId) {
        return NextResponse.json({ error: "Missing contributor" }, { status: 422 });
      }
      await deleteContributor(id, body.contributorId);
      return NextResponse.json({ ok: true });
    }

    if (body.userIdentifiedRole && !ROLES.has(body.userIdentifiedRole)) {
      return NextResponse.json({ error: "Unsupported contributor role" }, { status: 422 });
    }

    const input = {
      legalFirstName: body.legalFirstName ?? "",
      legalMiddleName: body.legalMiddleName,
      legalLastName: body.legalLastName ?? "",
      email: body.email,
      phone: body.phone,
      employerAffiliation: body.employerAffiliation,
      positionDepartment: body.positionDepartment,
      otherAffiliations: body.otherAffiliations,
      contributionDescription: body.contributionDescription,
      contributionStartedOn: body.contributionStartedOn,
      contributionEndedOn: body.contributionEndedOn,
      userIdentifiedRole: body.userIdentifiedRole ?? "unknown",
      residenceCity: body.residenceCity,
      residenceRegion: body.residenceRegion,
      residenceCountry: body.residenceCountry,
      isPrimaryContact: body.isPrimaryContact ?? false,
    };

    if (body.action === "update") {
      if (!body.contributorId) {
        return NextResponse.json({ error: "Missing contributor" }, { status: 422 });
      }
      const contributor = await updateContributor(id, body.contributorId, input);
      return NextResponse.json({ contributor });
    }

    if (!input.legalFirstName.trim() || !input.legalLastName.trim()) {
      return NextResponse.json(
        { error: "First and last name are required" },
        { status: 422 },
      );
    }

    const contributor = await createContributor({
      projectId: id,
      pilotSessionId: owned.pilotSession,
      ...input,
    });
    return NextResponse.json({ contributor }, { status: 201 });
  } catch (err) {
    const limited = limitErrorResponse(err);
    if (limited) return limited;
    logServerError("canonical.contributors.post", err, { projectId: id });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
