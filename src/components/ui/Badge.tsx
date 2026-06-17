import type { ReactNode } from "react";

type BadgeTone = "navy" | "teal" | "amber" | "gray";

const TONES: Record<BadgeTone, string> = {
  navy: "bg-navy-50 text-navy-700 border-navy-100",
  teal: "bg-teal-50 text-teal-700 border-teal-100",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  gray: "bg-mist-100 text-navy-500 border-mist-200",
};

export function Badge({
  children,
  tone = "teal",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
