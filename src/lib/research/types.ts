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
  | "copyright_source"
  | "other";

export const REFERENCE_TYPE_OPTIONS: { value: ReferenceType; label: string }[] =
  [
    { value: "patent", label: "Patent" },
    { value: "publication", label: "Publication" },
    { value: "product", label: "Product" },
    { value: "website", label: "Website" },
    { value: "trademark", label: "Trademark" },
    { value: "copyright_source", label: "Copyright / source" },
    { value: "other", label: "Other" },
  ];

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
  savedReferences: SavedReference[];
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
}
