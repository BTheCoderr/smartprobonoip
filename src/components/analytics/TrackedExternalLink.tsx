"use client";

import type { AnalyticsEventName } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/client";

export function TrackedExternalLink({
  href,
  event,
  linkLabel,
  linkType,
  className,
  children,
}: {
  href: string;
  event: AnalyticsEventName;
  linkLabel: string;
  linkType?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() =>
        trackEvent(event, {
          metadata: { linkLabel, linkType: linkType ?? "external" },
        })
      }
    >
      {children}
    </a>
  );
}
