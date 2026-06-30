import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { CONNECT_V1_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";

export function ConnectResourcesSection({ compact = false }: { compact?: boolean }) {
  return (
    <Card variant={compact ? "soft" : "elevated"}>
      <CardHeader
        title={CONNECT_V1_COPY.title}
        subtitle={CONNECT_V1_COPY.subtitle}
      />
      <p className="text-sm leading-relaxed text-navy-600">{CONNECT_V1_COPY.safety}</p>
      <p className="mt-2 text-xs text-navy-500">{CONNECT_V1_COPY.locationNote}</p>
      <ul className={`mt-6 grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        {CONNECT_V1_COPY.categories.map((cat) => (
          <li
            key={cat.title}
            className="rounded-xl border border-mist-200 bg-gradient-to-br from-white to-cream/40 p-4"
          >
            <h3 className="text-sm font-semibold text-navy-900">{cat.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-navy-600">{cat.whenUseful}</p>
            <p className="mt-2 text-xs text-navy-500">{cat.note}</p>
          </li>
        ))}
      </ul>
      {!compact ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={ROUTES.learn} className="btn-ghost text-sm">
            Learn IP basics
          </Link>
          <Link href={ROUTES.trust} className="btn-ghost text-sm">
            Trust Center
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
