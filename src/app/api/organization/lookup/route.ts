import { NextResponse } from "next/server";
import { getOrganizationByRegistryPartnerId } from "@/lib/db/partnerOrganizations";
import { getPartner } from "@/lib/routing/registry";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

/**
 * Public lookup — registry metadata alone does not grant org access.
 * Returns org share eligibility only when org_account_enabled is true.
 */
export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const registryPartnerId = url.searchParams.get("registryPartnerId")?.trim();
  if (!registryPartnerId) {
    return NextResponse.json({ error: "Missing registryPartnerId" }, { status: 400 });
  }

  const registryPartner = getPartner(registryPartnerId);
  const organization = await getOrganizationByRegistryPartnerId(registryPartnerId);

  if (!organization) {
    return NextResponse.json({
      registryPartnerId,
      registryPartnerName: registryPartner?.name ?? null,
      organization: null,
      shareEnabled: false,
    });
  }

  return NextResponse.json({
    registryPartnerId,
    registryPartnerName: registryPartner?.name ?? organization.name,
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
    shareEnabled: organization.orgAccountEnabled && organization.status === "active",
  });
}
