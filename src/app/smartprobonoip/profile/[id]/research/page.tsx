"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DossierPageHeader, StampLabel } from "@/components/ui/design";
import { ResearchPrepWorkspace } from "@/components/research/ResearchPrepWorkspace";
import { getStore } from "@/lib/store";
import { getIdeaLabel } from "@/lib/packet";
import type { ProjectRecord } from "@/lib/types";

export default function ResearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [record, setRecord] = useState<ProjectRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getStore()
      .getRecord(id)
      .then((r) => {
        if (!active) return;
        setRecord(r);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell-packet py-12">
        <Card>
          <p className="text-sm text-navy-500">Loading research prep workspace…</p>
        </Card>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="page-shell-packet py-12">
        <Card>
          <p className="text-sm text-navy-500">Packet not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <DossierPageHeader
        stamps={
          <>
            <StampLabel tone="teal">RESEARCH PREP</StampLabel>
            <StampLabel tone="warm">PREPARATION ONLY</StampLabel>
          </>
        }
        kicker="Research Prep Workspace"
        title={getIdeaLabel(record.answers)}
        lead="Organize possible similar references and expert questions — not legal conclusions."
      />
      <div className="page-shell-packet mt-8 space-y-6">
        <Link
          href={`/smartprobonoip/profile/${record.id}`}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← Back to IP Readiness Packet
        </Link>
        <ResearchPrepWorkspace record={record} />
      </div>
    </div>
  );
}
