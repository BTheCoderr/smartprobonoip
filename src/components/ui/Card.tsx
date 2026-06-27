import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "soft" | "accent";
}

const VARIANTS = {
  default: "rounded-2xl border border-mist-200/80 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8",
  elevated:
    "rounded-2xl border border-mist-200/80 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8",
  soft: "rounded-2xl border border-mist-200/60 bg-mist-50/80 p-6 shadow-[var(--shadow-soft)] sm:p-8",
  accent:
    "rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/80 to-white p-6 shadow-[var(--shadow-soft)] sm:p-8",
};

export function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  return (
    <div className={`${VARIANTS[variant]} ${className}`}>{children}</div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  kicker?: string;
}

export function CardHeader({ title, subtitle, icon, kicker }: CardHeaderProps) {
  return (
    <div className="mb-5 flex items-start gap-4">
      {icon ? (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-lg text-teal-700 ring-1 ring-teal-100">
          {icon}
        </span>
      ) : null}
      <div>
        {kicker ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-600">
            {kicker}
          </p>
        ) : null}
        <h3 className="text-lg font-semibold tracking-tight text-navy-900 sm:text-xl">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1.5 text-sm leading-relaxed text-navy-500">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
