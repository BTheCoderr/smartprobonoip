"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ProfileView } from "@/components/profile/ProfileView";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { Card } from "@/components/ui/Card";
import { ClarityScale } from "@/components/intake/fields";
import { getStore } from "@/lib/store";
import { downloadPacketPdf } from "@/lib/pdf";
import { BRAND } from "@/lib/brand";
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
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Card>
          <p className="text-sm text-navy-500">Loading your profile…</p>
        </Card>
      </div>
    );
  }

  if (state === "missing" || !record) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Card>
          <h1 className="text-xl font-semibold text-navy-900">
            Profile not found
          </h1>
          <p className="mt-2 text-sm text-navy-600">
            We couldn&rsquo;t find this profile on this device. It may have been
            created in another browser, or storage was cleared.
          </p>
          <Link
            href="/smartprobonoip/start"
            className="mt-4 inline-block rounded-lg bg-teal-600 px-5 py-2.5 font-semibold text-white transition hover:bg-teal-700"
          >
            Start a new readiness check
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-600">
            {BRAND.product}
          </p>
          <h1 className="text-3xl font-bold text-navy-900">
            Your IP Readiness Packet
          </h1>
          <p className="mt-1 text-sm text-navy-500">
            Generated {new Date(record.createdAt).toLocaleString()} ·{" "}
            {record.profile.generator === "ai"
              ? "AI-assisted"
              : "Rule-based"}{" "}
            draft
          </p>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-mist-100"
            >
              ✎ Edit
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => downloadPacketPdf(record)}
            className="inline-flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-mist-100"
          >
            <span aria-hidden>⬇</span> Download IP Readiness Packet
          </button>
        </div>
      </div>

      <div className="mt-8">
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
      </div>

      <Card className="mt-6">
        <h2 className="text-base font-semibold text-navy-900">
          How clear are you now on your next IP step?
        </h2>
        <p className="mt-1 text-sm text-navy-500">
          Rate your clarity to help us measure pilot impact. You rated{" "}
          {record.preClarity}/5 before.
        </p>
        <div className="mt-4">
          <ClarityScale
            label=""
            value={postClarity}
            onChange={saveClarity}
          />
        </div>
        {saved ? (
          <p className="mt-3 text-sm text-teal-700">
            Thanks — your response was saved.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
