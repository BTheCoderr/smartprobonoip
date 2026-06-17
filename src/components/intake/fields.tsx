"use client";

import type { Option } from "@/lib/labels";

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-navy-800">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-navy-500">{hint}</span> : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-navy-800">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-navy-500">{hint}</span> : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-2 w-full rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function YesNoField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-navy-800">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-navy-500">{hint}</span> : null}
      <div className="mt-2 flex gap-2">
        {[
          { v: true, l: "Yes" },
          { v: false, l: "No" },
        ].map((o) => (
          <button
            key={o.l}
            type="button"
            onClick={() => onChange(o.v)}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              value === o.v
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-mist-200 bg-white text-navy-600 hover:bg-mist-50"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CheckboxGroup<T extends string>({
  label,
  hint,
  options,
  selected,
  onToggle,
}: {
  label: string;
  hint?: string;
  options: Option<T>[];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-navy-800">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-navy-500">{hint}</span> : null}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const active = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(o.value)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                active
                  ? "border-teal-500 bg-teal-50 text-teal-800"
                  : "border-mist-200 bg-white text-navy-600 hover:bg-mist-50"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  active ? "border-teal-500 bg-teal-500 text-white" : "border-mist-300"
                }`}
              >
                {active ? "✓" : ""}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ClarityScale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const scale = [1, 2, 3, 4, 5];
  return (
    <div>
      <span className="text-sm font-medium text-navy-800">{label}</span>
      <div className="mt-3 flex gap-2">
        {scale.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-12 flex-1 rounded-lg border text-sm font-semibold transition ${
              value === n
                ? "border-teal-500 bg-teal-500 text-white"
                : "border-mist-200 bg-white text-navy-600 hover:bg-mist-50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-navy-500">
        <span>Not clear at all</span>
        <span>Very clear</span>
      </div>
    </div>
  );
}
