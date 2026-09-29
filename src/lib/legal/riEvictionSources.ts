import type { RiEvictionSource } from "@/lib/legal/riEvictionTypes";

export const RI_EVICTION_SOURCE_REVIEWED_AT = "September 29, 2026";

export const RI_EVICTION_SOURCES: RiEvictionSource[] = [
  {
    id: "ri-judiciary-landlord-tenant",
    title: "District Court — Landlord/Tenant Evictions",
    publisher: "Rhode Island Judiciary",
    url: "https://www.courts.ri.gov/Courts/districtcourt/Pages/Landlord%20Tenant.aspx",
    description:
      "Official District Court overview of Rhode Island residential eviction categories, landlord/tenant matters, and legal-assistance resources.",
  },
  {
    id: "ri-judiciary-faq",
    title: "District Court Landlord/Tenant Evictions — FAQ",
    publisher: "Rhode Island Judiciary",
    url: "https://www.courts.ri.gov/Courts/districtcourt/Pages/LandlordTenant-FAQ.aspx",
    description:
      "Official court FAQ covering hearings, evidence, judgments, appeals, and rent payments during an appeal.",
  },
  {
    id: "ri-landlord-tenant-handbook",
    title: "Rhode Island Landlord-Tenant Handbook",
    publisher: "Rhode Island Judiciary",
    url: "https://www.courts.ri.gov/Courts/districtcourt/Documents/Handbook.pdf",
    description:
      "Official Judiciary handbook that includes statutory notice forms and general landlord/tenant process information.",
  },
  {
    id: "rils-housing",
    title: "Housing Stability Project",
    publisher: "Rhode Island Legal Services",
    url: "https://www.rils.org/programs.cfm?programid=2",
    description:
      "Current Rhode Island Legal Services housing program information, including eviction defense and public/subsidized housing matters.",
  },
];

export function riEvictionSourcesById(ids: string[]): RiEvictionSource[] {
  const wanted = new Set(ids);
  return RI_EVICTION_SOURCES.filter((source) => wanted.has(source.id));
}
