"use client";

import {
  DISCLOSURE_KIND_OPTIONS,
  INCLUDED_KEY_FEATURES_OPTIONS,
  NDA_STATUS_OPTIONS,
} from "@/lib/labels";
import type { DisclosureEvent } from "@/lib/types";
import { RadioGroup, SelectField, TextField } from "./fields";

function createEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `disclosure-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function DisclosureEventsEditor({
  events,
  onChange,
}: {
  events: DisclosureEvent[];
  onChange: (events: DisclosureEvent[]) => void;
}) {
  function addEvent() {
    onChange([...events, { id: createEventId() }]);
  }

  function removeEvent(id: string) {
    onChange(events.filter((event) => event.id !== id));
  }

  function updateEvent<K extends keyof DisclosureEvent>(
    id: string,
    key: K,
    value: DisclosureEvent[K],
  ) {
    onChange(
      events.map((event) =>
        event.id === id ? { ...event, [key]: value } : event,
      ),
    );
  }

  return (
    <div className="space-y-5">
      {events.map((event, idx) => (
        <div
          key={event.id}
          className="rounded-md border border-mist-200 bg-white/70 p-4 sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Sharing event {idx + 1}
            </p>
            <button
              type="button"
              onClick={() => removeEvent(event.id)}
              className="text-xs font-medium text-navy-500 hover:text-navy-800"
            >
              Remove
            </button>
          </div>
          <div className="space-y-5">
            <SelectField
              label="Was it private or public?"
              options={DISCLOSURE_KIND_OPTIONS}
              value={event.kind ?? "not_sure"}
              onChange={(v) => updateEvent(event.id, "kind", v)}
            />
            <TextField
              label="Approximate date"
              hint="Free text is fine — e.g. 'Spring 2025' or 'around March'."
              value={event.approximateDate ?? ""}
              onChange={(v) => updateEvent(event.id, "approximateDate", v)}
              rows={1}
            />
            <TextField
              label="Where was it shown?"
              hint="e.g. a pitch event, social media, a friend's workshop."
              value={event.whereShown ?? ""}
              onChange={(v) => updateEvent(event.id, "whereShown", v)}
              rows={1}
            />
            <TextField
              label="Who saw it?"
              hint="e.g. two friends, an investor group, anyone online."
              value={event.whoSawIt ?? ""}
              onChange={(v) => updateEvent(event.id, "whoSawIt", v)}
              rows={1}
            />
            <TextField
              label="What was shown?"
              hint="e.g. a photo of the prototype, a slide deck, the full mechanism."
              value={event.whatWasShown ?? ""}
              onChange={(v) => updateEvent(event.id, "whatWasShown", v)}
              rows={2}
            />
            <RadioGroup
              label="Was there an NDA or confidentiality understanding?"
              options={NDA_STATUS_OPTIONS}
              value={event.ndaOrConfidentiality}
              onChange={(v) =>
                updateEvent(event.id, "ndaOrConfidentiality", v)
              }
            />
            <RadioGroup
              label="Did it include your key features?"
              options={INCLUDED_KEY_FEATURES_OPTIONS}
              value={event.includedKeyFeatures}
              onChange={(v) => updateEvent(event.id, "includedKeyFeatures", v)}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEvent}
        className="w-full rounded-xl border border-dashed border-teal-300 bg-teal-50/40 px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
      >
        + Add a sharing event
      </button>
    </div>
  );
}
