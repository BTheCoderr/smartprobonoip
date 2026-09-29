"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { pilotSessionHeaders } from "@/lib/pilotSession";
import { ROUTES } from "@/lib/routes";

type AccountInfo = {
  email: string | null;
};

type LegalMatter = {
  id: string;
  matter_type: string;
  title: string;
  jurisdiction: string | null;
  status: string;
  source_tool: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
};

export function AccountWorkspacePanel({ account }: { account: AccountInfo | null }) {
  const [matters, setMatters] = useState<LegalMatter[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(Boolean(account));

  useEffect(() => {
    if (!account) return;
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const claim = await fetch("/api/account/claim-session", {
          method: "POST",
          headers: pilotSessionHeaders(),
        });
        if (claim.status === 409 && active) {
          const data = (await claim.json().catch(() => ({}))) as { error?: string };
          setStatus(data.error || "This browser workspace is linked to a different account.");
        }

        const response = await fetch("/api/legal/matters");
        if (response.ok) {
          const data = (await response.json()) as { matters?: LegalMatter[] };
          if (active) setMatters(data.matters ?? []);
        }
      } catch {
        if (active) setStatus("Account data could not be refreshed right now.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [account]);

  async function signOut() {
    await fetch("/api/account/logout", { method: "POST" }).catch(() => undefined);
    window.location.assign(ROUTES.workspace);
  }

  if (!account) {
    return (
      <section className="dossier-card border border-aqua-200 bg-aqua-50/35 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">One SmartProBono workspace</p>
            <h2 className="headline-editorial mt-2 text-2xl">Save Legal + IP work to an account</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Your current invention workspace still works without an account. Sign in to link this browser&apos;s IP records and save Legal matters in the same workspace.
            </p>
          </div>
          <Link href={ROUTES.signIn + "?next=" + encodeURIComponent(ROUTES.workspace)} className="btn-primary shrink-0">
            Sign in to save work
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dossier-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-dashed border-mist-200 bg-navy-900 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold">SmartProBono account</p>
          <p className="mt-1 text-xs text-navy-100">{account.email || "Signed in"}</p>
        </div>
        <button type="button" onClick={signOut} className="rounded border border-white/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">
          Sign out
        </button>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_0.7fr]">
        <div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="section-kicker">Legal matters</p>
              <h2 className="headline-editorial mt-2 text-2xl">Saved Legal work</h2>
            </div>
            <Link href={ROUTES.legal} className="text-sm font-semibold text-teal-700">
              Start Legal work
            </Link>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-navy-500">Loading saved matters…</p>
          ) : matters.length ? (
            <div className="mt-4 space-y-3">
              {matters.slice(0, 6).map((matter) => (
                <article key={matter.id} className="border border-mist-200 bg-white px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{matter.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-navy-400">
                        {matter.matter_type.replaceAll("_", " ")} · {matter.status}
                      </p>
                    </div>
                    <time className="text-xs text-navy-400" dateTime={matter.updated_at}>
                      {new Date(matter.updated_at).toLocaleDateString()}
                    </time>
                  </div>
                  {matter.summary ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-navy-600">{matter.summary}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-navy-500">
              No saved Legal matters yet. Document Understanding and RI Eviction Prep can now save summaries here when you are signed in.
            </p>
          )}
        </div>

        <aside className="border border-mist-200 bg-cream/60 p-4">
          <p className="section-kicker">Account linking</p>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            This browser&apos;s current SmartProBonoIP pilot session is linked to your account when possible. The original pilot-session ownership remains in place so existing links and workflows keep working.
          </p>
          {status ? <p className="mt-3 text-xs leading-relaxed text-warm-700" role="status">{status}</p> : null}
        </aside>
      </div>
    </section>
  );
}
