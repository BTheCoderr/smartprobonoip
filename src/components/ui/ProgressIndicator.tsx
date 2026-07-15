interface ProgressIndicatorProps {
  steps: string[];
  current: number;
  saveStatus?: string | null;
}

export function ProgressIndicator({
  steps,
  current,
  saveStatus,
}: ProgressIndicatorProps) {
  const pct = Math.round(((current + 1) / steps.length) * 100);

  return (
    <div className="rounded-md border border-mist-200/90 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-teal-700">
            Step {current + 1} of {steps.length}
          </p>
          <p className="headline-editorial mt-1 truncate text-lg text-navy-900 sm:text-xl">
            {steps[current]}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-teal-600 px-3 py-1 text-xs font-bold tabular-nums text-white">
            {pct}%
          </span>
          {saveStatus ? (
            <span className="text-[10px] font-medium text-teal-700">{saveStatus}</span>
          ) : null}
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-mist-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex gap-1 sm:hidden">
        {steps.map((label, i) => (
          <span
            key={label}
            title={label}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= current ? "bg-teal-500" : "bg-mist-200"
            }`}
          />
        ))}
      </div>

      <ol className="mt-4 hidden gap-1 sm:grid sm:grid-cols-7">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`truncate rounded-md px-1.5 py-2 text-center text-[10px] font-medium leading-tight ${
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
