"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card } from "@/components/ui/Card";
import { DossierPageHeader, StampLabel } from "@/components/ui/design";
import { ResearchPrepWorkspace } from "@/components/research/ResearchPrepWorkspace";
import { ResearchErrorBoundary } from "@/components/research/ResearchErrorBoundary";
import { getStore } from "@/lib/store";
import { getIdeaLabel } from "@/lib/packet";
import { PACKET_COPY } from "@/lib/copy";
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
        kicker={PACKET_COPY.similarReferenceSearchPrepTitle}
        title={getIdeaLabel(record.answers)}
        lead={PACKET_COPY.similarReferenceSearchPrepIntro}
      />
      <div className="page-shell-packet mt-8 space-y-6">
        <Link
          href={ROUTES.profile(record.id)}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← Back to IP Readiness Packet
        </Link>
        <ResearchErrorBoundary>
          <ResearchPrepWorkspace key={record.id} record={record} routeName="research" />
        </ResearchErrorBoundary>
      </div>
    </div>
  );
}
