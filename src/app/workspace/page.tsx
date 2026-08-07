import type { Metadata } from "next";
import { InventorWorkspace } from "@/components/dashboard/InventorWorkspace";

export const metadata: Metadata = {
  title: "Your inventor workspace — SmartProBonoIP",
  description:
    "Every invention you are preparing, with readiness, timeline, and professional handoff exports in one place.",
  robots: { index: false, follow: false },
};

export default function WorkspacePage() {
  return <InventorWorkspace />;
}
