import type { Metadata } from "next";
import { InventorWorkspace } from "@/components/dashboard/InventorWorkspace";
import { getPlatformAuth } from "@/lib/account/auth";

export const metadata: Metadata = {
  title: "Your SmartProBono workspace",
  description:
    "Legal matters and SmartProBonoIP invention preparation in one workspace.",
  robots: { index: false, follow: false },
};

export default async function WorkspacePage() {
  let account: { email: string | null } | null = null;

  try {
    const auth = await getPlatformAuth();
    account = auth ? { email: auth.email } : null;
  } catch {
    account = null;
  }

  return <InventorWorkspace account={account} />;
}
