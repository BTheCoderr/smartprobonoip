"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureTrackingFromSearch } from "@/lib/partnerTracking";

function PartnerTrackingCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    if (query) captureTrackingFromSearch(`?${query}`);
  }, [searchParams]);

  return null;
}

export function PartnerTrackingInit() {
  return (
    <Suspense fallback={null}>
      <PartnerTrackingCapture />
    </Suspense>
  );
}
