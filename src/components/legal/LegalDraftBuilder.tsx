"use client";

import { FormEvent, useState } from "react";

export function LegalDraftBuilder() {
  const [documentType, setDocumentType] = useState("Letter");
  const [jurisdiction, setJurisdiction] = useState("");
  const [facts, setFacts] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("Professional and factual");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function generate(e: FormEvent) {
    e.preventDefault();
    if (!documentType.trim() || !facts.trim() || !goal.trim() || loading) return;

    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/legal/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType, jurisdiction, facts, goal, tone }),
      });
      const data = (await response.json()) as { draft?: string; error?: string };
      if (!response.ok || !data.draft) {
        throw new Error(data.error || "Draft generation failed.");
      }
      setDraft(data.draft);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Draft generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function copyDraft() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Copy failed. You can select the text manually.");
    }
  }

  function downloadTxt() {
    if (!draft) return;
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "smartprobono-draft.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function sendToErmi() {
    if (!draft) return;
    try {
      window.sessionStorage.setItem(
        "spb_legal_handoff",
        `Please help me review this draft and identify unclear facts or questions to confirm before I use it:\n\n${draft.slice(0, 8000)}`,
      );
      window.location.href = "/legal/ask-ermi";
    } catch {
      window.location.href = "/legal/ask-ermi";
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <form onSubmit={generate} className="dossier-card p-5 sm:p-6">
        <p className="section-kicker">Draft inputs</p>
        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">Document type</span>
            <select className="input-surface mt-2" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
              <option>Letter</option>
              <option>Factual summary</option>
              <option>Timeline</option>
              <option>Request</option>
              <option>Checklist</option>
              <option>Statement</option>
              <option>Other</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">Jurisdiction, if known</span>
            <input className="input-surface mt-2" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder="Example: Rhode Island" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">Facts you want the draft to use</span>
            <textarea className="input-surface mt-2 min-h-52 resize-y" value={facts} onChange={(e) => setFacts(e.target.value)} placeholder="Only include facts you know. Dates, names, what happened, what documents you have, and what is still uncertain." maxLength={12000} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">What should this draft accomplish?</span>
            <textarea className="input-surface mt-2 min-h-28 resize-y" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Example: Ask the property manager to confirm the balance and provide a ledger." maxLength={3000} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">Tone</span>
            <select className="input-surface mt-2" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Professional and factual</option>
              <option>Short and direct</option>
              <option>Warm and cooperative</option>
              <option>Firm but respectful</option>
            </select>
          </label>
        </div>
        <button className="btn-primary mt-6 w-full" type="submit" disabled={loading}>
          {loading ? "Preparing draft…" : "Prepare draft"}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-navy-500">
          SmartProBono will not invent missing facts. Missing information should appear as [TO CONFIRM].
        </p>
      </form>

      <section className="dossier-card flex min-h-[640px] flex-col overflow-hidden">
        <div className="border-b border-dashed border-mist-200 bg-navy-900 px-5 py-4 text-white sm:px-6">
          <p className="font-semibold">Draft output</p>
          <p className="mt-1 text-xs text-navy-100">Editable preparation text — review before sending, signing, or filing.</p>
        </div>
        <div className="flex-1 bg-white p-5 sm:p-6">
          {draft ? (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-navy-800">{draft}</pre>
          ) : (
            <div className="flex h-full min-h-96 items-center justify-center text-center">
              <div className="max-w-sm">
                <p className="headline-editorial text-xl">Your draft will appear here.</p>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">
                  Give the tool the facts and purpose. Keep legal conclusions and uncertain details out unless they are clearly labeled.
                </p>
              </div>
            </div>
          )}
        </div>
        {draft ? (
          <div className="flex flex-wrap gap-2 border-t border-mist-200 bg-cream/70 p-4 sm:px-6">
            <button type="button" className="btn-secondary" onClick={copyDraft}>Copy</button>
            <button type="button" className="btn-secondary" onClick={downloadTxt}>Download TXT</button>
            <button type="button" className="btn-primary" onClick={sendToErmi}>Review with Ermi</button>
          </div>
        ) : null}
        {status ? <p className="border-t border-mist-200 px-5 py-3 text-xs text-navy-600">{status}</p> : null}
      </section>
    </div>
  );
}
