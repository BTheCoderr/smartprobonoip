"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

const ITEMS = [
  { step: 1, label: "Disclaimer acknowledged", href: "/smartprobonoip/disclaimer?demo=1" },
  { step: 2, label: "Guided intake (sample invention)", href: "/smartprobonoip/start?demo=1" },
  { step: 3, label: "Generated IP Readiness Profile", href: "/smartprobonoip/start?demo=1" },
  { step: 4, label: "PDF export from profile page", href: "/smartprobonoip/start?demo=1" },
  { step: 5, label: "Dashboard metrics", href: "/smartprobonoip/dashboard?demo=1" },
];

export function DemoChecklist() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Card className="border-teal-200 bg-teal-50/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-navy-900">Demo walkthrough</h3>
          <p className="mt-1 text-xs text-navy-600">
            Five proof points for partner presentations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-xs text-navy-500 hover:text-navy-700"
        >
          Dismiss
        </button>
      </div>
      <ol className="mt-4 space-y-2">
        {ITEMS.map((item) => (
          <li key={item.step} className="flex items-center gap-2 text-sm text-navy-700">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
              {item.step}
            </span>
            <a href={item.href} className="hover:text-teal-700 hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </Card>
  );
}
