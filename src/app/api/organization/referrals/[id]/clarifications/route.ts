import { NextResponse } from "next/server";
import {
  closeReferralClarification,
  createReferralClarification,
  listReferralClarifications,
} from "@/lib/db/clarificationRequests";
import { getOrganizationReferralById } from "@/lib/db/organizationReferrals";
import { recordProjectEvent } from "@/lib/db/events";
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
  const referral = await getOrganizationReferralById(
    id,
    auth.membership.organizationId,
  );
  if (!referral) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const clarifications = await listReferralClarifications(
      auth.membership.organizationId,
      id,
    );
    return NextResponse.json({ clarifications });
  } catch (err) {
    logServerError("organization.clarifications.list", err, {
      organizationId: auth.membership.organizationId,
      referralId: id,
    });
    return NextResponse.json(
      { error: "Could not load clarification requests." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await requireOrganizationAuth();
  if (!isOrgAuthContext(auth)) return auth;

  const { id } = await params;
  const referral = await getOrganizationReferralById(
    id,
    auth.membership.organizationId,
  );
  if (!referral) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = (await readJsonWithLimit(request)) as {
      questionText?: string;
      contextNote?: string | null;
      canonicalKey?: string | null;
    };

    const questionText = body.questionText?.trim();
    if (!questionText) {
      return NextResponse.json(
        { error: "Enter the clarification question." },
        { status: 422 },
      );
    }
    assertTextWithinLimit(questionText, MAX_TEXT.question);
    assertTextWithinLimit(body.contextNote, MAX_TEXT.note);

    if (
      body.canonicalKey &&
      !isCanonicalIntakeFieldKey(body.canonicalKey)
    ) {
      return NextResponse.json(
        { error: "Unsupported factual field." },
        { status: 422 },
      );
    }

    const clarification = await createReferralClarification({
      organizationId: auth.membership.organizationId,
      referralId: id,
      projectId: referral.projectId,
      askedByUserId: auth.userId,
      canonicalKey: body.canonicalKey ?? null,
      questionText,
      contextNote: body.contextNote,
    });

    await recordProjectEvent({
      projectId: referral.projectId,
      pilotSessionId: referral.consentRecord.projectId
        ? (referral.consentRecord as { pilotSessionId?: string }).pilotSessionId ?? "organization"
        : "organization",
      type: "professional_clarification_requested",
      source: "system",
      detail: "A professional organization requested additional factual clarification.",
      metadata: {
        clarificationId: clarification.id,
        organizationId: auth.membership.organizationId,
        canonicalKey: clarification.canonicalKey,
      },
    }).catch(() => undefined);

    return NextResponse.json({ clarification }, { status: 201 });
  } catch (err) {
    const limited = limitErrorResponse(err);
    if (limited) return limited;
    logServerError("organization.clarifications.create", err, {
      organizationId: auth.membership.organizationId,
      referralId: id,
    });
    return NextResponse.json(
      { error: "Could not send clarification request." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await requireOrganizationAuth();
  if (!isOrgAuthContext(auth)) return auth;

  const { id } = await params;
  const referral = await getOrganizationReferralById(
    id,
    auth.membership.organizationId,
  );
  if (!referral) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = (await readJsonWithLimit(request)) as {
      action?: "close";
      clarificationId?: string;
    };
    if (body.action !== "close" || !body.clarificationId) {
      return NextResponse.json({ error: "Unsupported update." }, { status: 422 });
    }

    const clarification = await closeReferralClarification({
      organizationId: auth.membership.organizationId,
      referralId: id,
      clarificationId: body.clarificationId,
    });
    if (!clarification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ clarification });
  } catch (err) {
    logServerError("organization.clarifications.close", err, {
      organizationId: auth.membership.organizationId,
      referralId: id,
    });
    return NextResponse.json(
      { error: "Could not close clarification request." },
      { status: 500 },
    );
  }
}
