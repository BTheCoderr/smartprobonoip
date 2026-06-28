"use client";

import Link from "next/link";
import { trackPartnerInterestClicked } from "@/lib/analytics/client";

export function PartnerInterestLink({
  href,
  ctaName,
  pageSection,
  className,
  children,
}: {
  href: string;
  ctaName: string;
  pageSection: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackPartnerInterestClicked({
          ctaName,
          pageSection,
        })
      }
    >
      {children}
    </Link>
  );
}
