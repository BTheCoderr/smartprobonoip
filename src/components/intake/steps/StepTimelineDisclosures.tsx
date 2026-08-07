import { INTAKE_COPY } from "@/lib/copy";
import {
  AGREEMENT_STATUS_OPTIONS,
  AGREEMENT_TYPE_OPTIONS,
  AI_ASSISTANCE_OPTIONS,
  CONTRIBUTOR_HELP_OPTIONS,
  CONTRIBUTOR_INVOLVEMENT_OPTIONS,
  INSTITUTION_RELATIONSHIP_OPTIONS,
  SHARING_OPTIONS,
} from "@/lib/labels";
import type {
  AgreementStatus,
  AgreementType,
  AiAssistance,
  ContributorHelpType,
  ContributorInvolvement,
  InstitutionRelationship,
  IntakeAnswers,
  SharingChannel,
} from "@/lib/types";
import { getEducationCards } from "@/lib/content/educationCards";
import { getPatentEducationTopic } from "@/lib/paths/patent/education";
import { EducationCardList } from "@/components/ui/EducationCard";
import { DisclosureEventsEditor } from "../DisclosureEventsEditor";
import { CheckboxGroup, RadioGroup, TextField } from "../fields";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function StepTimelineDisclosures({
  answers,
  onUpdate,
  onToggleSharing,
}: {
  answers: IntakeAnswers;
  onUpdate: <K extends keyof IntakeAnswers>(key: K, value: IntakeAnswers[K]) => void;
  onToggleSharing: (value: SharingChannel) => void;
}) {
  const disclosureTopic = getPatentEducationTopic("privacy_public_disclosure");
  const aiTopic = getPatentEducationTopic("ai_inventorship");

  return (
    <div className="space-y-6 sm:space-y-7">
      <div className="rounded-md border border-warm-200/80 bg-warm-50/40 px-4 py-3 text-sm leading-relaxed text-navy-700">
        {INTAKE_COPY.wizard.timelineNote}
      </div>

      {disclosureTopic ? (
        <details className="rounded-md border border-warm-200/70 bg-white px-4 py-3" open>
          <summary className="cursor-pointer text-sm font-semibold text-navy-900">
            {disclosureTopic.title}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            {disclosureTopic.summary}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-navy-700">
            {disclosureTopic.points.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-warm-500">•</span>
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-navy-500">
            {disclosureTopic.safetyNote}
          </p>
        </details>
      ) : null}

      <CheckboxGroup<SharingChannel>
        label="Have you shared your idea publicly?"
        hint="Pitches, social posts, demos, or sales — helps flag possible disclosure topics for expert review."
        options={SHARING_OPTIONS}
        selected={
          answers.sharedChannels.length > 0 ? answers.sharedChannels : ["none"]
        }
        onToggle={onToggleSharing}
      />

      <details
        className="group rounded-md border border-dashed border-mist-200 bg-cream/50"
        open={(answers.disclosureEvents ?? []).length > 0}
      >
        <summary className="cursor-pointer list-none px-4 py-4 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="section-kicker text-teal-700">
            {INTAKE_COPY.wizard.disclosureEventsTitle}
          </span>
          <span className="mt-2 block text-sm leading-relaxed text-navy-600">
            {INTAKE_COPY.wizard.disclosureEventsHint}
          </span>
        </summary>
        <div className="px-4 pb-5 sm:px-5">
          <DisclosureEventsEditor
            events={answers.disclosureEvents ?? []}
            onChange={(events) => onUpdate("disclosureEvents", events)}
          />
        </div>
      </details>

      <div className="rounded-md border border-dashed border-mist-200 bg-cream/50 p-4 sm:p-5">
        <p className="section-kicker text-teal-700">
          {INTAKE_COPY.ownershipSectionTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">
          {INTAKE_COPY.ownershipSectionHint}
        </p>
        <div className="mt-5 space-y-6">
          <RadioGroup<ContributorInvolvement>
            label="Did anyone else help create, design, build, or test this idea?"
            options={CONTRIBUTOR_INVOLVEMENT_OPTIONS}
            value={answers.contributorsInvolved ?? "solo"}
            onChange={(v) => onUpdate("contributorsInvolved", v)}
          />
          {answers.contributorsInvolved &&
          answers.contributorsInvolved !== "solo" ? (
            <CheckboxGroup<ContributorHelpType>
              label="What did they help with?"
              options={CONTRIBUTOR_HELP_OPTIONS}
              selected={answers.contributorHelpTypes ?? []}
              onToggle={(v) =>
                onUpdate(
                  "contributorHelpTypes",
                  toggle(answers.contributorHelpTypes ?? [], v),
                )
              }
            />
          ) : null}
          <RadioGroup<AgreementStatus>
            label="Written agreements with anyone who helped?"
            options={AGREEMENT_STATUS_OPTIONS}
            value={answers.agreementStatus ?? "not_applicable"}
            onChange={(v) => onUpdate("agreementStatus", v)}
          />
          {answers.agreementStatus === "yes" ||
          answers.agreementStatus === "not_sure" ? (
            <CheckboxGroup<AgreementType>
              label="Agreement types that might exist"
              options={AGREEMENT_TYPE_OPTIONS}
              selected={answers.agreementTypes ?? []}
              onToggle={(v) =>
                onUpdate(
                  "agreementTypes",
                  toggle(answers.agreementTypes ?? [], v),
                )
              }
            />
          ) : null}
          <RadioGroup<InstitutionRelationship>
            label="Created through employer, school, grant, or client work?"
            options={INSTITUTION_RELATIONSHIP_OPTIONS}
            value={answers.institutionRelationship ?? "no"}
            onChange={(v) => onUpdate("institutionRelationship", v)}
          />
          <TextField
            label="Timeline notes (optional)"
            hint="Rough dates — e.g. first sketch, prototype, first public demo. Full timeline editor unlocks in your packet."
            value={answers.ownershipNotes ?? ""}
            onChange={(v) => onUpdate("ownershipNotes", v)}
            rows={3}
          />
        </div>
      </div>

      <div className="rounded-md border border-dashed border-teal-200/80 bg-teal-50/30 p-4 sm:p-5">
        <p className="section-kicker text-teal-700">
          {INTAKE_COPY.wizard.aiInventorshipTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">
          {INTAKE_COPY.wizard.aiInventorshipHint}
        </p>
        {aiTopic ? (
          <details className="mt-3 rounded-md border border-teal-100 bg-white/80 px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium text-navy-800">
              Learn more about AI tools and inventorship
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              {aiTopic.summary}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-navy-700">
              {aiTopic.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="text-teal-500">•</span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-navy-500">
              {aiTopic.safetyNote}
            </p>
          </details>
        ) : null}
        <div className="mt-5 space-y-5">
          <RadioGroup<AiAssistance>
            label="Did generative AI tools help with this invention?"
            options={AI_ASSISTANCE_OPTIONS}
            value={answers.aiAssistance ?? "none"}
            onChange={(v) => onUpdate("aiAssistance", v)}
          />
          {answers.aiAssistance &&
          answers.aiAssistance !== "none" ? (
            <TextField
              label="AI assistance notes (optional)"
              hint="What the AI produced, what humans decided or changed, and who directed the work — facts only."
              value={answers.aiAssistanceNotes ?? ""}
              onChange={(v) => onUpdate("aiAssistanceNotes", v)}
              rows={3}
            />
          ) : null}
        </div>
      </div>

      <EducationCardList
        title="Quick explainer"
        cards={getEducationCards([
          "public_disclosure_privacy",
          "ai_inventorship",
          "patent_attorney_role",
        ])}
      />
    </div>
  );
}
