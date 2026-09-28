import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Choose an IP protection path — SmartProBonoIP",
  description:
    "What are you trying to protect? Patent readiness is available now. Trademark, copyright, trade secret, and guided routing are registered on the platform.",
};

/** The canonical IP chooser lives on /ip; keep /protect as an alias. */
export default function ProtectIndexPage() {
  redirect(ROUTES.ip);
}
