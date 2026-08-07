import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Choose a protection path — SmartProBonoIP",
  description:
    "What are you trying to protect? Patent readiness is available now. Trademark, copyright, trade secret, and guided routing are coming soon.",
};

/** Canonical chooser lives on the home landing; keep /protect as an alias. */
export default function ProtectIndexPage() {
  redirect(ROUTES.home);
}
