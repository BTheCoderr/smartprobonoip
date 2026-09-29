import type { Metadata } from "next";
import { Suspense } from "react";
import PlatformLoginClient from "@/app/sign-in/PlatformLoginClient";
import { PaperShell } from "@/components/ui/design";

export const metadata: Metadata = {
  title: "Sign in to SmartProBono",
  description: "Sign in to save SmartProBono Legal matters and link your IP workspace.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <PaperShell className="py-12 sm:py-16">
      <Suspense fallback={<div className="mx-auto max-w-lg text-sm text-navy-500">Loading sign in…</div>}>
        <PlatformLoginClient />
      </Suspense>
    </PaperShell>
  );
}
