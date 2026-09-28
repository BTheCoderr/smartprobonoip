import { OrganizationIntakeTemplates } from "@/components/organization/OrganizationIntakeTemplates";

export const metadata = {
  title: "Intake forms — SmartProBonoIP organization portal",
  description:
    "Import a professional intake, review canonical mappings, and preserve firm-only questions.",
};

export default function OrganizationIntakesPage() {
  return <OrganizationIntakeTemplates />;
}
