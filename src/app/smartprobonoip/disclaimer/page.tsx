import { Suspense } from "react";
import DisclaimerClient from "./DisclaimerClient";

export default function DisclaimerPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-12 text-sm text-navy-500">
          Loading disclaimer…
        </div>
      }
    >
      <DisclaimerClient />
    </Suspense>
  );
}
