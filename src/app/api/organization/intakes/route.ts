import { NextResponse } from "next/server";
import {
  createOrganizationIntakeImport,
  listOrganizationIntakeTemplates,
} from "@/lib/db/intakeTemplates";
import {
  MAX_IMPORTED_INTAKE_TEXT,
  parseProfessionalIntake,
} from "@/lib/handoff/intakeImporter";
import {
  isOrgAuthContext,
  requireOrganizationAuth,
} from "@/lib/organization/auth";
import {
  limitErrorResponse,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await requireOrganizationAuth();
  if (!isOrgAuthContext(auth)) return auth;

  try {
    const templates = await listOrganizationIntakeTemplates(
      auth.membership.organizationId,
    );
    return NextResponse.json({ templates });
  } catch (err) {
    logServerError("organization.intakes.list", err, {
      organizationId: auth.membership.organizationId,
    });
    return NextResponse.json({ error: "Could not load intake templates." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await requireOrganizationAuth({ requireAdmin: true });
  if (!isOrgAuthContext(auth)) return auth;

  try {
    const body = (await readJsonWithLimit(
      request,
      MAX_IMPORTED_INTAKE_TEXT + 32_000,
    )) as {
      importName?: string;
      sourceMode?: "paste" | "text_file";
      sourceFilename?: string;
      rawText?: string;
    };

    const importName = body.importName?.trim();
    const rawText = body.rawText?.trim();
    const sourceMode = body.sourceMode ?? "paste";

    if (!importName || importName.length > 180) {
      return NextResponse.json(
        { error: "Name the professional intake before importing it." },
        { status: 422 },
      );
    }
    if (!rawText) {
      return NextResponse.json(
        { error: "Paste or load the intake text first." },
        { status: 422 },
      );
    }
    if (rawText.length > MAX_IMPORTED_INTAKE_TEXT) {
      return NextResponse.json(
        { error: "The intake text is too large for one import." },
        { status: 413 },
      );
    }
    if (!["paste", "text_file"].includes(sourceMode)) {
      return NextResponse.json({ error: "Unsupported import source." }, { status: 422 });
    }

    const parsed = await parseProfessionalIntake(rawText);
    if (parsed.questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No intake questions were detected. Keep the original question wording and place one field/question per line, or paste a cleaner text export.",
        },
        { status: 422 },
      );
    }

    const template = await createOrganizationIntakeImport({
      organizationId: auth.membership.organizationId,
      actorUserId: auth.userId,
      importName,
      sourceMode,
      sourceFilename: body.sourceFilename?.slice(0, 255) || null,
      rawText,
      parsed,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    const limited = limitErrorResponse(err);
    if (limited) return limited;
    logServerError("organization.intakes.import", err, {
      organizationId: auth.membership.organizationId,
    });
    return NextResponse.json({ error: "Could not import this intake." }, { status: 500 });
  }
}
