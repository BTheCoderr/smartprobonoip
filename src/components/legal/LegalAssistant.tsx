"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialMessage: Message = {
  role: "assistant",
  content:
    "Hi — I’m Ermi. I can help you organize a legal situation, prepare questions, make a checklist, or draft language for review. I’m not your lawyer and I won’t invent rules or deadlines. What are you working on?",
};

export function LegalAssistant() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [handoff, setHandoff] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem("spb_legal_handoff") || "";
      if (saved) {
        setHandoff(saved);
        window.sessionStorage.removeItem("spb_legal_handoff");
      }
    } catch {
      // Session storage can be unavailable in privacy-restricted contexts.
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function sendMessage(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/legal/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, handoff }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok || !data.message) {
        throw new Error(data.error || "Ermi could not respond.");
      }
      setMessages((current) => [...current, { role: "assistant", content: data.message! }]);
      setHandoff("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ermi could not respond.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dossier-card overflow-hidden">
      {handoff ? (
        <div className="border-b border-aqua-200 bg-aqua-50/70 px-5 py-4 text-sm text-navy-700">
          <p className="font-semibold">Context carried in from another SmartProBono tool</p>
          <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-navy-500">{handoff}</p>
        </div>
      ) : null}

      <div className="h-[52vh] min-h-[420px] overflow-y-auto bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  message.role === "user"
                    ? "max-w-[88%] rounded-md border border-teal-600 bg-teal-600 px-4 py-3 text-sm leading-relaxed text-white"
                    : "max-w-[92%] rounded-md border border-mist-200 bg-cream px-4 py-3 text-sm leading-relaxed text-navy-800"
                }
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-md border border-mist-200 bg-cream px-4 py-3 text-sm text-navy-500">
                Ermi is organizing the response…
              </div>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="border-t border-mist-200 bg-cream/70 p-4 sm:p-5">
        <div className="mx-auto max-w-3xl">
          <label htmlFor="legal-message" className="section-kicker">
            Your message
          </label>
          <textarea
            id="legal-message"
            className="input-surface mt-2 min-h-28 resize-y"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Example: I received a notice and I’m not sure what facts I should gather before calling legal aid."
            maxLength={6000}
          />
          {error ? (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-xs leading-relaxed text-navy-500">
              General preparation support only. Confirm jurisdiction-specific rules, rights, and deadlines with an authoritative source or qualified professional.
            </p>
            <button type="submit" className="btn-primary" disabled={!canSend}>
              {loading ? "Working…" : "Send to Ermi"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
