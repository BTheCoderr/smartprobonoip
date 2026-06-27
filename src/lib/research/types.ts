import type { QueryGroup } from "./queryGroups";

export type { QueryGroup } from "./queryGroups";

export interface CompareReferenceOutput {
  whatAppearsRelated: string[];
  clarifyFurther: string[];
  userDescribedDifferences: string[];
  expertQuestions: string[];
  materialsToGather: string[];
  disclaimer: string;
}

export type ReferenceType =
  | "patent"
  | "publication"
  | "product"
  | "website"
  | "trademark"
  | "design"
  | "copyright_source"
  | "other";

export const REFERENCE_TYPE_OPTIONS: { value: ReferenceType; label: string }[] =
  [
    { value: "patent", label: "Patent" },
    { value: "product", label: "Product" },
    { value: "trademark", label: "Trademark" },
    { value: "website", label: "Website" },
    { value: "design", label: "Design" },
    { value: "publication", label: "Article" },
    { value: "copyright_source", label: "Copyright / source" },
    { value: "other", label: "Other" },
  ];

export interface GapMapFields {
  sameProblem?: string;
  sameTargetUser?: string;
  sameMainParts?: string;
  sameTriggerMechanism?: string;
  sameUsage?: string;
  sameVisualDesign?: string;
  appearsDifferent?: string;
  expertReviewDifference?: string;
}

export interface GapMapOutput {
  possibleSimilarity: string[];
  possibleDifference: string[];
  documentNext: string[];
  expertQuestions: string[];
  disclaimer: string;
}

export interface GapMapData {
  fields: GapMapFields;
  output?: GapMapOutput;
}

export interface SavedReference {
  id: string;
  title: string;
  url: string;
  referenceType: ReferenceType | string;
  searchQueryUsed: string;
  looksSimilar: string;
  seemsDifferent: string;
  expertQuestions: string;
  notes: string;
  comparison?: CompareReferenceOutput;
  gapMap?: GapMapData;
  createdAt: string;
  updatedAt?: string;
}

export interface SuggestedQueryCard {
  query: string;
  whyItMayHelp: string;
}

export interface ResearchWorkspaceData {
  projectId: string;
  searchKeywords: string[];
  suggestedQueries: SuggestedQueryCard[];
  queryGroups: QueryGroup[];
  savedReferences: SavedReference[];
  loadError?: string;
}

export interface SaveReferenceInput {
  title: string;
  url?: string;
  referenceType?: ReferenceType | string;
  searchQueryUsed?: string;
  looksSimilar?: string;
  seemsDifferent?: string;
  expertQuestions?: string;
  notes?: string;
}

export interface UpdateReferenceInput extends Partial<SaveReferenceInput> {
  id: string;
  comparison?: CompareReferenceOutput;
  gapMap?: GapMapData;
}
