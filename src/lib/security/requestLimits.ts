import { NextResponse } from "next/server";
import type { IntakeAnswers } from "@/lib/types";

/** Reject oversized JSON before AI or database work. */
export const MAX_JSON_BODY_BYTES = 256_000;

export const MAX_TEXT = {
  short: 200,
  standard: 4_000,
  long: 8_000,
  note: 2_000,
  email: 254,
  brandName: 120,
  location: 200,
  question: 500,
  researchTitle: 300,
  researchUrl: 2_000,
  researchNotes: 4_000,
  interestMessage: 2_000,
  interestName: 120,
} as const;

export const MAX_ARRAY = {
  assets: 24,
  sharedChannels: 24,
  goals: 24,
  ideaIncludes: 24,
  contributorHelpTypes: 24,
  agreementTypes: 24,
  disclosureEvents: 20,
  sourcesAlreadySearched: 24,
  completeInfo: 40,
  missingInfo: 40,
  expertQuestions: 40,
  recommendedResources: 40,
  signals: 40,
} as const;

export const OVERSIZE_BODY_MESSAGE = "Request body is too large.";
export const OVERSIZE_FIELD_MESSAGE = "One or more fields exceed allowed size.";

export class RequestLimitError extends Error {
  status: number;
  constructor(message: string, status: 413 | 422 = 422) {
    super(message);
    this.name = "RequestLimitError";
    this.status = status;
  }
}

function tooLong(value: unknown, max: number): boolean {
  return typeof value === "string" && value.length > max;
}

function tooMany(value: unknown, max: number): boolean {
  return Array.isArray(value) && value.length > max;
}

function assertStringField(
  value: unknown,
  max: number,
  optional = false,
): void {
  if (value === undefined || value === null) {
    if (optional) return;
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
  if (typeof value !== "string") {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
  if (value.length > max) {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
}

function assertStringArray(value: unknown, maxItems: number, maxItemLen: number): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
  for (const item of value) {
    if (typeof item !== "string" || item.length > maxItemLen) {
      throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
    }
  }
}

export function assertIntakeAnswersWithinLimits(answers: IntakeAnswers): void {
  assertStringField(answers.whatCreated, MAX_TEXT.long);
  assertStringField(answers.problemSolved, MAX_TEXT.long);
  assertStringField(answers.whoFor, MAX_TEXT.long);
  assertStringField(answers.howItWorks, MAX_TEXT.long);
  assertStringField(answers.mainParts, MAX_TEXT.long);
  assertStringField(answers.whatDifferent, MAX_TEXT.long);
  assertStringField(answers.location, MAX_TEXT.location);
  assertStringField(answers.ownershipNotes, MAX_TEXT.note, true);
  assertStringField(answers.brandName, MAX_TEXT.brandName, true);

  if (tooMany(answers.assets, MAX_ARRAY.assets)) {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
  if (tooMany(answers.sharedChannels, MAX_ARRAY.sharedChannels)) {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
  if (tooMany(answers.goals, MAX_ARRAY.goals)) {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
  if (tooMany(answers.ideaIncludes, MAX_ARRAY.ideaIncludes)) {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
  if (tooMany(answers.contributorHelpTypes, MAX_ARRAY.contributorHelpTypes)) {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
  if (tooMany(answers.agreementTypes, MAX_ARRAY.agreementTypes)) {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
  if (tooMany(answers.disclosureEvents, MAX_ARRAY.disclosureEvents)) {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }

  const sr = answers.searchReadiness;
  if (sr) {
    for (const key of [
      "keyFeatures",
      "whatFeelsNew",
      "closestProducts",
      "customerSearchTerms",
      "technicalSearchTerms",
      "possibleIndustries",
      "materialsMechanismsSteps",
      "similarReferencesFound",
    ] as const) {
      assertStringField(sr[key], MAX_TEXT.long, true);
    }
    assertStringArray(
      sr.sourcesAlreadySearched,
      MAX_ARRAY.sourcesAlreadySearched,
      MAX_TEXT.short,
    );
  }

  if (answers.disclosureEvents) {
    for (const event of answers.disclosureEvents) {
      assertStringField(event.approximateDate, MAX_TEXT.short, true);
      assertStringField(event.whereShown, MAX_TEXT.standard, true);
      assertStringField(event.whoSawIt, MAX_TEXT.standard, true);
      assertStringField(event.whatWasShown, MAX_TEXT.long, true);
    }
  }
}

export async function readJsonWithLimit(
  request: Request,
  maxBytes: number = MAX_JSON_BODY_BYTES,
): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declared = Number(contentLength);
    if (Number.isFinite(declared) && declared > maxBytes) {
      throw new RequestLimitError(OVERSIZE_BODY_MESSAGE, 413);
    }
  }

  const buf = Buffer.from(await request.arrayBuffer());
  if (buf.byteLength > maxBytes) {
    throw new RequestLimitError(OVERSIZE_BODY_MESSAGE, 413);
  }

  try {
    return JSON.parse(buf.toString("utf8")) as unknown;
  } catch {
    throw new RequestLimitError("Invalid JSON body", 422);
  }
}

export function limitErrorResponse(err: unknown): NextResponse | null {
  if (err instanceof RequestLimitError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return null;
}

export function assertTextWithinLimit(
  value: string | undefined | null,
  max: number,
): void {
  if (value == null) return;
  if (tooLong(value, max)) {
    throw new RequestLimitError(OVERSIZE_FIELD_MESSAGE, 422);
  }
}
