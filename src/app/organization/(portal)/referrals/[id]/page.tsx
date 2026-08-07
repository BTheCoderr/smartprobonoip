import { OrganizationReferralDetail } from "@/components/organization/OrganizationReferralDetail";

export default async function OrganizationReferralPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrganizationReferralDetail referralId={id} />;
}
