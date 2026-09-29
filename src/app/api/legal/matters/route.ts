import { NextResponse } from "next/server";
import { requirePlatformAuth, isPlatformAuthContext } from "@/lib/account/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import {
  assertTextWithinLimit,
  limitErrorResponse,
  readJsonWithLimit,
} from "@/lib/security/requestLimits";
import { logServerError } from "@/lib/security/safeLog";

const MATTER_TYPES = new Set(["general", "document", "ri_eviction", "record_clearing"]);
const ARTIFACT_TYPES = new Set([
  "document_review",
  "draft",
  "ri_eviction_summary",
  "record_clearing_summary",
  "note",
]);

type MatterBody = {
  matterType?: unknown;
  title?: unknown;
  jurisdiction?: unknown;
  sourceTool?: unknown;
  summary?: unknown;
  artifact?: {
    artifactType?: unknown;
    title?: unknown;
    content?: unknown;
    metadata?: unknown;
  } | null;
};

export async function GET() {
  const auth = await requirePlatformAuth();
  if (!isPlatformAuthContext(auth)) return auth;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("legal_matters")
      .select("id, matter_type, title, jurisdiction, status, source_tool, summary, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ matters: data ?? [] });
  } catch (error) {
    logServerError("legal.matters.list", error, { route: "api/legal/matters" });
    return NextResponse.json({ error: "Could not load Legal matters." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "legal-matters-create", {
    limit: 30,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  const auth = await requirePlatformAuth();
  if (!isPlatformAuthContext(auth)) return auth;

  try {
    const body = (await readJsonWithLimit(request, 80_000)) as MatterBody;
    const matterType = typeof body.matterType === "string" ? body.matterType : "general";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const jurisdiction = typeof body.jurisdiction === "string" ? body.jurisdiction.trim() : "";
    const sourceTool = typeof body.sourceTool === "string" ? body.sourceTool.trim() : "";
    const summary = typeof body.summary === "string" ? body.summary.trim() : "";

    if (!MATTER_TYPES.has(matterType)) {
      return NextResponse.json({ error: "Invalid matter type." }, { status: 422 });
    }
    if (!title) {
      return NextResponse.json({ error: "Matter title is required." }, { status: 422 });
    }

    assertTextWithinLimit(title, 180);
    assertTextWithinLimit(jurisdiction, 120);
    assertTextWithinLimit(sourceTool, 120);
    assertTextWithinLimit(summary, 12_000);

    const supabase = await createSupabaseServerClient();
    await supabase
      .from("platform_profiles")
      .upsert({ user_id: auth.userId }, { onConflict: "user_id" });

    const { data: matter, error: matterError } = await supabase
      .from("legal_matters")
      .insert({
        user_id: auth.userId,
        matter_type: matterType,
        title,
        jurisdiction: jurisdiction || null,
        source_tool: sourceTool || null,
        summary: summary || null,
      })
      .select("id, matter_type, title, jurisdiction, status, source_tool, summary, created_at, updated_at")
      .single();

    if (matterError || !matter) throw matterError ?? new Error("Matter creation failed");

    const artifact = body.artifact;
    if (artifact) {
      const artifactType =
        typeof artifact.artifactType === "string" ? artifact.artifactType : "";
      const artifactTitle =
        typeof artifact.title === "string" ? artifact.title.trim() : title;
      if (!ARTIFACT_TYPES.has(artifactType)) {
        await supabase.from("legal_matters").delete().eq("id", matter.id);
        return NextResponse.json({ error: "Invalid artifact type." }, { status: 422 });
      }
      assertTextWithinLimit(artifactTitle, 180);

      const content =
        artifact.content && typeof artifact.content === "object" ? artifact.content : {};
      const metadata =
        artifact.metadata && typeof artifact.metadata === "object" ? artifact.metadata : {};

      const serialized = JSON.stringify({ content, metadata });
      if (serialized.length > 60_000) {
        await supabase.from("legal_matters").delete().eq("id", matter.id);
        return NextResponse.json({ error: "Saved artifact is too large." }, { status: 413 });
      }

      const { error: artifactError } = await supabase.from("legal_artifacts").insert({
        matter_id: matter.id,
        user_id: auth.userId,
        artifact_type: artifactType,
        title: artifactTitle,
        content,
        metadata,
      });

      if (artifactError) {
        await supabase.from("legal_matters").delete().eq("id", matter.id);
        throw artifactError;
      }
    }

    return NextResponse.json({ matter }, { status: 201 });
  } catch (error) {
    const limitedResponse = limitErrorResponse(error);
    if (limitedResponse) return limitedResponse;
    logServerError("legal.matters.create", error, { route: "api/legal/matters" });
    return NextResponse.json({ error: "Could not save this Legal matter." }, { status: 500 });
  }
}
