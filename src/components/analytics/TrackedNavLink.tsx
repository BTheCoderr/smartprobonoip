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
}: {
  href: string;
  event: AnalyticsEventName;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string | number | boolean | undefined>;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent(event, { metadata })}
    >
      {children}
    </Link>
  );
}
