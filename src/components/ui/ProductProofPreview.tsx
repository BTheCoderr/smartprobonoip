import type { ReactElement } from "react";
import { DEMO_INVENTION } from "@/lib/demo";
import { SAMPLE_RECORD } from "@/lib/samplePacket";

export type ProductProofVariant =
  | "builder"
  | "snapshot"
  | "timeline"
  | "search"
  | "pdf"
  | "handoff";

function BrowserChrome({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-mist-200 bg-mist-50/80 px-3 py-2">
      <span className="flex gap-1" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-warm-400/70" />
        <span className="h-2 w-2 rounded-full bg-warm-200" />
        <span className="h-2 w-2 rounded-full bg-mist-300" />
      </span>
      <span className="mx-auto truncate font-mono text-[9px] uppercase tracking-wider text-navy-400">
        {label}
      </span>
    </div>
  );
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function BuilderPreview() {
  return (
    <div className="product-proof-frame">
      <BrowserChrome label="Packet Builder · Step 1 of 5 · HydroSeal demo" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wide text-navy-400">
          <span>Your Idea</span>
          <span className="text-teal-700">20%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-mist-100">
          <div className="h-full w-[20%] rounded-full bg-teal-500" />
        </div>
        <p className="text-xs font-semibold text-navy-900">What did you create?</p>
        <div className="rounded border border-teal-200/80 bg-teal-50/40 px-2.5 py-2 text-[11px] leading-relaxed text-navy-800">
          {truncate(DEMO_INVENTION.whatCreated, 120)}
        </div>
        <p className="text-xs font-semibold text-navy-900">Who is it for?</p>
        <div className="rounded border border-mist-200 bg-white px-2.5 py-2 text-[11px] leading-relaxed text-navy-700">
          {truncate(DEMO_INVENTION.whoFor, 90)}
        </div>
        <div className="flex gap-2">
          <span className="rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-800">
            ✓ Core idea
          </span>
          <span className="rounded border border-mist-200 bg-white px-2 py-0.5 text-[10px] text-navy-500">
            Optional details +
          </span>
        </div>
      </div>
    </div>
  );
}

function SnapshotPreview() {
  const profile = SAMPLE_RECORD.profile;
  return (
    <div className="product-proof-frame">
      <BrowserChrome label="HydroSeal · Readiness snapshot" />
      <div className="grid gap-3 p-4 sm:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col items-center justify-center rounded border border-teal-200/80 bg-teal-50/30 p-3">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-teal-200 bg-white">
            <span className="text-lg font-bold text-teal-700">78</span>
          </div>
          <p className="mt-2 text-[10px] font-mono uppercase tracking-wide text-navy-500">
            Organization score
          </p>
        </div>
        <ul className="space-y-2 text-[11px]">
          {[
            ["Core intake", "Complete", "teal"],
            ["Materials", "4 of 4 noted", "teal"],
            [
              "Signals",
              `${profile.signals.length} topics to discuss`,
              "warm",
            ],
          ].map(([label, status, tone]) => (
            <li
              key={label}
              className="flex items-center justify-between rounded border border-mist-200 bg-white px-2.5 py-2"
            >
              <span className="font-medium text-navy-800">{label}</span>
              <span
                className={
                  tone === "teal" ? "text-teal-700" : "text-warm-700"
                }
              >
                {status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TimelinePreview() {
  return (
    <div className="product-proof-frame">
      <BrowserChrome label="HydroSeal · Development timeline" />
      <div className="space-y-0 p-4">
        {[
          { date: "Mar 2024", label: "First sketch — inline filter concept" },
          { date: "Jun 2024", label: "Prototype with twist-lock cartridge" },
          { date: "Jan 2025", label: "Field testing with hikers in Colorado" },
        ].map((item, i, items) => (
          <div key={item.date} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-teal-500 bg-teal-50" />
              {i < items.length - 1 ? (
                <span className="my-0.5 w-px flex-1 bg-mist-200" />
              ) : null}
            </div>
            <div className="pb-4">
              <p className="font-mono text-[10px] uppercase tracking-wide text-teal-700">
                {item.date}
              </p>
              <p className="mt-0.5 text-xs text-navy-800">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchPreview() {
  return (
    <div className="product-proof-frame">
      <BrowserChrome label="HydroSeal · Similar reference prep" />
      <div className="space-y-3 p-4">
        <div className="featured-tool-card-sm">
          <div className="flex items-center gap-2">
            <span className="featured-tool-badge">#1 · Start here</span>
            <span className="text-xs font-semibold text-navy-900">Google Patents</span>
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-navy-600">
            Query: portable water filter bottle cartridge
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["portable water filter", "B01D", "A45F"].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-mist-200 bg-white px-2 py-0.5 font-mono text-[10px] text-navy-600"
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="rounded border border-mist-200 bg-cream/50 px-2.5 py-2 text-[10px] leading-relaxed text-navy-600">
          Gap note · {truncate(DEMO_INVENTION.whatDifferent, 72)}
        </div>
      </div>
    </div>
  );
}

function PdfPreview() {
  const summary = truncate(SAMPLE_RECORD.profile.ideaSummary, 80);
  return (
    <div className="product-proof-frame">
      <BrowserChrome label="HydroSeal · IP Readiness Packet PDF" />
      <div className="p-4">
        <div className="rounded border border-mist-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-1">
            <span className="stamp-label stamp-label-warm text-[8px]">PREP ONLY</span>
            <span className="stamp-label stamp-label-teal text-[8px]">PDF</span>
          </div>
          <p className="headline-editorial mt-2 text-sm text-navy-900">HydroSeal</p>
          <p className="mt-1 text-[10px] leading-relaxed text-navy-600">{summary}</p>
          <div className="mt-2 space-y-1">
            {["Timeline", "Expert questions", "Export for Attorney JSON"].map(
              (row) => (
                <div
                  key={row}
                  className="flex items-center gap-2 border-t border-dashed border-mist-200 py-1.5 text-[10px] text-navy-700"
                >
                  <span className="text-teal-600">▸</span>
                  {row}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HandoffPreview() {
  const questions = SAMPLE_RECORD.profile.expertQuestions.slice(0, 2);
  return (
    <div className="product-proof-frame">
      <BrowserChrome label="HydroSeal · Expert handoff summary" />
      <div className="space-y-2 p-4">
        {[
          {
            kicker: "Idea at a glance",
            body: truncate(SAMPLE_RECORD.profile.ideaSummary, 90),
          },
          {
            kicker: "Questions to bring",
            body: questions[0] ?? "Does the inline filter affect prior art search?",
          },
          {
            kicker: "Resource types",
            body: "Patent clinic · PTRC · Pro bono program",
          },
        ].map((block) => (
          <div
            key={block.kicker}
            className="rounded border border-mist-200 bg-white px-2.5 py-2"
          >
            <p className="text-[9px] font-mono uppercase tracking-wide text-teal-700">
              {block.kicker}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-navy-700">
              {block.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const PREVIEWS: Record<ProductProofVariant, () => ReactElement> = {
  builder: BuilderPreview,
  snapshot: SnapshotPreview,
  timeline: TimelinePreview,
  search: SearchPreview,
  pdf: PdfPreview,
  handoff: HandoffPreview,
};

export function ProductProofPreview({ variant }: { variant: ProductProofVariant }) {
  const Preview = PREVIEWS[variant];
  return (
    <div>
      <Preview />
      <p className="mt-2 text-center text-[10px] font-medium text-teal-700">
        HydroSeal demo ·{" "}
        <a href="/smartprobonoip/sample" className="underline underline-offset-2">
          View live sample
        </a>
      </p>
    </div>
  );
}
