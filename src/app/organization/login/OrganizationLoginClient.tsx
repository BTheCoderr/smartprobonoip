"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics/client";

export default function OrganizationLoginClient() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackEvent("organization_login_viewed");
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/api/organization/auth/callback?next=${encodeURIComponent(ROUTES.organization)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        setMessage("Could not send magic link. Confirm your email is invited.");
        setLoading(false);
        return;
      }
      setMessage("Check your email for a sign-in link.");
    } catch {
      setMessage("Organization sign-in is not configured.");
    }
    setLoading(false);
  }

  return (
    <Card variant="elevated" className="mx-auto max-w-md">
      <CardHeader
        title="Organization sign in"
        subtitle="Magic link for invited org members. Inventors use the main workspace — not this page."
      />
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-navy-700">Work email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-mist-300 px-3 py-2 text-sm"
            autoComplete="email"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2 text-sm disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send magic link"}
        </button>
        {message ? <p className="text-sm text-navy-600">{message}</p> : null}
      </form>
    </Card>
  );
}
