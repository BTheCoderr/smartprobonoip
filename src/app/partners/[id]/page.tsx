import { notFound } from "next/navigation";
import { PartnerDetailView } from "@/components/partners/PartnerDetailView";
import {
  getPublicDirectoryPartners,
  getPublicPartnerById,
  toPublicPartnerView,
} from "@/lib/routing";

export function generateStaticParams() {
  return getPublicDirectoryPartners().map((partner) => ({ id: partner.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partner = getPublicPartnerById(id);
  if (!partner) {
    return { title: "Partner not found — SmartProBonoIP" };
  }
  return {
    title: `${partner.name} — SmartProBonoIP partner directory`,
    description: `${partner.description} Verified destination — not an endorsement.`,
  };
}

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partner = getPublicPartnerById(id);
  if (!partner) notFound();

  return (
    <div className="page-shell py-10">
      <PartnerDetailView partner={toPublicPartnerView(partner)} />
    </div>
  );
}
