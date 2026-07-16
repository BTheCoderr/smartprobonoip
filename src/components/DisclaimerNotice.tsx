import { DISCLAIMER } from "@/lib/disclaimer";

export function DisclaimerNotice({ compact = false }: { compact?: boolean }) {
  const paragraphs = DISCLAIMER.split("\n\n");
  return (
    <div className="notice-banner-strong">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900">
        <span aria-hidden>⚠️</span> Important: this is not legal advice
      </p>
      <div className="space-y-2 text-sm leading-relaxed text-navy-800">
        {(compact ? paragraphs.slice(0, 1) : paragraphs).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
