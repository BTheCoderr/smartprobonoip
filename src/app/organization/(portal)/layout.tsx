import { OrganizationNav } from "@/components/organization/OrganizationNav";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <OrganizationNav />
      <main className="page-shell py-8">{children}</main>
    </div>
  );
}
