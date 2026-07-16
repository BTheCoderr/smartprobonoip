"use client";

import { INTAKE_FIELD_WHY } from "@/lib/copy";

export function FieldWhyHelper({ fieldKey }: { fieldKey: keyof typeof INTAKE_FIELD_WHY }) {
  const copy = INTAKE_FIELD_WHY[fieldKey];
  if (!copy) return null;

  return (
    <details className="mb-3 rounded-lg border border-mist-200 bg-white/80 px-3 py-2">
      <summary className="cursor-pointer text-xs font-semibold text-navy-700">
        Why this matters
      </summary>
      <p className="mt-2 text-xs leading-relaxed text-navy-600">{copy.why}</p>
      {copy.example ? (
        <p className="mt-2 text-[11px] leading-relaxed text-navy-500">{copy.example}</p>
      ) : null}
    </details>
  );
}
