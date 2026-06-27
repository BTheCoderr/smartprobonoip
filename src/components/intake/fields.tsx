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
      <span className="text-sm font-semibold text-navy-900">{label}</span>
      {hint ? (
        <span className="mt-1 block text-sm leading-relaxed text-navy-500">
          {hint}
        </span>
      ) : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="input-surface mt-3"
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
      <span className="text-sm font-semibold text-navy-900">{label}</span>
      {hint ? (
        <span className="mt-1 block text-sm leading-relaxed text-navy-500">
          {hint}
        </span>
      ) : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="input-surface mt-3"
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
      <span className="text-sm font-semibold text-navy-900">{label}</span>
      {hint ? (
        <span className="mt-1 block text-sm leading-relaxed text-navy-500">
          {hint}
        </span>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[
          { v: true, l: "Yes" },
          { v: false, l: "No" },
        ].map((o) => (
          <button
            key={o.l}
            type="button"
            onClick={() => onChange(o.v)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              value === o.v
                ? "border-teal-500 bg-teal-50 text-teal-800 shadow-sm ring-1 ring-teal-200"
                : "border-mist-200 bg-white text-navy-600 hover:border-teal-200 hover:bg-teal-50/40"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RadioGroup<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: Option<T>[];
  value?: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <span className="text-sm font-semibold text-navy-900">{label}</span>
      {hint ? (
        <span className="mt-1 block text-sm leading-relaxed text-navy-500">
          {hint}
        </span>
      ) : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                active
                  ? "border-teal-500 bg-teal-50/80 text-teal-900 shadow-sm ring-1 ring-teal-200"
                  : "border-mist-200 bg-white text-navy-700 hover:border-teal-200 hover:bg-teal-50/30"
              }`}
            >
              {o.label}
            </button>
          );
        })}
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
      <span className="text-sm font-semibold text-navy-900">{label}</span>
      {hint ? (
        <span className="mt-1 block text-sm leading-relaxed text-navy-500">
          {hint}
        </span>
      ) : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((o) => {
          const active = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(o.value)}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                active
                  ? "border-teal-500 bg-teal-50/80 text-teal-900 shadow-sm ring-1 ring-teal-200"
                  : "border-mist-200 bg-white text-navy-700 hover:border-teal-200 hover:bg-teal-50/30"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                  active
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-mist-300 bg-white"
                }`}
              >
                {active ? "✓" : ""}
              </span>
              <span className="leading-snug">{o.label}</span>
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
      {label ? (
        <span className="text-sm font-semibold text-navy-900">{label}</span>
      ) : null}
      <div className={`flex gap-2 ${label ? "mt-4" : ""}`}>
        {scale.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-12 flex-1 rounded-xl border text-sm font-bold transition ${
              value === n
                ? "border-teal-500 bg-teal-600 text-white shadow-sm"
                : "border-mist-200 bg-white text-navy-600 hover:border-teal-200 hover:bg-teal-50/40"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-navy-500">
        <span>Not clear at all</span>
        <span>Very clear</span>
      </div>
    </div>
  );
}

export function ReviewFieldCard({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <CardShell>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          {label}
        </span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="input-surface mt-3 min-h-[88px] resize-y"
        />
      </label>
    </CardShell>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-mist-200/80 bg-mist-50/50 p-5 shadow-sm">
      {children}
    </div>
  );
}
