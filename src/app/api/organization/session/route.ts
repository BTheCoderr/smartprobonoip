import { NextResponse } from "next/server";
import {
  isOrgAuthContext,
  requireOrganizationAuth,
} from "@/lib/organization/auth";
import { getOrganizationById } from "@/lib/db/partnerOrganizations";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const auth = await requireOrganizationAuth();
  if (!isOrgAuthContext(auth)) return auth;

  const organization = await getOrganizationById(auth.membership.organizationId);

  return NextResponse.json({
    userId: auth.userId,
    email: auth.email,
    membership: auth.membership,
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        }
      : null,
  });
}
