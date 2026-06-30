import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand/BrandMark";

export function StampLabel({
  children,
  tone = "teal",
}: {
  children: ReactNode;
  tone?: "teal" | "aqua" | "navy";
}) {
  const toneClass = {
    teal: "stamp-label-teal",
    aqua: "stamp-label-aqua",
    navy: "stamp-label-navy",
  }[tone];
  return <span className={`stamp-label ${toneClass}`}>{children}</span>;
}

export function SectionKicker({
  children,
  light,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p className={`section-kicker ${light ? "text-teal-300" : ""}`}>
      {children}
    </p>
  );
}

export function RuledDivider({ className = "" }: { className?: string }) {
  return <hr className={`ruled-divider ${className}`} />;
}

export function PaperShell({
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
      : "paper-shell";
  return <div className={`${width} ${className}`}>{children}</div>;
}

/** @deprecated Use PaperShell — kept for existing imports */
export const PageShell = PaperShell;

export function PaperStack({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="paper-stack-back inset-0 translate-x-3 translate-y-3" />
      <div className="paper-stack-back inset-0 translate-x-1.5 translate-y-1.5 bg-white/80" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function DossierCard({
  tab,
  title,
  body,
  index,
}: {
  tab?: string;
  title: string;
  body: string;
  index?: number;
}) {
  return (
    <article className="dossier-card flex h-full flex-col">
      <div className="flex items-end gap-0 border-b border-dashed border-mist-200 bg-cream/60 px-4 pt-3">
        {tab ? (
          <span className="dossier-card-tab -mb-px rounded-t-md">{tab}</span>
        ) : index != null ? (
          <span className="dossier-card-tab -mb-px rounded-t-md">
            Sheet {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          {index != null ? (
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-dashed border-teal-300 bg-teal-50 text-[10px] font-bold text-teal-700">
              ✓
            </span>
          ) : null}
          <div>
            <h3 className="text-base font-semibold leading-snug text-navy-900 sm:text-lg">
              {title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-blue">
              {body}
            </p>
          </div>
        </div>
        <RuledDivider className="mt-5" />
      </div>
    </article>
  );
}

export function AccessBand({
  kicker,
  title,
  lead,
  children,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <section className="access-band">
      <PaperShell className="relative py-14 sm:py-16">
        {kicker ? (
          <StampLabel tone="aqua">{kicker}</StampLabel>
        ) : null}
        <h2 className="headline-editorial mt-5 max-w-3xl text-2xl sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {lead ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-100/90 sm:text-lg">
            {lead}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </PaperShell>
    </section>
  );
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

export function ProductFeatureMock({
  title,
  body,
  previewLines,
  index,
}: {
  title: string;
  body: string;
  previewLines: readonly string[];
  index?: number;
}) {
  return (
    <article className="dossier-card flex h-full flex-col overflow-hidden">
      <div className="border-b border-dashed border-mist-200 bg-cream/60 px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <StampLabel tone="teal">PRODUCT</StampLabel>
          {index != null ? (
            <span className="text-[10px] font-mono uppercase tracking-wider text-navy-400">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
        </div>
        <h3 className="headline-editorial mt-3 text-lg leading-snug text-navy-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-blue">{body}</p>
      </div>
      <div
        className="relative flex-1 space-y-2 bg-white/90 px-5 py-4"
        aria-hidden
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgb(2 46 85 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(2 46 85 / 0.04) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />
        {previewLines.map((line) => (
          <div
            key={line}
            className="relative border border-mist-200/90 bg-cream/50 px-3 py-2 text-xs leading-relaxed text-navy-600"
          >
            {line}
          </div>
        ))}
      </div>
    </article>
  );
}

export function HowItWorksStep({
  step,
  title,
  body,
  showArrow,
}: {
  step: number;
  title: string;
  body: string;
  showArrow?: boolean;
}) {
  return (
    <div className="flex flex-col items-stretch">
      <div className="dossier-card h-full px-5 py-5 sm:px-6 sm:py-6">
        <span className="flex h-8 w-8 items-center justify-center border border-dashed border-teal-400 bg-teal-50 text-sm font-bold text-teal-700">
          {step}
        </span>
        <h3 className="headline-editorial mt-4 text-lg leading-snug text-navy-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-blue">{body}</p>
      </div>
      {showArrow ? (
        <p
          className="my-2 text-center text-xl text-teal-500 lg:hidden"
          aria-hidden
        >
          ↓
        </p>
      ) : null}
    </div>
  );
}

export function PacketMockup() {
  const sections = [
    "Idea Summary",
    "What may matter",
    "Questions to ask",
    "Next best step",
  ];

  return (
    <PaperStack className="mx-auto w-full max-w-[340px]">
      <div
        className="paper-card-elevated relative overflow-hidden"
        aria-hidden
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgb(2 46 85 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(2 46 85 / 0.04) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="absolute -right-1 top-6 flex flex-col gap-1">
          {["Tab A", "Tab B"].map((t) => (
            <span
              key={t}
              className="rounded-l-sm border border-r-0 border-mist-200 bg-mist-50 px-1.5 py-2 text-[8px] font-semibold uppercase tracking-wider text-navy-400 [writing-mode:vertical-rl]"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="relative border-b border-dashed border-mist-200 bg-cream/70 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StampLabel tone="aqua">PREP PACKET</StampLabel>
            <StampLabel tone="teal">IP READINESS</StampLabel>
          </div>
          <p className="headline-editorial mt-4 text-xl leading-snug sm:text-2xl">
            Your idea, organized
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-blue">
            From scattered notes to a handoff dossier.
          </p>
        </div>
        <div className="relative space-y-0 px-5 py-4 sm:px-6 sm:py-5">
          {sections.map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 border border-mist-200/80 bg-white/90 px-3 py-2.5 ${i > 0 ? "-mt-px" : ""}`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-dashed border-teal-400/60 bg-teal-50 text-[9px] font-bold text-teal-700">
                ✓
              </span>
              <span className="text-xs font-medium text-navy-700">{label}</span>
              <span className="ml-auto text-[9px] font-mono uppercase tracking-wider text-navy-400">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
        <div className="relative border-t border-dashed border-mist-300 bg-cream/50 px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StampLabel tone="navy">NOT LEGAL ADVICE</StampLabel>
            <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-navy-400">
              Preparation only
            </p>
          </div>
        </div>
      </div>
    </PaperStack>
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
    <section className="paper-grid relative overflow-hidden border-b border-mist-200/80">
      <div className="paper-shell relative py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <BrandMark variant="full" size="lg" className="mb-6" />
            <StampLabel tone="teal">{stamp}</StampLabel>
            <h1 className="headline-editorial mt-5 text-[2rem] leading-[1.06] sm:text-5xl lg:text-[3.15rem]">
              {title}
            </h1>
            <RuledDivider className="mt-6 max-w-md" />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-blue sm:text-lg">
              {lead}
            </p>
            {mission ? (
              <blockquote className="mt-6 max-w-lg border-l-2 border-teal-400/80 pl-4">
                <p className="text-base italic leading-relaxed text-navy-700">
                  {mission}
                </p>
              </blockquote>
            ) : null}
            {children ? <div className="mt-9">{children}</div> : null}
            {safetyLine ? (
              <p className="mt-5 max-w-lg border border-dashed border-mist-300 bg-white/60 px-3 py-2 text-[11px] leading-relaxed text-navy-500">
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

export function DossierPageHeader({
  stamps,
  kicker,
  title,
  lead,
  meta,
  aside,
  narrow,
}: {
  stamps?: ReactNode;
  kicker?: string;
  title: string;
  lead?: string;
  meta?: string;
  aside?: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="paper-grid border-b border-mist-200/80">
      <PaperShell packet={!narrow} narrow={narrow} className="py-10 sm:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <BrandMark variant="compact" className="mb-5" />
            {stamps ? (
              <div className="flex flex-wrap items-center gap-2">{stamps}</div>
            ) : null}
            {kicker ? <SectionKicker>{kicker}</SectionKicker> : null}
            <h1 className="headline-editorial mt-3 text-3xl sm:text-4xl">
              {title}
            </h1>
            {lead ? (
              <p className="mt-4 text-sm leading-relaxed text-muted-blue sm:text-base">
                {lead}
              </p>
            ) : null}
            {meta ? (
              <p className="mt-4 text-xs text-navy-400">{meta}</p>
            ) : null}
          </div>
          {aside ? <div className="shrink-0 lg:max-w-xs">{aside}</div> : null}
        </div>
      </PaperShell>
    </div>
  );
}

export function Section({
  children,
  className = "",
  soft,
  navy,
  id,
}: {
  children: ReactNode;
  className?: string;
  soft?: boolean;
  navy?: boolean;
  id?: string;
}) {
  const bg = navy
    ? "bg-navy-950 text-white"
    : soft
      ? "bg-cream"
      : "";
  return (
    <section id={id} className={`py-14 sm:py-20 ${bg} ${className}`}>
      {children}
    </section>
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
      {kicker ? <SectionKicker light={light}>{kicker}</SectionKicker> : null}
      <h2
        className={`headline-editorial mt-3 text-2xl sm:text-3xl ${light ? "text-white" : "text-navy-900"}`}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={`mt-3 text-base leading-relaxed sm:text-lg ${light ? "text-navy-100/90" : "text-muted-blue"}`}
        >
          {lead}
        </p>
      ) : null}
      {!center ? <RuledDivider className="mt-5 max-w-xs" /> : null}
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
    <section className="paper-grid relative overflow-hidden border-b border-mist-200/80">
      <PaperShell className="relative py-14 sm:py-20 lg:py-24">
        <SectionKicker>{kicker}</SectionKicker>
        <h1 className="headline-editorial mt-4 max-w-4xl text-4xl leading-[1.06] sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-blue sm:text-xl">
          {lead}
        </p>
        {mission ? (
          <p className="mt-4 max-w-2xl border-l-2 border-teal-400 pl-4 text-base italic leading-relaxed text-navy-700">
            {mission}
          </p>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </PaperShell>
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
      <SectionKicker light>{kicker}</SectionKicker>
      <p className="headline-editorial mt-4 max-w-4xl text-2xl leading-snug sm:text-3xl">
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
  title,
  body,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
}) {
  return <DossierCard title={title} body={body} />;
}

export function StepCard({
  step,
  title,
}: {
  step: number;
  title: string;
}) {
  return (
    <div className="dossier-card px-5 py-5">
      <span className="section-kicker">Step {step}</span>
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
    <article className="dossier-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-dashed border-mist-200 bg-cream/60 px-5 py-3">
        <StampLabel tone="navy">REVIEW NOTE</StampLabel>
        <h4 className="text-base font-semibold text-navy-900">{label}</h4>
      </div>
      <dl className="space-y-4 px-5 py-5 text-sm leading-relaxed text-navy-600">
        <div>
          <dt className="section-kicker text-teal-700">Why it may matter</dt>
          <dd className="mt-1.5">{whyItMatters}</dd>
        </div>
        <div>
          <dt className="section-kicker text-teal-700">What to prepare</dt>
          <dd className="mt-1.5">{whatToPrepare}</dd>
        </div>
        <div>
          <dt className="section-kicker text-teal-700">Suggested resource type</dt>
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
  tone?: "teal" | "aqua" | "navy";
}) {
  const styles = {
    teal: "border-teal-200 bg-teal-50/40",
    aqua: "border-aqua-200 bg-aqua-50/60",
    navy: "border-navy-200 bg-navy-50/40",
  }[tone];
  return (
    <div className={`dossier-card border px-5 py-5 sm:px-6 ${styles}`}>
      <StampLabel tone={tone === "navy" ? "navy" : tone === "aqua" ? "aqua" : "teal"}>
        Important
      </StampLabel>
      <h3 className="headline-editorial mt-4 text-lg sm:text-xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-blue">{body}</p>
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
    <div className="rounded-md border border-dashed border-mist-300 bg-white/80 px-6 py-10 text-center shadow-[var(--shadow-soft)]">
      <h3 className="headline-editorial text-lg">{title}</h3>
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
    <div className="dossier-card border border-teal-200/80 bg-gradient-to-br from-teal-50/40 via-white to-aqua-50/30 p-6 sm:p-8">
      <StampLabel tone="teal">SAVE ACCESS</StampLabel>
      <h3 className="headline-editorial mt-3 text-xl">{title}</h3>
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
      className={`dossier-card overflow-hidden shadow-[var(--shadow-paper)] sm:p-8 ${styles}`}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-mist-200/80 px-6 pb-4 pt-6 sm:px-8">
        {kicker ? (
          <span className="document-tab border-0 bg-teal-50/80 text-teal-700">
            {kicker}
          </span>
        ) : null}
      </div>
      <div className="px-6 sm:px-8">
        <h2 className="headline-editorial mt-4 text-xl sm:text-2xl">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-blue">{subtitle}</p>
        ) : null}
        <div className="mt-6 pb-6">{children}</div>
      </div>
    </section>
  );
}
