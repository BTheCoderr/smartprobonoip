"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProfileView } from "@/components/profile/ProfileView";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { PacketCoach } from "@/components/profile/PacketCoach";
import { PacketRecoveryCard } from "@/components/profile/PacketRecoveryCard";
import { PilotFeedbackCard } from "@/components/profile/PilotFeedbackCard";
import { ResourceRoutingCards } from "@/components/profile/ResourceRoutingCards";
import { DossierPageHeader, PaperCard, StampLabel } from "@/components/ui/design";
import { Card } from "@/components/ui/Card";
import { ClarityScale } from "@/components/intake/fields";
import { getStore } from "@/lib/store";
import { AttorneyExportModal } from "@/components/profile/AttorneyExportModal";
import { downloadPacketPdf } from "@/lib/pdf";
import { loadWorkspace } from "@/lib/research/client";
import type { SavedReference } from "@/lib/research/types";
import { getIdeaLabel } from "@/lib/packet";
import { EXPORT_HANDOFF_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";
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
  const [savedReferences, setSavedReferences] = useState<SavedReference[]>([]);
  const [attorneyExportOpen, setAttorneyExportOpen] = useState(false);
  const packetViewTracked = useRef(false);

  const handleReferencesChange = useCallback((refs: SavedReference[]) => {
    setSavedReferences(refs);
  }, []);

  const handleTimelineSaved = useCallback((updated: ProjectRecord) => {
    setRecord(updated);
  }, []);

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
          <Link href="/start" className="btn-primary mt-6">
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
      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">IP READINESS</StampLabel>
            <StampLabel tone="warm">PREPARATION ONLY</StampLabel>
          </>
        }
        kicker="IP Readiness Packet"
        title={ideaLabel}
        lead={record.profile.ideaSummary}
        meta={`Generated ${new Date(record.createdAt).toLocaleString()} · ${
          record.profile.generator === "ai" ? "AI-assisted" : "Rule-based"
        } draft · preparation only, not legal advice${
          pilotSource
            ? ` · Pilot source: ${pilotSource}${record.source ? ` · via ${record.source}` : ""}`
            : ""
        }`}
        aside={
          <PaperCard className="p-5">
            <p className="section-kicker text-muted-blue">Handoff packet</p>
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
                onClick={() => setAttorneyExportOpen(true)}
                className="btn-secondary w-full sm:w-auto"
              >
                {EXPORT_HANDOFF_COPY.jsonLabel}
              </button>
              <Link
                href={ROUTES.forProfessionals}
                className="btn-ghost w-full px-0 sm:w-auto"
              >
                View export schema →
              </Link>
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    let refs = savedReferences;
                    if (refs.length === 0) {
                      try {
                        const workspace = await loadWorkspace(record);
                        refs = workspace.savedReferences;
                        setSavedReferences(refs);
                      } catch {
                        refs = [];
                      }
                    }
                    downloadPacketPdf(record, refs);
                    trackEvent("pdf_downloaded", {
                      projectId: record.id,
                      metadata: {
                        demo: record.isDemo ?? false,
                        pdfDownloaded: true,
                        savedReferenceCount: refs.length,
                      },
                    });
                  })();
                }}
                className="btn-primary w-full sm:w-auto"
              >
                {EXPORT_HANDOFF_COPY.pdfLabel}
              </button>
            </div>
          </PaperCard>
        }
      />

      <div className="page-shell-packet mt-8 space-y-8">
        {editing ? (
          <ProfileEditor
            profile={record.profile}
            onSave={saveProfile}
            onCancel={() => setEditing(false)}
            saving={savingProfile}
          />
        ) : (
          <ProfileView
            record={record}
            savedReferenceCount={savedReferences.length}
            onReferencesChange={handleReferencesChange}
            onTimelineSaved={handleTimelineSaved}
          />
        )}

        {!editing ? (
          <PaperCard className="p-5 sm:p-6">
            <p className="section-kicker">{EXPORT_HANDOFF_COPY.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              {EXPORT_HANDOFF_COPY.lead}
            </p>
            <h3 className="mt-5 text-sm font-semibold text-navy-900">
              {EXPORT_HANDOFF_COPY.bringTitle}
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {EXPORT_HANDOFF_COPY.bringItems.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-mist-200 bg-cream/50 px-3 py-2 text-sm text-navy-700"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={ROUTES.afterMeeting} className="btn-secondary">
                After your meeting
              </Link>
              <Link href={ROUTES.trust} className="btn-ghost">
                Trust Center
              </Link>
            </div>
          </PaperCard>
        ) : null}

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

      {attorneyExportOpen ? (
        <AttorneyExportModal
          record={record}
          savedReferences={savedReferences}
          onClose={() => setAttorneyExportOpen(false)}
        />
      ) : null}
    </div>
  );
}
