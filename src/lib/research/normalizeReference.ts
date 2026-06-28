import type {
  CompareReferenceOutput,
  GapMapData,
  GapMapOutput,
  SavedReference,
} from "./types";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function normalizeComparison(
  raw?: CompareReferenceOutput | Record<string, unknown> | null,
): CompareReferenceOutput | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const comparison = raw as CompareReferenceOutput;
  const normalized: CompareReferenceOutput = {
    whatAppearsRelated: asStringArray(comparison.whatAppearsRelated),
    clarifyFurther: asStringArray(comparison.clarifyFurther),
    userDescribedDifferences: asStringArray(comparison.userDescribedDifferences),
    expertQuestions: asStringArray(comparison.expertQuestions),
    materialsToGather: asStringArray(comparison.materialsToGather),
    disclaimer: asString(comparison.disclaimer),
  };

  const hasContent =
    normalized.whatAppearsRelated.length > 0 ||
    normalized.clarifyFurther.length > 0 ||
    normalized.userDescribedDifferences.length > 0 ||
    normalized.expertQuestions.length > 0 ||
    normalized.materialsToGather.length > 0 ||
    normalized.disclaimer.length > 0;

  return hasContent ? normalized : undefined;
}

function normalizeGapMapOutput(raw?: GapMapOutput | Record<string, unknown> | null) {
  if (!raw || typeof raw !== "object") return undefined;

  const output = raw as GapMapOutput;
  const normalized: GapMapOutput = {
    possibleSimilarity: asStringArray(output.possibleSimilarity),
    possibleDifference: asStringArray(output.possibleDifference),
    documentNext: asStringArray(output.documentNext),
    expertQuestions: asStringArray(output.expertQuestions),
    disclaimer: asString(output.disclaimer),
  };

  const hasContent =
    normalized.possibleSimilarity.length > 0 ||
    normalized.possibleDifference.length > 0 ||
    normalized.documentNext.length > 0 ||
    normalized.expertQuestions.length > 0 ||
    normalized.disclaimer.length > 0;

  return hasContent ? normalized : undefined;
}

export function normalizeGapMap(
  raw?: GapMapData | Record<string, unknown> | null,
): GapMapData | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const gapMap = raw as GapMapData;
  const fields =
    gapMap.fields && typeof gapMap.fields === "object" ? gapMap.fields : {};
  const output = normalizeGapMapOutput(gapMap.output);

  const hasFieldContent = Object.values(fields).some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  if (!hasFieldContent && !output) return undefined;

  return {
    fields,
    output,
  };
}

export function normalizeSavedReference(ref: SavedReference): SavedReference {
  return {
    id: ref.id,
    title: asString(ref.title),
    url: asString(ref.url),
    referenceType: asString(ref.referenceType) || "other",
    searchQueryUsed: asString(ref.searchQueryUsed),
    looksSimilar: asString(ref.looksSimilar),
    seemsDifferent: asString(ref.seemsDifferent),
    expertQuestions: asString(ref.expertQuestions),
    notes: asString(ref.notes),
    comparison: normalizeComparison(ref.comparison),
    gapMap: normalizeGapMap(ref.gapMap),
    createdAt: ref.createdAt || new Date().toISOString(),
    updatedAt: ref.updatedAt,
  };
}

export function normalizeSavedReferences(refs: SavedReference[] | undefined): SavedReference[] {
  return (refs ?? []).map(normalizeSavedReference);
}
