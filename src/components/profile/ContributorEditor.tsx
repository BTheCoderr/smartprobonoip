"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  loadContributors,
  removeContributor,
  saveContributor,
} from "@/lib/canonical/client";
import type { CanonicalContributor } from "@/lib/types";

type Draft = {
  id?: string;
  legalFirstName: string;
  legalMiddleName: string;
  legalLastName: string;
  email: string;
  phone: string;
  employerAffiliation: string;
  positionDepartment: string;
  contributionDescription: string;
  contributionStartedOn: string;
  contributionEndedOn: string;
  userIdentifiedRole: CanonicalContributor["userIdentifiedRole"];
  residenceCity: string;
  residenceRegion: string;
  residenceCountry: string;
  isPrimaryContact: boolean;
};

const EMPTY: Draft = {
  legalFirstName: "",
  legalMiddleName: "",
  legalLastName: "",
  email: "",
  phone: "",
  employerAffiliation: "",
  positionDepartment: "",
  contributionDescription: "",
  contributionStartedOn: "",
  contributionEndedOn: "",
  userIdentifiedRole: "unknown",
  residenceCity: "",
  residenceRegion: "",
  residenceCountry: "",
  isPrimaryContact: false,
};

function toDraft(value: CanonicalContributor): Draft {
  return {
    id: value.id,
    legalFirstName: value.legalFirstName,
    legalMiddleName: value.legalMiddleName ?? "",
    legalLastName: value.legalLastName,
    email: value.email ?? "",
    phone: value.phone ?? "",
    employerAffiliation: value.employerAffiliation ?? "",
    positionDepartment: value.positionDepartment ?? "",
    contributionDescription: value.contributionDescription ?? "",
    contributionStartedOn: value.contributionStartedOn ?? "",
    contributionEndedOn: value.contributionEndedOn ?? "",
    userIdentifiedRole: value.userIdentifiedRole,
    residenceCity: value.residenceCity ?? "",
    residenceRegion: value.residenceRegion ?? "",
    residenceCountry: value.residenceCountry ?? "",
    isPrimaryContact: value.isPrimaryContact,
  };
}

