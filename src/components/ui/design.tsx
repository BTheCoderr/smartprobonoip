import Link from "next/link";
import type { ReactNode } from "react";

export function StampLabel({
  children,
  tone = "teal",
}: {
  children: ReactNode;
  tone?: "teal" | "warm" | "navy";
}) {
  const toneClass = {
    teal: "stamp-label-teal",
    warm: "stamp-label-warm",
    navy: "stamp-label-navy",
  }[tone];
  return <span className={`stamp-label ${toneClass}`}>{children}</span>;
}

export function PaperCard({
  children,
  className = "",
  elevated,
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <div className={`${elevated ? "paper-card-elevated" : "paper-card"} ${className}`}>
      {children}
    </div>
  );
}

export function PacketMockup() {
  const sections = [
    "Idea summary",
    "What may matter",
    "Questions to ask",
    "Next best step",
  ];

  return (
    <div
      className="relative mx-auto w-full max-w-[320px]"
      aria-hidden
    >
      <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl border border-mist-200/60 bg-mist-100/80" />
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border border-mist-200/70 bg-white/90 shadow-sm" />
      <div className="paper-card-elevated relative overflow-hidden p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <StampLabel tone="warm">PREP PACKET</StampLabel>
          <StampLabel tone="teal">IP READINESS</StampLabel>
        </div>
        <p className="headline-editorial mt-4 text-lg leading-snug">
          Your idea, organized
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-blue">
          From messy notes to a handoff you can bring with you.
        </p>
        <ul className="mt-5 space-y-2">
          {sections.map((label, i) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-lg border border-dashed border-mist-200 bg-cream/60 px-3 py-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-50 text-[10px] font-bold text-teal-700 ring-1 ring-teal-100">
                {i + 1}
              </span>
              <span className="text-xs font-medium text-navy-700">{label}</span>
            </li>
          ))}
        </ul>
        <div className="dashed-rule mt-5 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">
            Preparation only · Not legal advice
          </p>
        </div>
      </div>
    </div>
  );
}

export function CreativeHeroSection({
  stamp,
  title,
  lead,
  mission,
  safetyLine,
  children,
}: {
  stamp: string;
  title: string;
  lead: string;
  mission?: string;
  safetyLine?: string;
  children?: ReactNode;
}) {
  return (
    <section className="paper-grid relative overflow-hidden border-b border-mist-200/70">
      <div className="page-shell relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <StampLabel tone="teal">{stamp}</StampLabel>
            <h1 className="headline-editorial mt-6 text-4xl leading-[1.08] sm:text-5xl lg:text-[3.25rem]">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-blue sm:text-xl">
              {lead}
            </p>
            {mission ? (
              <p className="mt-5 max-w-lg border-l-4 border-warm-400/80 pl-4 text-base italic leading-relaxed text-navy-700">
                {mission}
              </p>
            ) : null}
            {children ? <div className="mt-10">{children}</div> : null}
            {safetyLine ? (
              <p className="mt-5 max-w-lg text-xs leading-relaxed text-navy-400">
                {safetyLine}
              </p>
            ) : null}
          </div>
          <div className="hidden sm:block lg:justify-self-end">
            <PacketMockup />
          </div>
        </div>
        <div className="mt-10 sm:hidden">
          <PacketMockup />
        </div>
      </div>
    </section>
  );
}

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
    <div className="flex h-full flex-col rounded-2xl border border-mist-200/90 bg-white p-6 shadow-[var(--shadow-paper)] sm:p-8">
      <div className="h-1 w-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
      {icon ? (
        <span className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
          {icon}
        </span>
      ) : null}
      <h3 className={`${icon ? "mt-4" : "mt-5"} text-xl font-semibold text-navy-900`}>
        {title}
      </h3>
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
    <article className="overflow-hidden rounded-2xl border border-mist-200/90 bg-white shadow-[var(--shadow-paper)]">
      <div className="flex items-center gap-3 border-b border-dashed border-mist-200 bg-gradient-to-r from-warm-50/50 via-white to-teal-50/40 px-5 py-3">
        <StampLabel tone="navy">REVIEW NOTE</StampLabel>
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
    <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-white to-warm-50/40 p-6 shadow-[var(--shadow-paper)] sm:p-8">
      <StampLabel tone="teal">SAVE ACCESS</StampLabel>
      <h3 className="mt-3 text-xl font-semibold text-navy-900">{title}</h3>
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
      className={`overflow-hidden rounded-2xl border shadow-[var(--shadow-paper)] sm:p-8 ${styles}`}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-mist-200/80 px-6 pb-4 pt-6 sm:px-8">
        {kicker ? (
          <span className="document-tab border-0 bg-teal-50/80 text-teal-700">
            {kicker}
          </span>
        ) : null}
      </div>
      <div className="px-6 sm:px-8">
        <h2 className="mt-4 text-xl font-bold text-navy-900 sm:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-blue">{subtitle}</p>
        ) : null}
        <div className="mt-6 pb-6">{children}</div>
      </div>
    </section>
  );
}
