import { Card, CardHeader } from "@/components/ui/Card";
import type { CanonicalReviewFlag } from "@/lib/types";

function labelFor(flag: CanonicalReviewFlag): string {
  switch (flag.flagType) {
    case "date_sensitive_professional_review":
      return "Time-sensitive review";
    case "professional_review_recommended":
      return "Professional review";
    case "needs_user_clarification":
      return "Needs clarification";
    case "missing_information":
      return "Missing information";
    case "firm_question":
      return "Professional intake question";
  }
}

function toneFor(flag: CanonicalReviewFlag): string {
  switch (flag.flagType) {
    case "date_sensitive_professional_review":
    case "professional_review_recommended":
      return "border-amber-200 bg-amber-50/60";
    case "needs_user_clarification":
    case "missing_information":
      return "border-mist-200 bg-mist-50/70";
    case "firm_question":
      return "border-teal-200 bg-teal-50/50";
  }
}

export function ProfessionalReviewPanel({
  flags,
}: {
  flags: CanonicalReviewFlag[];
}) {
  const openFlags = flags.filter((flag) => flag.status === "open");
  if (openFlags.length === 0) return null;

  const professional = openFlags.filter(
    (flag) =>
      flag.flagType === "professional_review_recommended" ||
      flag.flagType === "date_sensitive_professional_review" ||
      flag.flagType === "firm_question",
  );
  const clarification = openFlags.filter(
    (flag) =>
      flag.flagType === "needs_user_clarification" ||
      flag.flagType === "missing_information",
  );

  return (
    <Card className="border-teal-200">
      <CardHeader
        title="Items to prepare or review"
        subtitle="These are preparation prompts based on facts you entered. They are not a rejection, legal conclusion, or patentability decision."
      />

      <div className="space-y-5">
        {clarification.length > 0 ? (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              Add or clarify information
            </p>
            <ul className="mt-2 space-y-2">
              {clarification.map((flag) => (
                <li
                  key={flag.id}
                  className={`rounded-lg border px-3 py-3 ${toneFor(flag)}`}
                >
                  <p className="text-[10px] font-mono uppercase tracking-wide text-navy-500">
                    {labelFor(flag)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-navy-700">
                    {flag.userMessage ?? "Add more detail before your professional review."}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {professional.length > 0 ? (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              Bring to a professional
            </p>
            <ul className="mt-2 space-y-2">
              {professional.map((flag) => (
                <li
                  key={flag.id}
                  className={`rounded-lg border px-3 py-3 ${toneFor(flag)}`}
                >
                  <p className="text-[10px] font-mono uppercase tracking-wide text-navy-500">
                    {labelFor(flag)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-navy-700">
                    {flag.userMessage ??
                      "This fact may be important to a professional review. Preserve the details and supporting documents."}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Card>
  );
}