export function ContributorEditor({ projectId }: { projectId: string }) {
  const [contributors, setContributors] = useState<CanonicalContributor[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setContributors(await loadContributors(projectId));
  }

  useEffect(() => {
    let active = true;
    loadContributors(projectId)
      .then((next) => {
        if (active) setContributors(next);
      })
      .catch(() => {
        if (active) setError("Could not load contributor records.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.legalFirstName.trim() || !draft.legalLastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveContributor(projectId, {
        ...draft,
        action: draft.id ? "update" : "create",
        contributorId: draft.id,
      });
      await refresh();
      setDraft(EMPTY);
      setExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save contributor.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this contributor from the preparation record?")) return;
    setError(null);
    try {
      await removeContributor(projectId, id);
      await refresh();
      if (draft.id === id) {
        setDraft(EMPTY);
        setExpanded(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove contributor.");
    }
  }

  return (
    <Card>
      <CardHeader
        title="Contributors & possible inventors"
        subtitle="Record who helped and what each person contributed. This does not determine legal inventorship."
      />

      {loading ? (
        <p className="text-sm text-navy-500">Loading contributors…</p>
      ) : contributors.length === 0 ? (
        <p className="text-sm text-navy-500">
          No people have been added to the detailed contributor record yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {contributors.map((person) => (
            <li
              key={person.id}
              className="rounded-xl border border-mist-200 bg-mist-50/50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-900">
                    {[person.legalFirstName, person.legalMiddleName, person.legalLastName]
                      .filter(Boolean)
                      .join(" ")}
                    {person.isPrimaryContact ? (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                        Primary contact
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-navy-400">
                    {person.userIdentifiedRole.replaceAll("_", " ")}
                  </p>
                  {person.contributionDescription ? (
                    <p className="mt-2 text-sm leading-relaxed text-navy-700">
                      {person.contributionDescription}
                    </p>
                  ) : null}
                  {person.employerAffiliation ? (
                    <p className="mt-1 text-xs text-navy-500">
                      {person.employerAffiliation}
                      {person.positionDepartment ? " · " + person.positionDepartment : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-ghost text-xs"
                    onClick={() => {
                      setDraft(toDraft(person));
                      setExpanded(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-ghost text-xs"
                    onClick={() => void remove(person.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!expanded ? (
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => {
            setDraft(EMPTY);
            setExpanded(true);
          }}
        >
          Add contributor
        </button>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4 border-t border-mist-200 pt-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-medium text-navy-800">
              First name
              <input className="input-surface mt-1" value={draft.legalFirstName} onChange={(e) => update("legalFirstName", e.target.value)} />
            </label>
            <label className="text-sm font-medium text-navy-800">
              Middle name
              <input className="input-surface mt-1" value={draft.legalMiddleName} onChange={(e) => update("legalMiddleName", e.target.value)} />
            </label>
            <label className="text-sm font-medium text-navy-800">
              Last name
              <input className="input-surface mt-1" value={draft.legalLastName} onChange={(e) => update("legalLastName", e.target.value)} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-navy-800">
              How are you identifying this person?
              <select
                className="input-surface mt-1"
                value={draft.userIdentifiedRole}
                onChange={(e) => update("userIdentifiedRole", e.target.value as CanonicalContributor["userIdentifiedRole"])}
              >
                <option value="unknown">Not sure</option>
                <option value="contributor">Contributor</option>
                <option value="possible_inventor">Possible inventor</option>
              </select>
            </label>
            <label className="flex items-center gap-2 self-end rounded-xl border border-mist-200 px-3 py-3 text-sm text-navy-700">
              <input type="checkbox" checked={draft.isPrimaryContact} onChange={(e) => update("isPrimaryContact", e.target.checked)} />
              Primary contact for this invention
            </label>
          </div>

          <label className="block text-sm font-medium text-navy-800">
            What did this person contribute?
            <textarea
              rows={4}
              className="input-surface mt-1"
              value={draft.contributionDescription}
              onChange={(e) => update("contributionDescription", e.target.value)}
              placeholder="Describe the technical ideas, features, design decisions, code, prototype work, testing, or other contribution."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-navy-800">
              Employer / affiliation
              <input className="input-surface mt-1" value={draft.employerAffiliation} onChange={(e) => update("employerAffiliation", e.target.value)} />
            </label>
            <label className="text-sm font-medium text-navy-800">
              Position / department
              <input className="input-surface mt-1" value={draft.positionDepartment} onChange={(e) => update("positionDepartment", e.target.value)} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-navy-800">
              Contribution started
              <input type="date" className="input-surface mt-1" value={draft.contributionStartedOn} onChange={(e) => update("contributionStartedOn", e.target.value)} />
            </label>
            <label className="text-sm font-medium text-navy-800">
              Contribution ended
              <input type="date" className="input-surface mt-1" value={draft.contributionEndedOn} onChange={(e) => update("contributionEndedOn", e.target.value)} />
            </label>
          </div>

          <details className="rounded-xl border border-mist-200 bg-white p-3">
            <summary className="cursor-pointer text-sm font-medium text-navy-800">
              Contact and residence details
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-navy-700">
                Email
                <input type="email" className="input-surface mt-1" value={draft.email} onChange={(e) => update("email", e.target.value)} />
              </label>
              <label className="text-sm text-navy-700">
                Phone
                <input className="input-surface mt-1" value={draft.phone} onChange={(e) => update("phone", e.target.value)} />
              </label>
              <label className="text-sm text-navy-700">
                City
                <input className="input-surface mt-1" value={draft.residenceCity} onChange={(e) => update("residenceCity", e.target.value)} />
              </label>
              <label className="text-sm text-navy-700">
                State / region
                <input className="input-surface mt-1" value={draft.residenceRegion} onChange={(e) => update("residenceRegion", e.target.value)} />
              </label>
              <label className="text-sm text-navy-700 sm:col-span-2">
                Country
                <input className="input-surface mt-1" value={draft.residenceCountry} onChange={(e) => update("residenceCountry", e.target.value)} />
              </label>
            </div>
          </details>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : draft.id ? "Save contributor" : "Add contributor"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setDraft(EMPTY);
                setExpanded(false);
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error ? <p className="mt-3 text-sm text-amber-800">{error}</p> : null}
    </Card>
  );
}
