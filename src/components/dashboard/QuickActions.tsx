import Link from "next/link";
import type { InventionSummary } from "@/lib/ideas/types";
import { ROUTES } from "@/lib/routes";

interface QuickAction {
  href: string;
  label: string;
  description: string;
  primary?: boolean;
}

export function QuickActions({
  mostRecent,
}: {
  mostRecent: InventionSummary | null;
}) {
  const actions: QuickAction[] = [
    {
      href: ROUTES.disclaimer,
      label: "New invention",
      description: "Start a fresh disclosure and packet.",
      primary: true,
    },
    mostRecent
      ? {
          href: ROUTES.profile(mostRecent.id),
          label: "Continue existing",
          description: mostRecent.title,
        }
      : {
          href: ROUTES.sample,
          label: "See a sample",
          description: "Preview a finished packet.",
        },
    mostRecent
      ? {
          href: `${ROUTES.profile(mostRecent.id)}#export`,
          label: "Export packet",
          description: "PDF or professional handoff data.",
        }
      : {
          href: ROUTES.forProfessionals,
          label: "Professional handoff",
          description: "See what an attorney receives.",
        },
    {
      href: ROUTES.learn,
      label: "Learn",
      description: "Patent basics, disclosure, and inventorship.",
    },
  ];

  return (
    <section aria-label="Quick actions" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={`group rounded-2xl border p-4 transition-colors ${
            action.primary
              ? "border-teal-200 bg-gradient-to-br from-teal-50/80 to-white hover:border-teal-300"
              : "border-mist-200/80 bg-white hover:border-mist-300"
          }`}
        >
          <p className="text-sm font-semibold text-navy-900 group-hover:text-teal-700">
            {action.primary ? `+ ${action.label}` : action.label}
          </p>
          <p className="mt-0.5 truncate text-xs text-navy-500">
            {action.description}
          </p>
        </Link>
      ))}
    </section>
  );
}
