"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RecoveryCard } from "@/components/ui/design";
import { Card } from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics/client";
import { pilotSessionHeaders } from "@/lib/pilotSession";
import { isApiStoreAvailable } from "@/lib/store/api";
import { BRAND } from "@/lib/brand";

function RecoverForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = token.trim();
    if (!value) return;

    setLoading(true);
    setError(null);
    trackEvent("recovery_claim_started");
    try {
      const res = await fetch("/api/recovery/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...pilotSessionHeaders(),
        },
        body: JSON.stringify({ token: value }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        record?: { id: string };
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Recovery failed");
      }
      if (!data.record?.id) throw new Error("Recovery failed");
      router.push(`/smartprobonoip/profile/${data.record.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recovery failed");
      setLoading(false);
    }
  }

  if (!isApiStoreAvailable()) {
    return (
      <Card variant="elevated">
        <p className="text-sm leading-relaxed text-navy-600">
          Recovery requires cloud storage. Configure Supabase for your pilot
          environment, then try again.
        </p>
      </Card>
    );
  }

  return (
    <RecoveryCard title="Recover your packet">
      <p className="text-sm leading-relaxed text-navy-600">
        Paste your private recovery link or token. We will attach this packet to
        your current browser session. Keep recovery links private.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-navy-900">
            Recovery link or token
          </span>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            rows={3}
            className="input-surface mt-2 font-mono text-xs"
            placeholder="Paste your full recovery link or token"
          />
        </label>
        {error ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Recovering…" : "Recover my packet"}
        </button>
      </form>
      <p className="mt-4 text-xs leading-relaxed text-navy-500">
        Preparation only — not legal advice. A professional may want to review
        your packet with you.
      </p>
    </RecoveryCard>
  );
}

export default function RecoverPage() {
  return (
    <div className="page-shell-narrow py-12 sm:py-16">
      <p className="section-kicker">{BRAND.product}</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-900">Recover a packet</h1>
      <p className="mt-3 text-sm leading-relaxed text-navy-600">
        Use the private link you saved when you created your packet.
      </p>
      <div className="mt-8">
        <Suspense fallback={<Card><p className="text-sm text-navy-500">Loading…</p></Card>}>
          <RecoverForm />
        </Suspense>
      </div>
      <Link href="/smartprobonoip/start" className="btn-ghost mt-6 inline-flex">
        Start a new packet instead
      </Link>
    </div>
  );
}
