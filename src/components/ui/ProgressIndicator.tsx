interface ProgressIndicatorProps {
  steps: string[];
  current: number;
}

export function ProgressIndicator({ steps, current }: ProgressIndicatorProps) {
  const pct = Math.round(((current + 1) / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-mist-200/80 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
            Step {current + 1} of {steps.length}
          </p>
          <p className="mt-1 text-lg font-semibold text-navy-900">
            {steps[current]}
          </p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
          {pct}% complete
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-mist-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="mt-4 hidden gap-1 sm:grid sm:grid-cols-7">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`truncate rounded-lg px-2 py-2 text-center text-[10px] font-medium leading-tight ${
              i === current
                ? "bg-teal-50 text-teal-800 ring-1 ring-teal-200"
                : i < current
                  ? "text-navy-600"
                  : "text-navy-300"
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
