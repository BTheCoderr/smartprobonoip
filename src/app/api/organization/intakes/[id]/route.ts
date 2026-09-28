import { NextResponse } from "next/server";
import {
  getOrganizationIntakeTemplate,
  retireOrganizationIntakeTemplate,
  reviewOrganizationIntakeQuestion,
} from "@/lib/db/intakeTemplates";
import { isCanonicalIntakeFieldKey } from "@/lib/handoff/canonicalFields";
import {
  isOrgAuthContext,
  requireOrganizationAuth,
} from "@/lib/organization/auth";
import {
  assertTextWithinLimit,
  limitErrorResponse,
  MAX_TEXT,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await requireOrganizationAuth();
  if (!isOrgAuthContext(auth)) return auth;

  const { id } = await params;
  try {
    const template = await getOrganizationIntakeTemplate(
      auth.membership.organizationId,
      id,
    );
    if (!template) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ template });
  } catch (err) {
    logServerError("organization.intakes.get", err, {
      organizationId: auth.membership.organizationId,
      templateId: id,
    });
    return NextResponse.json({ error: "Could not load this intake." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await requireOrganizationAuth({ requireAdmin: true });
  if (!isOrgAuthContext(auth)) return auth;

  const { id } = await params;
  try {
    const body = (await readJsonWithLimit(request)) as {
      action?: "review_mapping";
      questionId?: string;
      disposition?: "mapped" | "firm_only";
      canonicalKey?: string | null;
      mappingNotes?: string | null;
    };

    if (body.action !== "review_mapping" || !body.questionId) {
      return NextResponse.json({ error: "Unsupported update." }, { status: 422 });
    }
    if (!body.disposition || !["mapped", "firm_only"].includes(body.disposition)) {
      return NextResponse.json({ error: "Choose a mapping disposition." }, { status: 422 });
    }
    if (
      body.disposition === "mapped" &&
      !isCanonicalIntakeFieldKey(body.canonicalKey)
    ) {
      return NextResponse.json(
        { error: "Choose a canonical field or mark this as a firm-only question." },
        { status: 422 },
      );
    }
    assertTextWithinLimit(body.mappingNotes, MAX_TEXT.note);

    const template = await reviewOrganizationIntakeQuestion({
      organizationId: auth.membership.organizationId,
      actorEmail: auth.email,
      templateId: id,
      questionId: body.questionId,
      disposition: body.disposition,
      canonicalKey: body.canonicalKey,
      mappingNotes: body.mappingNotes,
    });

    return NextResponse.json({ template });
  } catch (err) {
    const limited = limitErrorResponse(err);
    if (limited) return limited;
    logServerError("organization.intakes.patch", err, {
      organizationId: auth.membership.organizationId,
      templateId: id,
    });
    return NextResponse.json({ error: "Could not update this mapping." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await requireOrganizationAuth({ requireAdmin: true });
  if (!isOrgAuthContext(auth)) return auth;

  const { id } = await params;
  const ok = await retireOrganizationIntakeTemplate({
    organizationId: auth.membership.organizationId,
    templateId: id,
  });
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Could not retire intake." }, { status: 500 });
}
