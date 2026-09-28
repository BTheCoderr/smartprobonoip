import { NextResponse } from "next/server";
import {
  createDisclosureEvent,
  deleteDisclosureEvent,
  listDisclosureEvents,
  updateDisclosureEvent,
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
import type { CanonicalDisclosureRecord } from "@/lib/types";

const EVENT_TYPES = new Set([
  "publication","website_post","oral_presentation","poster","demo",
  "external_discussion","sale_offer","sale","external_use",
  "investor_pitch","customer_pitch","other",
]);
const PRECISIONS = new Set(["exact","month","year","approximate","unknown"]);
const ACCESS = new Set(["named_people","limited_group","general_public","unknown"]);
const CONFIDENTIALITY = new Set([
  "written_nda","other_written_restriction","oral_confidentiality","none_known","unknown",
]);

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
    return NextResponse.json({ disclosures: await listDisclosureEvents(id) });
  } catch (err) {
    logServerError("canonical.disclosures.get", err, { projectId: id });
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
      disclosureId?: string;
      eventType?: CanonicalDisclosureRecord["eventType"];
      eventDate?: string;
      datePrecision?: CanonicalDisclosureRecord["datePrecision"];
      anticipated?: boolean;
      whatWasShared?: string;
      audienceDescription?: string;
      accessScope?: CanonicalDisclosureRecord["accessScope"];
      confidentialityBasis?: CanonicalDisclosureRecord["confidentialityBasis"];
      locationOrChannel?: string;
      referenceTitle?: string;
      submissionDate?: string;
      notes?: string;
    };

    for (const value of [
      body.whatWasShared,
      body.audienceDescription,
      body.locationOrChannel,
      body.referenceTitle,
      body.notes,
    ]) {
      assertTextWithinLimit(value, MAX_TEXT.long);
    }

    if (body.action === "delete") {
      if (!body.disclosureId) {
        return NextResponse.json({ error: "Missing disclosure event" }, { status: 422 });
      }
      await deleteDisclosureEvent(id, body.disclosureId);
      return NextResponse.json({ ok: true });
    }

    if (!body.eventType || !EVENT_TYPES.has(body.eventType)) {
      return NextResponse.json({ error: "Select a disclosure event type" }, { status: 422 });
    }
    if (body.datePrecision && !PRECISIONS.has(body.datePrecision)) {
      return NextResponse.json({ error: "Unsupported date precision" }, { status: 422 });
    }
    if (body.accessScope && !ACCESS.has(body.accessScope)) {
      return NextResponse.json({ error: "Unsupported access scope" }, { status: 422 });
    }
    if (body.confidentialityBasis && !CONFIDENTIALITY.has(body.confidentialityBasis)) {
      return NextResponse.json({ error: "Unsupported confidentiality option" }, { status: 422 });
    }

    const input = {
      eventType: body.eventType,
      eventDate: body.eventDate || null,
      datePrecision: body.datePrecision ?? (body.eventDate ? "exact" : "unknown"),
      anticipated: body.anticipated ?? false,
      whatWasShared: body.whatWasShared,
      audienceDescription: body.audienceDescription,
      accessScope: body.accessScope ?? "unknown",
      confidentialityBasis: body.confidentialityBasis ?? "unknown",
      locationOrChannel: body.locationOrChannel,
      referenceTitle: body.referenceTitle,
      submissionDate: body.submissionDate || null,
      notes: body.notes,
    };

    if (body.action === "update") {
      if (!body.disclosureId) {
        return NextResponse.json({ error: "Missing disclosure event" }, { status: 422 });
      }
      const disclosure = await updateDisclosureEvent(id, body.disclosureId, input);
      return NextResponse.json({ disclosure });
    }

    const disclosure = await createDisclosureEvent({
      projectId: id,
      pilotSessionId: owned.pilotSession,
      ...input,
    });
    return NextResponse.json({ disclosure }, { status: 201 });
  } catch (err) {
    const limited = limitErrorResponse(err);
    if (limited) return limited;
    logServerError("canonical.disclosures.post", err, { projectId: id });
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
