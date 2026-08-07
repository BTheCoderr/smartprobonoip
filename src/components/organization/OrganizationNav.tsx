"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandMark";
import { ROUTES } from "@/lib/routes";

const NAV = [
  { href: ROUTES.organization, label: "Inbox" },
  { href: ROUTES.organizationMetrics, label: "Metrics" },
];

export function OrganizationNav() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/organization/auth/logout", { method: "POST" });
    window.location.href = ROUTES.organizationLogin;
  }

  return (
    <header className="border-b border-mist-200 bg-white">
      <div className="page-shell flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-4">
          <BrandMark variant="compact" href={ROUTES.home} />
          <span className="text-sm font-semibold text-navy-800">Organization</span>
        </div>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 font-medium ${
                pathname === item.href
                  ? "bg-teal-50 text-teal-800"
                  : "text-navy-600 hover:bg-mist-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md px-3 py-2 font-medium text-navy-600 hover:bg-mist-100"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
