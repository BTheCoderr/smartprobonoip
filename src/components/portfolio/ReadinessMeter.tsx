import { readinessBand } from "@/lib/portfolio/aggregate";

const BAR_TONES = {
  teal: "bg-teal-500",
  aqua: "bg-aqua-400",
  navy: "bg-navy-400",
} as const;

export function ReadinessMeter({
  score,
  size = "default",
  showLabel = true,
}: {
  score: number;
  size?: "default" | "compact";
  showLabel?: boolean;
}) {
  const band = readinessBand(score);
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div>
      {showLabel ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-navy-500">{band.label}</span>
          <span className="text-xs font-semibold tabular-nums text-navy-900">
            {clamped}
            <span className="font-normal text-navy-400">/100</span>
          </span>
        </div>
      ) : null}
      <div
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Packet preparation score ${clamped} of 100 — ${band.label}`}
        className={`w-full overflow-hidden rounded-full bg-mist-100 ${
          size === "compact" ? "h-1.5" : "h-2"
        }`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${BAR_TONES[band.tone]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
