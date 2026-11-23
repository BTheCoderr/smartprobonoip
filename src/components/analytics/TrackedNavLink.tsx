"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/client";
import type { AnalyticsEventName } from "@/lib/analytics/events";

export function TrackedNavLink({
  href,
  event,
  className,
  children,
  metadata,
  ctaId,
  pageSection,
}: {
  href: string;
  event: AnalyticsEventName;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string | number | boolean | undefined>;
  /** Stable lowercase id (e.g. "home_hero_start_ip"); also fires landing_cta_clicked. */
  ctaId?: string;
  pageSection?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        if (event !== "landing_cta_clicked") trackEvent(event, { metadata });
        if (ctaId) {
          trackEvent("landing_cta_clicked", {
            metadata: { ctaId, pageSection, ctaName: ctaId },
          });
        }
      }}
    >
      {children}
    </Link>
  );
}
