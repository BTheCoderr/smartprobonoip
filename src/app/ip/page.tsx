import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProductLandingPage from "@/components/pages/ProductLandingPage";
import { PORTFOLIO_MARKER_COOKIE } from "@/lib/portfolio/marker";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "SmartProBonoIP — IP Readiness Platform",
  description:
    "Build a reusable IP readiness record before professional review. Patent readiness organizes invention facts, contributors, disclosures, evidence, and professional intake details.",
};

/**
 * The IP product has its own entry point inside the SmartProBono umbrella.
 * Returning inventors can still go directly to their inventor workspace.
 */
export default async function IpHomePage() {
  const cookieStore = await cookies();
  if (cookieStore.get(PORTFOLIO_MARKER_COOKIE)?.value === "1") {
    redirect(ROUTES.workspace);
  }

  return <ProductLandingPage />;
}
