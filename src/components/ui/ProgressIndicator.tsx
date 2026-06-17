interface ProgressIndicatorProps {
  steps: string[];
  current: number;
}

export function ProgressIndicator({ steps, current }: ProgressIndicatorProps) {
  const pct = Math.round(((current + 1) / steps.length) * 100);
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-navy-500">
        <span>
          Step {current + 1} of {steps.length}
        </span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-mist-200">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="mt-3 hidden gap-2 sm:flex">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`flex-1 truncate border-t-2 pt-2 text-[11px] ${
              i <= current
                ? "border-teal-500 text-navy-700"
                : "border-mist-200 text-navy-300"
            }`}
            title={label}
          >
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}
