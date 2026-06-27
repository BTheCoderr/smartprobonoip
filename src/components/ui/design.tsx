import Link from "next/link";
import type { ReactNode } from "react";

export function PageShell({
  children,
  narrow,
  packet,
  className = "",
}: {
  children: ReactNode;
  narrow?: boolean;
  packet?: boolean;
  className?: string;
}) {
  const width = packet
    ? "page-shell-packet"
    : narrow
      ? "page-shell-narrow"
      : "page-shell";
  return <div className={`${width} ${className}`}>{children}</div>;
}

export function Section({
  children,
  className = "",
  soft,
  navy,
}: {
  children: ReactNode;
  className?: string;
  soft?: boolean;
  navy?: boolean;
}) {
  const bg = navy
    ? "bg-navy-900 text-white"
    : soft
      ? "bg-gradient-to-b from-sky-50/80 to-surface"
      : "";
  return (
    <section className={`py-16 sm:py-20 ${bg} ${className}`}>{children}</section>
  );
}

export function SectionHeader({
  kicker,
  title,
  lead,
  light,
  center,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {kicker ? (
        <p
          className={`text-sm font-semibold uppercase tracking-wide ${light ? "text-teal-300" : "text-teal-600"}`}
        >
          {kicker}
        </p>
      ) : null}
      <h2
        className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${light ? "text-white" : "text-navy-900"}`}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={`mt-3 text-base leading-relaxed sm:text-lg ${light ? "text-navy-100/90" : "text-navy-600"}`}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export function HeroSection({
  kicker,
  title,
  lead,
  mission,
  children,
}: {
  kicker: string;
  title: string;
  lead: string;
  mission?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-mist-200/60 bg-gradient-to-b from-cream via-white to-surface">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(20,163,163,0.12),transparent_42%),radial-gradient(circle_at_0%_100%,rgba(217,119,6,0.08),transparent_38%)]" />
      <div className="page-shell relative py-16 sm:py-24 lg:py-28">
        <p className="section-kicker">{kicker}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.06] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy-600 sm:text-xl">
          {lead}
        </p>
        {mission ? (
          <p className="mt-4 max-w-2xl border-l-4 border-warm-400 pl-4 text-base italic leading-relaxed text-navy-700">
            {mission}
          </p>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}

export function MissionBand({
  kicker = "Our mission",
  quote,
  body,
}: {
  kicker?: string;
  quote: string;
  body?: string;
}) {
  return (
    <div className="mission-band relative overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-warm-500/10 blur-3xl" />
      <p className="text-sm font-semibold uppercase tracking-wide text-warm-200">
        {kicker}
      </p>
      <p className="mt-4 max-w-4xl text-2xl font-semibold leading-snug sm:text-3xl">
        {quote}
      </p>
      {body ? (
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-navy-100/90">
          {body}
        </p>
      ) : null}
    </div>
  );
}

export function ValueCard({
  icon,
  title,
  body,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-mist-200/80 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      {icon ? (
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
          {icon}
        </span>
      ) : null}
      <h3 className="mt-5 text-xl font-semibold text-navy-900">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">{body}</p>
    </div>
  );
}

export function StepCard({
  step,
  title,
}: {
  step: number;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-mist-200/70 bg-white/90 p-5 shadow-[var(--shadow-soft)]">
      <span className="text-xs font-bold uppercase tracking-wide text-teal-600">
        Step {step}
      </span>
      <p className="mt-2 text-base font-semibold leading-snug text-navy-900">
        {title}
      </p>
    </div>
  );
}

export function SignalCard({
  label,
  whyItMatters,
  whatToPrepare,
  suggestedResourceType,
}: {
  label: string;
  whyItMatters: string;
  whatToPrepare: string;
  suggestedResourceType: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-mist-200/80 bg-white shadow-[var(--shadow-soft)]">
      <div className="border-l-4 border-teal-500 bg-gradient-to-r from-teal-50/50 to-white px-5 py-4">
        <h4 className="text-base font-semibold text-navy-900">{label}</h4>
      </div>
      <dl className="space-y-4 px-5 py-5 text-sm leading-relaxed text-navy-600">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-teal-700">
            Why it may matter
          </dt>
          <dd className="mt-1.5">{whyItMatters}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-teal-700">
            What to prepare
          </dt>
          <dd className="mt-1.5">{whatToPrepare}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-teal-700">
            Suggested resource type
          </dt>
          <dd className="mt-1.5">{suggestedResourceType}</dd>
        </div>
      </dl>
    </article>
  );
}

export function CalloutCard({
  title,
  body,
  tone = "teal",
}: {
  title: string;
  body: string;
  tone?: "teal" | "warm" | "navy";
}) {
  const styles = {
    teal: "border-teal-200 bg-teal-50/60",
    warm: "border-warm-200 bg-warm-50/80",
    navy: "border-navy-200 bg-navy-50/50",
  }[tone];
  return (
    <div className={`rounded-2xl border px-5 py-5 sm:px-6 ${styles}`}>
      <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-600">{body}</p>
    </div>
  );
}

export function EmptyStateCard({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-3xl border border-dashed border-mist-300 bg-white/80 px-6 py-10 text-center shadow-[var(--shadow-soft)]">
      <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-navy-500">
        {body}
      </p>
      {action ? (
        <Link href={action.href} className="btn-primary mt-6 inline-flex">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function RecoveryCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-50/70 via-white to-warm-50/30 p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
        Save access
      </p>
      <h3 className="mt-1 text-xl font-semibold text-navy-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function PacketSection({
  kicker,
  title,
  subtitle,
  children,
  accent = "white",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  accent?: "white" | "soft" | "navy" | "teal";
}) {
  const styles = {
    white: "border-mist-200/80 bg-white",
    soft: "border-mist-200/60 bg-mist-50/50",
    navy: "border-navy-200/80 bg-gradient-to-br from-navy-50/40 to-white",
    teal: "border-teal-200/80 bg-gradient-to-br from-teal-50/40 to-white",
  }[accent];
  return (
    <section
      className={`overflow-hidden rounded-3xl border p-6 shadow-[var(--shadow-soft)] sm:p-8 ${styles}`}
    >
      {kicker ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
          {kicker}
        </p>
      ) : null}
      <h2 className="mt-1 text-xl font-bold text-navy-900 sm:text-2xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-sm leading-relaxed text-navy-500">{subtitle}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
