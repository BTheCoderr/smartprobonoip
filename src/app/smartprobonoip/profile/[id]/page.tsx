"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProfileView } from "@/components/profile/ProfileView";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { PacketCoach } from "@/components/profile/PacketCoach";
import { PacketRecoveryCard } from "@/components/profile/PacketRecoveryCard";
import { PilotFeedbackCard } from "@/components/profile/PilotFeedbackCard";
import { ResourceRoutingCards } from "@/components/profile/ResourceRoutingCards";
import { StampLabel } from "@/components/ui/design";
import { Card } from "@/components/ui/Card";
import { ClarityScale } from "@/components/intake/fields";
import { getStore } from "@/lib/store";
import { downloadPacketPdf } from "@/lib/pdf";
import { getIdeaLabel } from "@/lib/packet";
import { getPilotSourceLabel } from "@/lib/partnerTracking";
import { trackEvent } from "@/lib/analytics/client";
import type { PilotFeedbackInput } from "@/lib/feedback";
import type { ProjectRecord, ReadinessProfile } from "@/lib/types";

type LoadState = "loading" | "found" | "missing";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [state, setState] = useState<LoadState>("loading");
  const [record, setRecord] = useState<ProjectRecord | null>(null);
  const [postClarity, setPostClarity] = useState<number>(0);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState<PilotFeedbackInput | null>(null);
  const packetViewTracked = useRef(false);

  useEffect(() => {
    let active = true;
    getStore()
      .getRecord(id)
      .then((r) => {
        if (!active) return;
        if (r) {
          setRecord(r);
          setPostClarity(r.postClarity ?? 0);
          setState("found");
          if (!packetViewTracked.current) {
            packetViewTracked.current = true;
            trackEvent("packet_viewed", {
              projectId: r.id,
              metadata: { demo: r.isDemo ?? false },
            });
            trackEvent("next_step_viewed", {
              projectId: r.id,
              metadata: { demo: r.isDemo ?? false },
            });
          }
        } else {
          setState("missing");
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function saveClarity(value: number) {
    setPostClarity(value);
    await getStore().updatePostClarity(id, value);
    trackEvent("clarity_after_recorded", {
      projectId: id,
      metadata: { clarityRating: value },
    });
    setSaved(true);
  }

  async function saveProfile(next: ReadinessProfile) {
    setSavingProfile(true);
    await getStore().updateProfile(id, next);
    setRecord((prev) => (prev ? { ...prev, profile: next } : prev));
    setSavingProfile(false);
    setEditing(false);
  }

  if (state === "loading") {
    return (
      <div className="page-shell-packet py-12">
        <Card>
          <p className="text-sm text-navy-500">Loading your packet…</p>
        </Card>
      </div>
    );
  }

  if (state === "missing" || !record) {
    return (
      <div className="page-shell-packet py-12">
        <Card variant="elevated">
          <h1 className="text-xl font-semibold text-navy-900">
            Packet not found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">
            We couldn&rsquo;t find this packet on this device. It may have been
            created in another browser, or storage was cleared.
          </p>
          <Link href="/smartprobonoip/start" className="btn-primary mt-6">
            Start a new readiness check
          </Link>
        </Card>
      </div>
    );
  }

  const ideaLabel = getIdeaLabel(record.answers);
  const pilotSource = getPilotSourceLabel(record);

  return (
    <div className="pb-16">
      <div className="paper-grid border-b border-mist-200/80">
        <div className="page-shell-packet py-10 sm:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <StampLabel tone="teal">IP READINESS</StampLabel>
                <StampLabel tone="warm">PREPARATION ONLY</StampLabel>
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-teal-600">
                IP Readiness Packet
              </p>
              <h1 className="headline-editorial mt-2 text-3xl sm:text-4xl">
                {ideaLabel}
              </h1>
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-blue">
                {record.profile.ideaSummary}
              </p>
              <p className="mt-4 text-xs text-navy-400">
                Generated {new Date(record.createdAt).toLocaleString()} ·{" "}
                {record.profile.generator === "ai"
                  ? "AI-assisted"
                  : "Rule-based"}{" "}
                draft · preparation only, not legal advice
              </p>
              {pilotSource ? (
                <p className="mt-2 text-xs text-muted-blue">
                  Pilot source: {pilotSource}
                  {record.source ? ` · via ${record.source}` : ""}
                </p>
              ) : null}
            </div>
            <div className="paper-card shrink-0 p-5 lg:max-w-xs">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-blue">
                Handoff packet
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-700">
                Download or share this packet before your next conversation with
                a professional, clinic, or partner.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    Edit packet
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    downloadPacketPdf(record);
                    trackEvent("pdf_downloaded", {
                      projectId: record.id,
                      metadata: {
                        demo: record.isDemo ?? false,
                        pdfDownloaded: true,
                      },
                    });
                  }}
                  className="btn-primary w-full sm:w-auto"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell-packet mt-8 space-y-8">
        {editing ? (
          <ProfileEditor
            profile={record.profile}
            onSave={saveProfile}
            onCancel={() => setEditing(false)}
            saving={savingProfile}
          />
        ) : (
          <ProfileView record={record} />
        )}

        {!editing ? (
          <>
            <PacketRecoveryCard record={record} />
            <PacketCoach record={record} />
          </>
        ) : null}

        <Card variant="soft">
          <h2 className="text-lg font-semibold text-navy-900">
            How clear are you now on your next step?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-navy-500">
            Rate your clarity to help us measure pilot impact. You rated{" "}
            {record.preClarity}/5 before seeing your packet.
          </p>
          <div className="mt-5">
            <ClarityScale label="" value={postClarity} onChange={saveClarity} />
          </div>
          {saved ? (
            <p className="mt-4 text-sm font-medium text-teal-700">
              Thanks — your response was saved.
            </p>
          ) : null}
        </Card>

        {!editing ? (
          <>
            <PilotFeedbackCard
              record={record}
              onSubmitted={setFeedbackInput}
            />
          </>
        ) : null}

        {!editing ? (
          <ResourceRoutingCards record={record} feedback={feedbackInput} />
        ) : null}
      </div>
    </div>
  );
}
