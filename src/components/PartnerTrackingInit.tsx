"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics/client";
import {
  captureTrackingFromSearch,
  parseTrackingFromSearch,
} from "@/lib/partnerTracking";

const REFERRAL_EVENT_PREFIX = "smartprobonoip:partner-referral-clicked:";

function PartnerTrackingCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const query = searchParams.toString();
    if (!query) return;

    const search = `?${query}`;
    const incoming = parseTrackingFromSearch(search);
    captureTrackingFromSearch(search);
    if (!incoming) return;

    const signature = [
      incoming.partnerSlug ?? "",
      incoming.source ?? "",
      incoming.campaign ?? "",
    ].join("|");
    if (!signature.replaceAll("|", "") || firedRef.current.has(signature)) return;

    const storageKey = `${REFERRAL_EVENT_PREFIX}${signature}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // In-memory dedupe below still prevents duplicate firing in this mount.
    }

    firedRef.current.add(signature);
    trackEvent("partner_referral_link_clicked", {
      route: pathname,
      metadata: {
        partner: incoming.partnerSlug,
        source: incoming.source,
        campaign: incoming.campaign,
        pageSection: "referral_landing",
      },
    });
  }, [pathname, searchParams]);

  return null;
}

export function PartnerTrackingInit() {
  return (
    <Suspense fallback={null}>
      <PartnerTrackingCapture />
    </Suspense>
  );
}
