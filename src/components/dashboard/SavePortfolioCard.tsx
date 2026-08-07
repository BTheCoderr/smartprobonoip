"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { pilotSessionHeaders } from "@/lib/pilotSession";
import { isApiStoreAvailable } from "@/lib/store/api";
import { RecoveryCard } from "@/components/ui/design";

/**
 * Access to a portfolio lives in this browser's storage. Clearing site data
 * loses every invention at once, so the workspace asks for a portfolio-wide
 * recovery link rather than a per-packet one.
 */
export function SavePortfolioCard({
  anchorInventionId,
  inventionCount,
}: {
  /** Any invention in the portfolio; the link restores everything alongside it. */
  anchorInventionId: string;
  inventionCount: number;
}) {
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = isApiStoreAvailable();

  useEffect(() => {
    if (!available) return;
    fetch("/api/recovery/config")
      .then((res) => res.json())
      .then((data: { emailEnabled?: boolean }) => {
        setEmailEnabled(Boolean(data.emailEnabled));
      })
      .catch(() => setEmailEnabled(false));
  }, [available]);

  if (!available) {
    return (
      <RecoveryCard title="Save access to your portfolio">
        <p className="text-sm leading-relaxed text-navy-600">
          Your inventions are stored in this browser only. Recovery links need
          the hosted version of SmartProBonoIP.
        </p>
      </RecoveryCard>
    );
  }

  async function createLink(sendEmail = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recovery/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...pilotSessionHeaders(),
        },
        body: JSON.stringify({
          projectId: anchorInventionId,
          scope: "session",
          email: sendEmail ? email : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        recoveryUrl?: string;
      };
      if (!res.ok || !data.recoveryUrl) {
        throw new Error(data.error ?? "Could not create link");
      }
      setRecoveryUrl(data.recoveryUrl);
      trackEvent("recovery_link_created", {
        projectId: anchorInventionId,
        metadata: { scopeName: "session", inventionCount },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create link");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!recoveryUrl) return;
    await navigator.clipboard.writeText(recoveryUrl);
    trackEvent("recovery_link_copied", { projectId: anchorInventionId });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <RecoveryCard title="Save access to your portfolio">
      <p className="text-sm leading-relaxed text-navy-600">
        Your workspace is tied to this browser. Create a private link so you can
        reopen all {inventionCount} invention{inventionCount === 1 ? "" : "s"} on
        another device, or if you clear your browser data. The link works once
        and does not replace any packet recovery link you already shared.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void createLink(false)}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Creating…" : "Create portfolio link"}
        </button>
        {recoveryUrl ? (
          <button type="button" onClick={() => void copyLink()} className="btn-secondary">
            {copied ? "Copied!" : "Copy link"}
          </button>
        ) : null}
      </div>

      {emailEnabled ? (
        <div className="mt-5">
          <label
            htmlFor="portfolio-recovery-email"
            className="block text-sm font-semibold text-navy-900"
          >
            Email me the link (optional)
          </label>
          <input
            id="portfolio-recovery-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="input-surface mt-2 max-w-md"
          />
          <button
            type="button"
            onClick={() => void createLink(true)}
            disabled={loading || !email.trim()}
            className="btn-ghost mt-2"
          >
            Email link
          </button>
        </div>
      ) : null}

      {recoveryUrl ? (
        <div className="mt-5 rounded-xl border border-mist-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            Your private portfolio link
          </p>
          <p className="mt-2 break-all font-mono text-xs text-navy-700">
            {recoveryUrl}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-navy-500">
            Keep this private. Anyone with it can open every invention in your
            portfolio.
          </p>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-navy-800">
          {error}
        </p>
      ) : null}
    </RecoveryCard>
  );
}
