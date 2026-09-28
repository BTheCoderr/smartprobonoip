import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Historical SmartProBonoIP URL retained for existing links and bookmarks. */
export default function SmartProBonoIPLegacyPage() {
  redirect(ROUTES.ip);
}
