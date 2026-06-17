import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-mist-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function CardHeader({ title, subtitle, icon }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          {icon}
        </span>
      ) : null}
      <div>
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
