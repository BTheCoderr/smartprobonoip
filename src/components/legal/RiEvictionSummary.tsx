"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { buildRiEvictionGuidance, formatRiEvictionSummary } from "@/lib/legal/riEvictionGuidance";
import { riEvictionSourcesById, RI_EVICTION_SOURCE_REVIEWED_AT } from "@/lib/legal/riEvictionSources";
import { parseRiEvictionSnapshot, riEvictionSnapshot, subscribeRiEvictionStorage } from "@/lib/legal/riEvictionStorage";
import { ROUTES } from "@/lib/routes";

function serverSnapshot() {
  return "";
}

export function RiEvictionSummary() {
  const router = useRouter();
  const snapshot = useSyncExternalStore(subscribeRiEvictionStorage, riEvictionSnapshot, serverSnapshot);
  const intake = parseRiEvictionSnapshot(snapshot);

  if (!intake) {
    return (
      <div className="dossier-card p-8 text-center">
        <h2 className="headline-editorial text-2xl">No intake found</h2>
        <button className="btn-primary mt-5" type="button" onClick={() => router.push(ROUTES.legalRiEvictionIntake)}>Start RI eviction intake</button>
      </div>
    );
  }

  const guidance = buildRiEvictionGuidance(intake);
  const sources = riEvictionSourcesById(guidance.sourceIds);
  const summaryText = formatRiEvictionSummary(intake, guidance);

  function download() {
    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "smartprobono-ri-eviction-prep-summary.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden flex flex-wrap gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.push(ROUTES.legalRiEvictionResults)}>Back to results</button>
        <button type="button" className="btn-secondary" onClick={download}>Download TXT</button>
        <button type="button" className="btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
      </div>

      <article className="dossier-card bg-white p-6 sm:p-8 print:border-0 print:shadow-none">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">SmartProBono</p>
        <h1 className="headline-editorial mt-2 text-3xl">Rhode Island eviction preparation summary</h1>
        <p className="mt-2 text-sm font-semibold text-warm-700">Preparation support only · Not legal advice</p>

        <div className="mt-7 space-y-6">
          <section>
            <p className="section-kicker">Situation</p>
            <p className="mt-3 text-sm leading-relaxed text-navy-700">{guidance.summary}</p>
          </section>

          <section className="grid gap-4 border-y border-dashed border-mist-200 py-5 sm:grid-cols-2">
            <dl className="space-y-2 text-sm">
              <div><dt className="text-navy-400">City / ZIP</dt><dd className="font-medium text-navy-800">{[intake.city, intake.zip].filter(Boolean).join(" ") || "Not provided"}</dd></div>
              <div><dt className="text-navy-400">Notice</dt><dd className="font-medium text-navy-800">{intake.noticeReceived} · {intake.noticeType}</dd></div>
              <div><dt className="text-navy-400">Notice date</dt><dd className="font-medium text-navy-800">{intake.noticeDate || "Not provided"}</dd></div>
            </dl>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-navy-400">Court case filed</dt><dd className="font-medium text-navy-800">{intake.caseFiled}</dd></div>
              <div><dt className="text-navy-400">Court date</dt><dd className="font-medium text-navy-800">{intake.courtDate || "Not provided"}</dd></div>
              <div><dt className="text-navy-400">Judgment entered</dt><dd className="font-medium text-navy-800">{intake.judgmentEntered}</dd></div>
            </dl>
          </section>

          {[
            ["Issues to flag", guidance.flags],
            ["Immediate preparation steps", guidance.immediateSteps],
            ["Documents to gather", guidance.gatherDocuments],
            ["Questions to confirm", guidance.questionsToConfirm],
          ].map(([title, items]) => (
            <section key={title as string}>
              <p className="section-kicker">{title as string}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-navy-700">
                {(items as string[]).length ? (items as string[]).map((item) => <li key={item}>{item}</li>) : <li>None reported.</li>}
              </ul>
            </section>
          ))}

          {intake.situationNotes ? (
            <section>
              <p className="section-kicker">User notes</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy-700">{intake.situationNotes}</p>
            </section>
          ) : null}

          <section className="border-t border-dashed border-mist-200 pt-5">
            <p className="section-kicker">Source basis</p>
            <p className="mt-2 text-xs text-navy-500">Reviewed {RI_EVICTION_SOURCE_REVIEWED_AT}.</p>
            <ul className="mt-3 space-y-2 text-xs text-navy-600">
              {sources.map((source) => <li key={source.id}>{source.publisher} — {source.title}</li>)}
            </ul>
          </section>

          <p className="border-t border-mist-200 pt-5 text-xs leading-relaxed text-navy-500">
            SmartProBono is not a law firm. This summary organizes user-provided facts and current source-backed preparation notes. Confirm rights, deadlines, court requirements, and case-specific decisions with the Rhode Island Judiciary, Rhode Island Legal Services, or another qualified legal professional.
          </p>
        </div>
      </article>
    </div>
  );
}
