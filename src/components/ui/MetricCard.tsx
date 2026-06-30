import { Card } from "./Card";

export function MetricCard({
  label,
  value,
  hint,
  accent = "teal",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "teal" | "navy" | "aqua";
}) {
  const accentClass = {
    teal: "from-teal-500 to-teal-700",
    navy: "from-navy-700 to-navy-950",
    aqua: "from-aqua-400 to-teal-600",
  }[accent];

  return (
    <Card variant="elevated" className="paper-card relative overflow-hidden">
      <div
        className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${accentClass}`}
      />
      <p className="pl-3 text-[10px] font-bold uppercase tracking-wide text-muted-blue">
        {label}
      </p>
      <p className="mt-3 pl-3 text-3xl font-bold tracking-tight text-navy-900">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 pl-3 text-xs leading-relaxed text-navy-400">{hint}</p>
      ) : null}
    </Card>
  );
}
