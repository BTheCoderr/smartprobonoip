"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  loadDisclosures,
  removeDisclosure,
  saveDisclosure,
} from "@/lib/canonical/client";
import type { CanonicalDisclosureRecord } from "@/lib/types";

type Draft = {
  id?: string;
  eventType: CanonicalDisclosureRecord["eventType"];
  eventDate: string;
  anticipated: boolean;
  whatWasShared: string;
  audienceDescription: string;
  accessScope: NonNullable<CanonicalDisclosureRecord["accessScope"]>;
  confidentialityBasis: NonNullable<CanonicalDisclosureRecord["confidentialityBasis"]>;
  locationOrChannel: string;
  referenceTitle: string;
  notes: string;
};

const EMPTY: Draft = {
  eventType: "external_discussion",
  eventDate: "",
  anticipated: false,
  whatWasShared: "",
  audienceDescription: "",
  accessScope: "unknown",
  confidentialityBasis: "unknown",
  locationOrChannel: "",
  referenceTitle: "",
  notes: "",
};

const EVENT_LABELS: Record<CanonicalDisclosureRecord["eventType"], string> = {
  publication: "Publication",
  website_post: "Website post",
  oral_presentation: "Oral presentation",
  poster: "Poster",
  demo: "Demo",
  external_discussion: "External discussion",
  sale_offer: "Offer for sale",
  sale: "Sale",
  external_use: "Use outside the private team",
  investor_pitch: "Investor pitch",
  customer_pitch: "Customer pitch",
  other: "Other",
};

function toDraft(value: CanonicalDisclosureRecord): Draft {
  return {
    id: value.id,
    eventType: value.eventType,
    eventDate: value.eventDate ?? "",
    anticipated: value.anticipated,
    whatWasShared: value.whatWasShared ?? "",
    audienceDescription: value.audienceDescription ?? "",
    accessScope: value.accessScope ?? "unknown",
    confidentialityBasis: value.confidentialityBasis ?? "unknown",
    locationOrChannel: value.locationOrChannel ?? "",
    referenceTitle: value.referenceTitle ?? "",
    notes: value.notes ?? "",
  };
}

export function DisclosureTimelineEditor({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<CanonicalDisclosureRecord[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setItems(await loadDisclosures(projectId));
  }

  useEffect(() => {
    let active = true;
    loadDisclosures(projectId)
      .then((next) => {
        if (active) setItems(next);
      })
      .catch(() => {
        if (active) setError("Could not load detailed disclosure events.");
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
    setSaving(true);
    setError(null);
    try {
      await saveDisclosure(projectId, {
        ...draft,
        action: draft.id ? "update" : "create",
        disclosureId: draft.id,
        datePrecision: draft.eventDate ? "exact" : "unknown",
      });
      await refresh();
      setDraft(EMPTY);
      setExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save disclosure event.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this disclosure event from the preparation record?")) return;
    try {
      await removeDisclosure(projectId, id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove disclosure event.");
    }
  }

  return (
    <Card>
      <CardHeader
        title="Detailed disclosure timeline"
        subtitle="Track sharing, publications, demos, offers, sales, and outside use. SmartProBonoIP records the facts; a professional determines legal effect."
      />

      {items.length === 0 ? (
        <p className="text-sm text-navy-500">
          No detailed external-sharing events have been recorded yet.
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-mist-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-900">
                    {EVENT_LABELS[item.eventType]}
                  </p>
                  <p className="mt-1 text-xs text-navy-500">
                    {item.eventDate ?? (item.anticipated ? "Anticipated / future" : "Date not recorded")}
                    {item.locationOrChannel ? " · " + item.locationOrChannel : ""}
                  </p>
                  {item.whatWasShared ? (
                    <p className="mt-2 text-sm leading-relaxed text-navy-700">
                      {item.whatWasShared}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-navy-500">
                    <span className="rounded-full bg-mist-100 px-2 py-1">
                      Access: {(item.accessScope ?? "unknown").replaceAll("_", " ")}
                    </span>
                    <span className="rounded-full bg-mist-100 px-2 py-1">
                      Confidentiality: {(item.confidentialityBasis ?? "unknown").replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-ghost text-xs"
                    onClick={() => {
                      setDraft(toDraft(item));
                      setExpanded(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-ghost text-xs"
                    onClick={() => void remove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
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
          Add disclosure event
        </button>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4 border-t border-mist-200 pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-navy-800">
              Event type
              <select
                className="input-surface mt-1"
                value={draft.eventType}
                onChange={(e) => update("eventType", e.target.value as CanonicalDisclosureRecord["eventType"])}
              >
                {Object.entries(EVENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-navy-800">
              Date
              <input
                type="date"
                className="input-surface mt-1"
                value={draft.eventDate}
                onChange={(e) => update("eventDate", e.target.value)}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-mist-200 px-3 py-3 text-sm text-navy-700">
            <input
              type="checkbox"
              checked={draft.anticipated}
              onChange={(e) => update("anticipated", e.target.checked)}
            />
            This is planned / anticipated rather than something that already happened
          </label>

          <label className="block text-sm font-medium text-navy-800">
            What was or will be shared?
            <textarea
              rows={4}
              className="input-surface mt-1"
              value={draft.whatWasShared}
              onChange={(e) => update("whatWasShared", e.target.value)}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-navy-800">
              Audience / who had access
              <input
                className="input-surface mt-1"
                value={draft.audienceDescription}
                onChange={(e) => update("audienceDescription", e.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-navy-800">
              Location / channel
              <input
                className="input-surface mt-1"
                value={draft.locationOrChannel}
                onChange={(e) => update("locationOrChannel", e.target.value)}
                placeholder="Conference, website, email, meeting…"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-navy-800">
              Access scope
              <select
                className="input-surface mt-1"
                value={draft.accessScope}
                onChange={(e) =>
                  update("accessScope", e.target.value as NonNullable<CanonicalDisclosureRecord["accessScope"]>)
                }
              >
                <option value="unknown">Not sure</option>
                <option value="named_people">Named people</option>
                <option value="limited_group">Limited group</option>
                <option value="general_public">General public</option>
              </select>
            </label>
            <label className="text-sm font-medium text-navy-800">
              Confidentiality basis
              <select
                className="input-surface mt-1"
                value={draft.confidentialityBasis}
                onChange={(e) =>
                  update(
                    "confidentialityBasis",
                    e.target.value as NonNullable<CanonicalDisclosureRecord["confidentialityBasis"]>,
                  )
                }
              >
                <option value="unknown">Not sure</option>
                <option value="written_nda">Written NDA</option>
                <option value="other_written_restriction">Other written restriction</option>
                <option value="oral_confidentiality">Oral confidentiality understanding</option>
                <option value="none_known">No confidentiality restriction known</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-navy-800">
            Publication / submission title, if any
            <input
              className="input-surface mt-1"
              value={draft.referenceTitle}
              onChange={(e) => update("referenceTitle", e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-navy-800">
            Notes
            <textarea
              rows={3}
              className="input-surface mt-1"
              value={draft.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : draft.id ? "Save event" : "Add event"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setDraft(EMPTY);
                setExpanded(false);
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
