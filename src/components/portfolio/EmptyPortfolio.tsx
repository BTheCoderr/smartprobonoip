import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export function EmptyPortfolio() {
  return (
    <div className="rounded-2xl border border-dashed border-mist-300 bg-mist-50/60 p-8 text-center">
      <h3 className="text-base font-semibold tracking-tight text-navy-900">
        No inventions yet
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-navy-500">
        Your portfolio fills up as you prepare inventions. Each one keeps its own
        packet, research notes, and timeline.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link href={ROUTES.disclaimer} className="btn-primary">
          Start your first invention
        </Link>
        <Link href={ROUTES.sample} className="btn-secondary">
          See a sample packet
        </Link>
      </div>
    </div>
  );
}
