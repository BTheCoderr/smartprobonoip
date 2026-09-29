"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/workspace";
  return value;
}

export default function PlatformLoginClient() {
  const params = useSearchParams();
  const next = useMemo(() => safeNext(params.get("next")), [params]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });
      setMessage(error ? "Could not send the sign-in link. Please try again." : "Check your email for your SmartProBono sign-in link.");
    } catch {
      setMessage("SmartProBono sign-in is not configured.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="dossier-card mx-auto max-w-lg p-6 sm:p-8">
      <p className="section-kicker">SmartProBono account</p>
      <h1 className="headline-editorial mt-2 text-3xl">Save Legal + IP work in one place</h1>
      <p className="mt-3 text-sm leading-relaxed text-navy-600">
        Sign in with a magic link. If this browser already has SmartProBonoIP inventions, the workspace can link that pilot session to your account after sign-in.
      </p>
      <label className="mt-6 block">
        <span className="text-sm font-semibold text-navy-800">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          className="input-surface mt-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <button className="btn-primary mt-5 w-full" type="submit" disabled={loading}>
        {loading ? "Sending…" : "Send sign-in link"}
      </button>
      {message ? <p className="mt-4 text-sm leading-relaxed text-navy-600" role="status">{message}</p> : null}
      <p className="mt-5 text-xs leading-relaxed text-navy-400">
        SmartProBono is not a law firm. Signing in creates a platform account; it does not create an attorney-client relationship.
      </p>
    </form>
  );
}
