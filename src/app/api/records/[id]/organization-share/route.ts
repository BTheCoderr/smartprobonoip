import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { listDocumentsForProject } from "@/lib/db/documents";
import { createOrganizationReferral } from "@/lib/db/organizationReferrals";
import { isOrganizationShareEnabled } from "@/lib/db/partnerOrganizations";
import { getRecordById } from "@/lib/db/records";
import {
  ORGANIZATION_CONSENT_COPY_VERSION,
  ORGANIZATION_CONSENT_DISCLAIMER_VERSION,
  normalizeSelectedShareFields,
} from "@/lib/organization/consent";
import { buildSharedSnapshot } from "@/lib/organization/snapshot";
import { getPartner } from "@/lib/routing/registry";
import {
  GENERIC_SERVER_ERROR,
  isValidPilotSessionId,
  readPilotSession,
} from "@/lib/security/api";
import { readJsonWithLimit } from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { id: projectId } = await params;
  const pilotSession = readPilotSession(request);
  if (!isValidPilotSessionId(pilotSession)) {
    return NextResponse.json({ error: "Missing pilot session" }, { status: 401 });
  }

  try {
    const body = (await readJsonWithLimit(request)) as {
      organizationId?: string;
      selectedFields?: string[];
      sharedArtifactIds?: string[];
      recommendationId?: string;
      registryPartnerId?: string;
      referralReason?: string;
    };

    const organizationId = body.organizationId?.trim();
    if (!organizationId) {
      return NextResponse.json({ error: "Missing organizationId" }, { status: 400 });
    }

    const shareEnabled = await isOrganizationShareEnabled(organizationId);
    if (!shareEnabled) {
      return NextResponse.json({ error: "Organization not accepting shares" }, {
        status: 403,
      });
    }

    const record = await getRecordById(projectId, pilotSession);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const documents = await listDocumentsForProject(projectId);
    const selectedFields = normalizeSelectedShareFields(body.selectedFields);
    const sharedArtifactIds = (body.sharedArtifactIds ?? []).filter(Boolean);

    let referralReason = body.referralReason?.trim() ?? null;
    if (!referralReason && body.registryPartnerId) {
      const partner = getPartner(body.registryPartnerId);
      if (partner) {
        referralReason = `Inventor chose to share with ${partner.name} after reviewing preparation guidance.`;
      }
    }

    const sharedSnapshot = buildSharedSnapshot({
      record,
      selectedFields,
      referralReason,
      documents,
    });

    const consentAt = new Date().toISOString();
    const consentRecord = {
      organizationId,
      projectId,
      sharedFieldKeys: selectedFields,
      sharedArtifactIds,
      consentAt,
      consentCopyVersion: ORGANIZATION_CONSENT_COPY_VERSION,
      consentDisclaimerVersion: ORGANIZATION_CONSENT_DISCLAIMER_VERSION,
      recommendationId: body.recommendationId ?? null,
      registryPartnerId: body.registryPartnerId ?? null,
    };

    const referral = await createOrganizationReferral({
      organizationId,
      projectId,
      sharedSnapshot,
      consentRecord,
      referralReason,
      registryPartnerId: body.registryPartnerId ?? null,
      recommendationId: body.recommendationId ?? null,
    });

    if (!referral) {
      return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
    }

    await trackServerEvent("organization_referral_shared", {
      pilotSessionId: pilotSession,
      projectId,
      metadata: {
        partnerId: body.registryPartnerId,
        recommendationId: body.recommendationId,
        fieldCount: selectedFields.length,
      },
    });

    return NextResponse.json({
      referralId: referral.id,
      status: referral.status,
      consentAt,
      sharedFieldKeys: selectedFields,
    });
  } catch (error) {
    logServerError("organization-share", error);
    return NextResponse.json({ error: GENERIC_SERVER_ERROR }, { status: 500 });
  }
}
