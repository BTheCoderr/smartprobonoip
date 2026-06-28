import { Suspense } from "react";
import LeadsClient from "./LeadsClient";

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-navy-500">
          Loading leads…
        </div>
      }
    >
      <LeadsClient />
    </Suspense>
  );
}
