"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearRiEvictionIntake,
  EMPTY_RI_EVICTION_INTAKE,
  readRiEvictionIntake,
  saveRiEvictionIntake,
} from "@/lib/legal/riEvictionStorage";
import type {
  RiEvictionGoal,
  RiEvictionIntake,
  RiEvictionNoticeType,
  RiYesNoUnsure,
} from "@/lib/legal/riEvictionTypes";
import { ROUTES } from "@/lib/routes";

const yesNoOptions: Array<{ value: RiYesNoUnsure; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Unsure" },
];

const noticeTypes: RiEvictionNoticeType[] = [
  "Five-day demand / nonpayment",
  "Notice of noncompliance / lease issue",
  "Termination of tenancy notice",
  "Court summons / complaint",
  "Other / unsure",
];

const goals: RiEvictionGoal[] = [
  "Stay in the home",
  "Understand the court process",
  "Address rent arrears",
  "Get more time",
  "Address housing conditions",
  "Prepare for legal-aid review",
  "Other",
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-semibold text-navy-800">{children}</span>;
}

function YesNoSelect({
  value,
  onChange,
}: {
  value: RiYesNoUnsure;
  onChange: (value: RiYesNoUnsure) => void;
}) {
  return (
    <select className="input-surface mt-2" value={value} onChange={(event) => onChange(event.target.value as RiYesNoUnsure)}>
      {yesNoOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function RiEvictionIntakeForm() {
  const router = useRouter();
  const [intake, setIntake] = useState<RiEvictionIntake>(() => readRiEvictionIntake() || EMPTY_RI_EVICTION_INTAKE);
  const [error, setError] = useState("");

  function update<K extends keyof RiEvictionIntake>(key: K, value: RiEvictionIntake[K]) {
    setIntake((current) => ({ ...current, [key]: value }));
  }

  function toggleGoal(goal: RiEvictionGoal) {
    setIntake((current) => ({
      ...current,
      goals: current.goals.includes(goal)
        ? current.goals.filter((item) => item !== goal)
        : [...current.goals, goal],
    }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!intake.understandsPreparationOnly) {
      setError("Please confirm that this tool provides preparation support only.");
      return;
    }

    try {
      saveRiEvictionIntake(intake);
      router.push(ROUTES.legalRiEvictionResults);
    } catch {
      setError("Your browser blocked session storage. Please allow session storage and try again.");
    }
  }

  function reset() {
    clearRiEvictionIntake();
    setIntake(EMPTY_RI_EVICTION_INTAKE);
    setError("");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="dossier-card p-5 sm:p-6">
        <p className="section-kicker">1 · Notice and court status</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Have you received an eviction notice or court paper?</FieldLabel>
            <YesNoSelect value={intake.noticeReceived} onChange={(value) => update("noticeReceived", value)} />
          </label>
          <label className="block">
            <FieldLabel>What kind of paper appears to be involved?</FieldLabel>
            <select className="input-surface mt-2" value={intake.noticeType} onChange={(event) => update("noticeType", event.target.value as RiEvictionNoticeType)}>
              {noticeTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="block">
            <FieldLabel>Notice date, if known</FieldLabel>
            <input className="input-surface mt-2" type="date" value={intake.noticeDate} onChange={(event) => update("noticeDate", event.target.value)} />
          </label>
          <label className="block">
            <FieldLabel>Has a court case been filed?</FieldLabel>
            <YesNoSelect value={intake.caseFiled} onChange={(value) => update("caseFiled", value)} />
          </label>
          <label className="block">
            <FieldLabel>Court date, if known</FieldLabel>
            <input className="input-surface mt-2" type="date" value={intake.courtDate} onChange={(event) => update("courtDate", event.target.value)} />
          </label>
          <label className="block">
            <FieldLabel>Has a judgment already been entered?</FieldLabel>
            <YesNoSelect value={intake.judgmentEntered} onChange={(value) => update("judgmentEntered", value)} />
          </label>
        </div>
      </section>

      <section className="dossier-card p-5 sm:p-6">
        <p className="section-kicker">2 · Rent and housing context</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Are you behind on rent?</FieldLabel>
            <YesNoSelect value={intake.behindOnRent} onChange={(value) => update("behindOnRent", value)} />
          </label>
          <label className="block">
            <FieldLabel>Amount reported behind, if known</FieldLabel>
            <input className="input-surface mt-2" inputMode="decimal" placeholder="Example: 1800" value={intake.arrearsAmount} onChange={(event) => update("arrearsAmount", event.target.value.slice(0, 20))} />
          </label>
          <label className="block">
            <FieldLabel>Have you applied for rental assistance?</FieldLabel>
            <YesNoSelect value={intake.appliedForAssistance} onChange={(value) => update("appliedForAssistance", value)} />
          </label>
          <label className="block">
            <FieldLabel>Is public or subsidized housing involved?</FieldLabel>
            <YesNoSelect value={intake.subsidy} onChange={(value) => update("subsidy", value)} />
          </label>
          <label className="block">
            <FieldLabel>Are there unsafe or unhealthy housing conditions?</FieldLabel>
            <YesNoSelect value={intake.unsafeConditions} onChange={(value) => update("unsafeConditions", value)} />
          </label>
          <label className="block">
            <FieldLabel>Disability or accommodation issue?</FieldLabel>
            <YesNoSelect value={intake.disabilityAccommodation} onChange={(value) => update("disabilityAccommodation", value)} />
          </label>
        </div>
        <label className="mt-5 block">
          <FieldLabel>Conditions notes, if relevant</FieldLabel>
          <textarea className="input-surface mt-2 min-h-28 resize-y" maxLength={2000} value={intake.conditionsNotes} onChange={(event) => update("conditionsNotes", event.target.value)} placeholder="What happened, when, what you reported, and any inspections or repair requests." />
        </label>
      </section>

      <section className="dossier-card p-5 sm:p-6">
        <p className="section-kicker">3 · Other issues to flag</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Do you have a retaliation concern?</FieldLabel>
            <YesNoSelect value={intake.retaliationConcern} onChange={(value) => update("retaliationConcern", value)} />
          </label>
          <label className="block">
            <FieldLabel>Do you have a discrimination concern?</FieldLabel>
            <YesNoSelect value={intake.discriminationConcern} onChange={(value) => update("discriminationConcern", value)} />
          </label>
          <label className="block">
            <FieldLabel>Do you need an interpreter or language support?</FieldLabel>
            <YesNoSelect value={intake.needsInterpreter} onChange={(value) => update("needsInterpreter", value)} />
          </label>
          <label className="block">
            <FieldLabel>City</FieldLabel>
            <input className="input-surface mt-2" maxLength={100} value={intake.city} onChange={(event) => update("city", event.target.value)} placeholder="Example: Providence" />
          </label>
          <label className="block">
            <FieldLabel>ZIP code</FieldLabel>
            <input className="input-surface mt-2" maxLength={10} value={intake.zip} onChange={(event) => update("zip", event.target.value)} />
          </label>
        </div>
      </section>

      <section className="dossier-card p-5 sm:p-6">
        <p className="section-kicker">4 · What are you trying to prepare for?</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {goals.map((goal) => (
            <label key={goal} className="flex cursor-pointer items-start gap-3 border border-mist-200 bg-white px-4 py-3 text-sm text-navy-700">
              <input type="checkbox" className="mt-1" checked={intake.goals.includes(goal)} onChange={() => toggleGoal(goal)} />
              <span>{goal}</span>
            </label>
          ))}
        </div>
        {intake.goals.includes("Other") ? (
          <label className="mt-4 block">
            <FieldLabel>Other goal</FieldLabel>
            <input className="input-surface mt-2" maxLength={300} value={intake.otherGoal} onChange={(event) => update("otherGoal", event.target.value)} />
          </label>
        ) : null}
        <label className="mt-5 block">
          <FieldLabel>Anything else staff should know?</FieldLabel>
          <textarea className="input-surface mt-2 min-h-32 resize-y" maxLength={3000} value={intake.situationNotes} onChange={(event) => update("situationNotes", event.target.value)} placeholder="Stick to facts you know. You can note what is uncertain." />
        </label>
      </section>

      <section className="dossier-card border border-warm-200 bg-warm-50/50 p-5 sm:p-6">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" checked={intake.understandsPreparationOnly} onChange={(event) => update("understandsPreparationOnly", event.target.checked)} />
          <span className="text-sm leading-relaxed text-navy-700">
            I understand this is a preparation tool, not legal advice or legal representation. I will confirm important rights, deadlines, court requirements, and case-specific decisions with an authoritative source or qualified professional.
          </span>
        </label>
        {error ? <p className="mt-3 text-sm text-red-700" role="alert">{error}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">Build my RI preparation summary</button>
          <button type="button" className="btn-secondary" onClick={reset}>Reset session intake</button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-navy-500">
          This intake is stored only in this browser tab&apos;s session storage. It is not saved to your SmartProBono account by this workflow.
        </p>
      </section>
    </form>
  );
}
