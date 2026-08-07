import "server-only";
import { getSupabaseService } from "@/lib/supabaseServer";

export interface PartnerOrganizationRow {
  id: string;
  name: string;
  slug: string | null;
  registryPartnerId: string | null;
  orgAccountEnabled: boolean;
  organizationType: string | null;
  status: string;
}

interface DbPartnerOrgRow {
  id: string;
  name: string;
  slug: string | null;
  registry_partner_id: string | null;
  org_account_enabled: boolean;
  organization_type: string | null;
  status: string;
}

function mapRow(row: DbPartnerOrgRow): PartnerOrganizationRow {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    registryPartnerId: row.registry_partner_id,
    orgAccountEnabled: row.org_account_enabled,
    organizationType: row.organization_type,
    status: row.status,
  };
}

const SELECT =
  "id, name, slug, registry_partner_id, org_account_enabled, organization_type, status";

export async function getOrganizationById(
  organizationId: string,
): Promise<PartnerOrganizationRow | null> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("partner_organizations")
    .select(SELECT)
    .eq("id", organizationId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as DbPartnerOrgRow);
}

export async function getOrganizationByRegistryPartnerId(
  registryPartnerId: string,
): Promise<PartnerOrganizationRow | null> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("partner_organizations")
    .select(SELECT)
    .eq("registry_partner_id", registryPartnerId)
    .eq("org_account_enabled", true)
    .eq("status", "active")
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as DbPartnerOrgRow);
}

export async function isOrganizationShareEnabled(
  organizationId: string,
): Promise<boolean> {
  const org = await getOrganizationById(organizationId);
  return Boolean(org?.orgAccountEnabled && org.status === "active");
}
