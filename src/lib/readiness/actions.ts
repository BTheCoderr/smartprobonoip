import {
  DEVELOPMENT_TIMELINE_FIELDS,
  getTimelineFieldValue,
} from "@/lib/packet";
import type { ProjectRecord } from "@/lib/types";
import {
  intakeStepTarget,
  PROFILE_ANCHORS,
  profileAnchorTarget,
  researchTarget,
} from "./links";
import type { ReadinessAction } from "./types";

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

/**
 * Improvement actions derived only from fields the canonical score inspects.
 * Every action maps to a real missing or incomplete input.
 */
export function buildReadinessActions(
  record: ProjectRecord,
  savedReferenceCount = 0,
): ReadinessAction[] {
  const { answers, profile } = record;
  const id = record.id;
  const actions: ReadinessAction[] = [];

  const coreFields: {
    key: keyof typeof answers;
    label: string;
  }[] = [
    { key: "whatCreated", label: "Describe what you created" },
    { key: "mainParts", label: "List the main parts or components" },
    { key: "howItWorks", label: "Explain how it works" },
    { key: "whatDifferent", label: "Describe what feels different" },
  ];
  for (const field of coreFields) {
    if (!hasText(answers[field.key] as string | undefined)) {
      actions.push({
        id: `core:${field.key}`,
        label: field.label,
        categoryId: "core_idea",
        fieldKey: field.key,
        target: intakeStepTarget(id, "idea", "Open invention basics"),
      });
    }
  }

  if (!hasText(answers.problemSolved)) {
    actions.push({
      id: "problem:problemSolved",
      label: "Describe the problem it solves",
      categoryId: "problem_audience",
      fieldKey: "problemSolved",
      target: intakeStepTarget(id, "idea", "Open invention basics"),
    });
  }
  if (!hasText(answers.whoFor)) {
    actions.push({
      id: "problem:whoFor",
      label: "Say who it is for",
      categoryId: "problem_audience",
      fieldKey: "whoFor",
      target: intakeStepTarget(id, "idea", "Open invention basics"),
    });
  }

  if (!answers.hasPrototype) {
    actions.push({
      id: "materials:hasPrototype",
      label: "Note whether you have a prototype or working demo",
      categoryId: "prototype_materials",
      fieldKey: "hasPrototype",
      target: intakeStepTarget(id, "materials", "Open materials & prototype"),
    });
  }
  if (answers.assets.length === 0) {
    actions.push({
      id: "materials:assets",
      label: "Select supporting materials you already have",
      categoryId: "prototype_materials",
      fieldKey: "assets",
      target: intakeStepTarget(id, "materials", "Open materials & prototype"),
    });
  }

  for (const field of DEVELOPMENT_TIMELINE_FIELDS) {
    if (!hasText(getTimelineFieldValue(record.developmentTimeline, field))) {
      actions.push({
        id: `timeline:${field}`,
        label: `Add ${field.toLowerCase()}`,
        categoryId: "timeline",
        fieldKey: field,
        target: profileAnchorTarget(
          id,
          PROFILE_ANCHORS.developmentTimeline,
          "Open development timeline",
        ),
      });
    }
  }

  if (profile.publicDisclosure) {
    if (
      !hasText(
        getTimelineFieldValue(
          record.developmentTimeline,
          "Date first shared publicly",
        ),
      )
    ) {
      actions.push({
        id: "disclosure:publicDate",
        label: "Add the date you first shared publicly",
        categoryId: "public_disclosure",
        fieldKey: "Date first shared publicly",
        target: profileAnchorTarget(
          id,
          PROFILE_ANCHORS.developmentTimeline,
          "Open development timeline",
        ),
      });
    }
    if (!answers.sharedChannels.some((channel) => channel !== "none")) {
      actions.push({
        id: "disclosure:channels",
        label: "Record where you shared the idea",
        categoryId: "public_disclosure",
        fieldKey: "sharedChannels",
        target: intakeStepTarget(
          id,
          "timeline",
          "Open disclosures & inventorship",
        ),
      });
    }
  }

  const handoffFields: {
    key: keyof typeof answers;
    label: string;
  }[] = [
    { key: "whatCreated", label: "Fill in what you created for handoff prep" },
    { key: "problemSolved", label: "Fill in the problem for handoff prep" },
    { key: "howItWorks", label: "Fill in how it works for handoff prep" },
    { key: "mainParts", label: "Fill in main parts for handoff prep" },
    { key: "whatDifferent", label: "Fill in what feels different for handoff prep" },
  ];
  for (const field of handoffFields) {
    if (!hasText(answers[field.key] as string | undefined)) {
      // Avoid duplicating the same core-field action already listed above.
      if (actions.some((action) => action.fieldKey === field.key)) continue;
      actions.push({
        id: `handoff:${field.key}`,
        label: field.label,
        categoryId: "expert_handoff",
        fieldKey: field.key,
        target: intakeStepTarget(id, "idea", "Open invention basics"),
      });
    }
  }
  if (savedReferenceCount === 0) {
    actions.push({
      id: "handoff:savedReference",
      label: "Save at least one possible similar reference",
      categoryId: "expert_handoff",
      fieldKey: "savedReferenceCount",
      target: researchTarget(id, "Open research workspace"),
    });
  }

  return actions;
}
