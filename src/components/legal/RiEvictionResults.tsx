"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { buildRiEvictionGuidance, formatRiEvictionSummary } from "@/lib/legal/riEvictionGuidance";
import { riEvictionSourcesById, RI_EVICTION_SOURCE_REVIEWED_AT } from "@/lib/legal/riEvictionSources";
import {
  parseRiEvictionSnapshot,
  riEvictionSnapshot,
  subscribeRiEvictionStorage,
} from "@/lib/legal/riEvictionStorage";
import { ROUTES } from "@/lib/routes";

function serverSnapshot() {
  return "";
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="border-b border-dashed border-mist-200 pb-5 last:border-0 last:pb-0">
      <p className="section-kicker">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-navy-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2"><span className="text-teal-600">•</span><span>{item}</span></li>
        ))}
      </ul>
    </section>
  );
}

export function RiEvictionResults() {
  const router = useRouter();
  const snapshot = useSyncExternalStore(subscribeRiEvictionStorage, riEvictionSnapshot, serverSnapshot);
  const intake = parseRiEvictionSnapshot(snapshot);

  if (!intake) {
    return (
      <div className="dossier-card p-8 text-center">
        <h2 className="headline-editorial text-2xl">No RI eviction intake found</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-navy-500">Complete the browser-session intake first so SmartProBono has facts to organize.</p>
        <button className="btn-primary mt-6" type="button" onClick={() => router.push(ROUTES.legalRiEvictionIntake)}>Start intake</button>
      </div>
    );
  }

  const guidance = buildRiEvictionGuidance(intake);
  const sources = riEvictionSourcesById(guidance.sourceIds);

  function askErmi() {
    const sourceLines = sources.map((source) => `- ${source.publisher}: ${source.title} (${source.url})`).join("\n");
    const context = [
      "Rhode Island eviction preparation context. Use this only to help organize questions and next steps. Do not invent RI rules or deadlines; use the source links below when discussing a rule and tell me to confirm current requirements.",
      "",
      formatRiEvictionSummary(intake, guidance),
      "",
      "CURRENT SOURCE SET",
      sourceLines,
    ].join("\n");
    try {
      window.sessionStorage.setItem("spb_legal_handoff", context.slice(0, 8000));
    } catch {
      // Continue to Ermi without persisted handoff.
    }
    router.push(ROUTES.legalErmi);
  }

  return (
    <div className="space-y-6">
      {guidance.urgent ? (
        <div className="border border-warm-300 bg-warm-50 px-5 py-4 text-sm leading-relaxed text-navy-800">
          <strong>Time-sensitive information reported.</strong> Confirm any court or appeal deadline promptly with the Rhode Island Judiciary, Rhode Island Legal Services, or a qualified attorney.
        </div>
      ) : null}

      <section className="dossier-card overflow-hidden">
        <div className="border-b border-dashed border-mist-200 bg-navy-900 px-5 py-4 text-white sm:px-6">
          <p className="font-semibold">Preparation overview</p>
          <p className="mt-1 text-xs text-navy-100">This is an organizational category, not a legal conclusion.</p>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <p className="section-kicker">Issue category</p>
            <h2 className="headline-editorial mt-2 text-2xl">{guidance.categoryLabel}</h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-700">{guidance.summary}</p>
          </div>
          {guidance.flags.length ? (
            <div>
              <p className="section-kicker">Issues to flag for review</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {guidance.flags.map((flag) => <span key={flag} className="stamp-label stamp-label-aqua">{flag}</span>)}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="dossier-card space-y-5 p-5 sm:p-6">
        <ListSection title="Immediate preparation steps" items={guidance.immediateSteps} />
        <ListSection title="Documents to gather" items={guidance.gatherDocuments} />
        <ListSection title="Questions to confirm" items={guidance.questionsToConfirm} />
      </section>

      <section className="dossier-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-kicker">Rhode Island source basis</p>
            <h2 className="headline-editorial mt-2 text-xl">Current official and legal-aid resources</h2>
            <p className="mt-2 text-xs text-navy-500">Source set reviewed {RI_EVICTION_SOURCE_REVIEWED_AT}. Always check the linked source for updates.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sources.map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="border border-mist-200 bg-cream/50 p-4 transition hover:border-teal-300">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{source.publisher}</p>
              <p className="mt-2 font-semibold text-navy-900">{source.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-navy-500">{source.description}</p>
            </a>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button className="btn-secondary" type="button" onClick={() => router.push(ROUTES.legalRiEvictionIntake)}>Edit intake</button>
        <button className="btn-secondary" type="button" onClick={() => router.push(ROUTES.legalRiEvictionSummary)}>Open printable summary</button>
        <button className="btn-primary" type="button" onClick={askErmi}>Ask Ermi with this context</button>
      </div>
    </div>
  );
}
