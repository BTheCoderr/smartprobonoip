"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics/client";
import { getCampaignAttribution } from "@/lib/analytics/campaignAttribution";
import { INTEREST_TYPES, type InterestType } from "@/lib/interest";
import { CONSENT_CONFIDENTIAL } from "@/lib/disclaimer";

const EMPTY = {
  name: "",
  email: "",
  organization: "",
  role: "",
  interestType: "partner" as InterestType,
  message: "",
  consent: false,
};

export function InterestForm({ id }: { id?: string }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackEvent("contact_form_viewed");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const attr = getCampaignAttribution();

    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          organization: form.organization,
          role: form.role,
          interestType: form.interestType,
          message: form.message,
          consent: form.consent,
          attribution: {
            source: attr?.utm_source,
            campaign: attr?.utm_campaign,
            medium: attr?.utm_medium,
            referrer: attr?.referrer,
            landingPage: attr?.landing_page,
          },
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not submit form.");
        return;
      }

      setSuccess(data.message ?? "Thanks — we received your interest.");
      trackEvent("interest_submitted", {
        metadata: { interestType: form.interestType },
      });
      setForm(EMPTY);
    } catch {
      setError("Could not submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card id={id} variant="soft">
      <CardHeader
        title="Interested in partnering, piloting, or supporting SmartProBonoIP?"
        subtitle="Tell us how you want to connect. Please do not submit confidential invention details through this form."
      />
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium text-navy-800">Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-navy-800">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-navy-800">Organization</span>
          <input
            value={form.organization}
            onChange={(e) =>
              setForm((f) => ({ ...f, organization: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-navy-800">Role</span>
          <input
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="font-medium text-navy-800">Interest type</span>
          <select
            required
            value={form.interestType}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                interestType: e.target.value as InterestType,
              }))
            }
            className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
          >
            {INTEREST_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="font-medium text-navy-800">Message</span>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            rows={4}
            className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
            placeholder="How would you like to connect? (No invention details, please.)"
          />
        </label>
        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <input
            required
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
            className="mt-1"
          />
          <span className="text-navy-700">{CONSENT_CONFIDENTIAL}</span>
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send interest"}
          </button>
        </div>
        {success ? (
          <p className="text-sm font-medium text-teal-700 sm:col-span-2">{success}</p>
        ) : null}
        {error ? (
          <p className="text-sm text-amber-800 sm:col-span-2">{error}</p>
        ) : null}
      </form>
    </Card>
  );
}
