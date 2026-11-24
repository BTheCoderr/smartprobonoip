import type { Metadata } from "next";
import ProductLandingPage from "@/components/pages/ProductLandingPage";

export const metadata: Metadata = {
  title: "SmartProBonoIP — IP Readiness Platform",
  description:
    "Build a reusable IP readiness record before professional review. Patent readiness organizes invention facts, contributors, disclosures, evidence, and professional intake details.",
};

/**
 * The IP product has its own entry point inside the SmartProBono umbrella.
 * Returning inventors are redirected to their workspace in middleware, so
 * this page can be statically rendered and cached at the CDN.
 */
export default function IpHomePage() {
  return <ProductLandingPage />;
}
