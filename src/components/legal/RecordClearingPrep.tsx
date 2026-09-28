"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RecordKind = "unsure" | "misdemeanor" | "felony" | "dismissed" | "acquitted" | "other";

type Prep = {
  state: string;
  recordDescription: string;
  recordKind: RecordKind;
  disposition: string;
  year: string;
  documents: string;
  goal: string;
  notes: string;
};

const initial: Prep = {
  state: "",
  recordDescription: "",
  recordKind: "unsure",
  disposition: "",
  year: "",
  documents: "",
  goal: "",
  notes: "",
};

const labels: Array<[RecordKind, string]> = [
  ["unsure", "Not sure"],
  ["misdemeanor", "Misdemeanor"],
  ["felony", "Felony"],
  ["dismissed", "Dismissed / dropped"],
  ["acquitted", "Acquitted"],
  ["other", "Other / juvenile / civil"],
];

export function RecordClearingPrep() {
  const router = useRouter();
  const [data, setData] = useState<Prep>(initial);

  const summary = useMemo(
    () =>
      [
        "SMARTPROBONO — RECORD-CLEARING PREPARATION SUMMARY",
        "Preparation only — not an eligibility determination or legal advice.",
        "",
        `State / jurisdiction: ${data.state || "[TO CONFIRM]"}`,
        `Record in plain language: ${data.recordDescription || "[TO CONFIRM]"}`,
        `Record type: ${data.recordKind}`,
        `Disposition / outcome: ${data.disposition || "[TO CONFIRM]"}`,
        `Approximate year: ${data.year || "[TO CONFIRM]"}`,
        `Documents already available: ${data.documents || "[NONE LISTED]"}`,
        `Goal: ${data.goal || "[TO CONFIRM]"}`,
        `Other notes: ${data.notes || "[NONE]"}`,
        "",
        "Questions to confirm with an authoritative source or qualified professional:",
        "1. What record-clearing options exist for this exact disposition in this jurisdiction?",
        "2. Is there a waiting period, and when does it begin?",
        "3. Are there filing fees, notice requirements, hearings, or required certified records?",
        "4. Are there exclusions or consequences that should be reviewed before filing?",
      ].join("\n"),
    [data],
  );

  function update<K extends keyof Prep>(key: K, value: Prep[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function askErmi() {
    try {
      window.sessionStorage.setItem(
        "spb_legal_handoff",
        `I completed the SmartProBono record-clearing preparation flow. Help me identify what facts are still missing and what questions I should confirm. Do not decide eligibility unless I provide a reliable current source.\n\n${summary}`,
      );
    } catch {
      // Continue to Ermi even if storage is blocked.
    }
    router.push("/legal/ask-ermi");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="dossier-card p-5 sm:p-6">
        <p className="section-kicker">Organize the record</p>
        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">State / jurisdiction</span>
            <input className="input-surface mt-2" value={data.state} onChange={(e) => update("state", e.target.value)} placeholder="Example: Rhode Island" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">What are you trying to clear or seal?</span>
            <textarea className="input-surface mt-2 min-h-28" value={data.recordDescription} onChange={(e) => update("recordDescription", e.target.value)} placeholder="Describe the case or record in plain language." />
          </label>
          <div>
            <span className="text-sm font-semibold text-navy-800">Closest record type</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {labels.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update("recordKind", value)}
                  className={
                    data.recordKind === value
                      ? "rounded-md border border-teal-600 bg-teal-50 px-3 py-2 text-left text-sm font-semibold text-teal-800"
                      : "rounded-md border border-mist-200 bg-white px-3 py-2 text-left text-sm text-navy-700 hover:bg-cream"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">Disposition / outcome, as far as you know</span>
            <textarea className="input-surface mt-2 min-h-24" value={data.disposition} onChange={(e) => update("disposition", e.target.value)} placeholder="Example: dismissed, conviction, probation completed, acquitted." />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">Approximate year</span>
            <input className="input-surface mt-2" value={data.year} onChange={(e) => update("year", e.target.value)} placeholder="Example: 2018" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">Documents you already have</span>
            <textarea className="input-surface mt-2 min-h-24" value={data.documents} onChange={(e) => update("documents", e.target.value)} placeholder="Docket, disposition, charging document, ID, payment records, etc." />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">What outcome are you hoping for?</span>
            <textarea className="input-surface mt-2 min-h-24" value={data.goal} onChange={(e) => update("goal", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">Other notes</span>
            <textarea className="input-surface mt-2 min-h-20" value={data.notes} onChange={(e) => update("notes", e.target.value)} />
          </label>
        </div>
      </section>

      <section className="dossier-card flex flex-col overflow-hidden">
        <div className="border-b border-dashed border-mist-200 bg-cream/70 px-5 py-4 sm:px-6">
          <p className="section-kicker">Preparation summary</p>
          <h2 className="headline-editorial mt-2 text-xl">What you can bring to the next conversation</h2>
        </div>
        <div className="flex-1 bg-white p-5 sm:p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-navy-800">{summary}</pre>
        </div>
        <div className="border-t border-mist-200 bg-cream/70 p-4 sm:px-6">
          <button type="button" className="btn-primary" onClick={askErmi}>
            Ask Ermi what to confirm next
          </button>
        </div>
      </section>
    </div>
  );
}
