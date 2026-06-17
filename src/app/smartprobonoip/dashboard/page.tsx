import { Card } from "@/components/ui/Card";

export default function DashboardShell() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-navy-900">Partner dashboard</h1>
      <p className="mt-2 text-navy-500">Impact and readiness metrics.</p>
      <Card className="mt-8">
        <p className="text-sm text-navy-500">
          Dashboard metrics coming in Phase 5.
        </p>
      </Card>
    </div>
  );
}
