"use client";

import { useState } from "react";
import { RecoveryCard } from "@/components/ui/design";
import { RECOVERY_COPY } from "@/lib/copy";
import { pilotSessionHeaders } from "@/lib/pilotSession";
import { isApiStoreAvailable } from "@/lib/store/api";
import type { ProjectRecord } from "@/lib/types";

export function PacketRecoveryCard({ record }: { record: ProjectRecord }) {
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (record.isDemo) {
    return (
      <RecoveryCard title={RECOVERY_COPY.title}>
        <p className="text-sm text-navy-600">{RECOVERY_COPY.demoDisabled}</p>
      </RecoveryCard>
    );
  }

  if (!isApiStoreAvailable()) {
    return (
      <RecoveryCard title={RECOVERY_COPY.title}>
        <p className="text-sm text-navy-600">{RECOVERY_COPY.localDisabled}</p>
      </RecoveryCard>
    );
  }

  async function createLink(sendEmail = false) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/recovery/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...pilotSessionHeaders(),
        },
        body: JSON.stringify({
          projectId: record.id,
          email: sendEmail ? email : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        recoveryUrl?: string;
        emailSent?: boolean;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not create link");
      if (!data.recoveryUrl) throw new Error("Could not create link");
      setRecoveryUrl(data.recoveryUrl);
      setMessage(
        data.emailSent
          ? "Recovery link created and emailed. Copy it too if you like."
          : RECOVERY_COPY.created,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create link");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!recoveryUrl) return;
    await navigator.clipboard.writeText(recoveryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <RecoveryCard title={RECOVERY_COPY.title}>
      <p className="text-sm leading-relaxed text-navy-600">
        {RECOVERY_COPY.body}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => createLink(false)}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Creating…" : RECOVERY_COPY.create}
        </button>
        {recoveryUrl ? (
          <button type="button" onClick={copyLink} className="btn-secondary">
            {copied ? "Copied!" : RECOVERY_COPY.copy}
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        <label className="block text-sm font-semibold text-navy-900">
          Email (optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input-surface mt-2 max-w-md"
        />
        <button
          type="button"
          onClick={() => createLink(true)}
          disabled={loading || !email.trim()}
          className="btn-ghost mt-2"
        >
          {RECOVERY_COPY.email}
        </button>
        <p className="mt-2 text-xs text-navy-500">
          {RECOVERY_COPY.emailUnavailable}
        </p>
      </div>

      {recoveryUrl ? (
        <div className="mt-5 rounded-xl border border-mist-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            Your private recovery link
          </p>
          <p className="mt-2 break-all font-mono text-xs text-navy-700">
            {recoveryUrl}
          </p>
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 text-sm text-teal-800">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-amber-800" role="alert">
          {error}
        </p>
      ) : null}
    </RecoveryCard>
  );
}
