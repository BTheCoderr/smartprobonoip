import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProductLandingPage from "@/components/pages/ProductLandingPage";
import { PORTFOLIO_MARKER_COOKIE } from "@/lib/portfolio/marker";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "SmartProBonoIP — IP Readiness Platform",
  description:
    "What are you trying to protect? Prepare an invention disclosure and professional handoff packet before expert review. Patent readiness available now — preparation only, not legal advice.",
};

/**
 * `/` is the marketing page, unchanged. Returning inventors are sent on to their
 * workspace instead.
 *
 * The decision is made server-side from a non-identifying flag cookie, so the
 * redirect happens before anything renders and crawlers — which never carry the
 * cookie — always receive the marketing page. `/smartprobonoip` renders the same
 * marketing page for inventors who want it back.
 */
export default async function HomePage() {
  const cookieStore = await cookies();
  if (cookieStore.get(PORTFOLIO_MARKER_COOKIE)?.value === "1") {
    redirect(ROUTES.workspace);
  }

  return <ProductLandingPage />;
}
