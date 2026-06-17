import { DISCLAIMER } from "@/lib/disclaimer";

export function DisclaimerNotice({ compact = false }: { compact?: boolean }) {
  const paragraphs = DISCLAIMER.split("\n\n");
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
        <span aria-hidden>⚠️</span> Important: this is not legal advice
      </p>
      <div className="space-y-2 text-sm leading-relaxed text-amber-900">
        {(compact ? paragraphs.slice(0, 1) : paragraphs).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
