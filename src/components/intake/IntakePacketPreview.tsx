import { getIdeaLabel } from "@/lib/intakeValidation";
import type { IntakeAnswers } from "@/lib/types";

export function IntakePacketPreview({
  answers,
  onDismiss,
}: {
  answers: IntakeAnswers;
  onDismiss?: () => void;
}) {
  const title = getIdeaLabel(answers);
  const summary =
    answers.whatCreated.trim() ||
    "Your idea summary will appear here after you describe what you created.";
  const audience = answers.whoFor.trim() || "Audience — add who this is for";
  const mechanism =
    answers.howItWorks.trim() || "How it works — add a plain-language explanation";

  return (
    <div className="rounded-md border border-teal-200/90 bg-gradient-to-br from-teal-50/60 to-white px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker text-teal-700">Packet preview</p>
          <p className="mt-1 text-xs leading-relaxed text-navy-600">
            This is how your IP Readiness Packet will start to look. You can
            strengthen optional sections anytime before or after generation.
          </p>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-xs font-medium text-teal-700 hover:text-teal-900"
          >
            Dismiss
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-3 rounded-md border border-mist-200/90 bg-white/90 p-4 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap gap-1.5">
          <span className="stamp-label stamp-label-teal text-[8px]">PREVIEW</span>
          <span className="stamp-label stamp-label-warm text-[8px]">
            {answers.itemType.replace(/_/g, " ")}
          </span>
        </div>
        <p className="headline-editorial text-lg text-navy-900">{title}</p>
        <div className="space-y-2 border-t border-dashed border-mist-200 pt-3 text-sm leading-relaxed text-navy-700">
          <p>
            <span className="font-semibold text-navy-900">Summary · </span>
            {summary.length > 160 ? `${summary.slice(0, 157)}…` : summary}
          </p>
          <p>
            <span className="font-semibold text-navy-900">For · </span>
            {audience.length > 120 ? `${audience.slice(0, 117)}…` : audience}
          </p>
          <p>
            <span className="font-semibold text-navy-900">How · </span>
            {mechanism.length > 140 ? `${mechanism.slice(0, 137)}…` : mechanism}
          </p>
        </div>
        <ul className="grid gap-1.5 border-t border-dashed border-mist-200 pt-3 sm:grid-cols-3">
          {[
            answers.problemSolved.trim() ? "Problem noted" : "Problem — optional",
            answers.mainParts.trim() ? "Parts noted" : "Parts — optional",
            answers.whatDifferent.trim()
              ? "Differences noted"
              : "Differences — optional",
          ].map((item) => (
            <li
              key={item}
              className="rounded-md border border-mist-200/80 bg-mist-50/50 px-2 py-1.5 text-[11px] text-navy-600"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
