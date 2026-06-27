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
  accent?: "teal" | "navy" | "warm";
}) {
  const accentClass = {
    teal: "from-teal-500 to-teal-600",
    navy: "from-navy-700 to-navy-900",
    warm: "from-warm-500 to-warm-700",
  }[accent];

  return (
    <Card variant="elevated" className="relative overflow-hidden">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass}`}
      />
      <p className="text-sm font-medium text-navy-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-navy-900">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs leading-relaxed text-navy-400">{hint}</p>
      ) : null}
    </Card>
  );
}
