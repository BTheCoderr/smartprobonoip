import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractLegalDocument,
  LegalDocumentError,
} from "@/lib/legal/documentExtraction";

describe("legal document extraction", () => {
  it("extracts plain text without persistence", async () => {
    const file = new File(
      ["NOTICE\nA response is requested by October 14, 2026."],
      "notice.txt",
      { type: "text/plain" },
    );

    const result = await extractLegalDocument(file);
    assert.equal(result.fileType, "txt");
    assert.match(result.text, /October 14, 2026/);
    assert.equal(result.truncated, false);
  });

  it("rejects unsupported extensions", async () => {
    const file = new File(["hello"], "notice.rtf", { type: "text/rtf" });

    await assert.rejects(
      () => extractLegalDocument(file),
      (error: unknown) =>
        error instanceof LegalDocumentError &&
        error.code === "unsupported_type" &&
        error.status === 415,
    );
  });

  it("rejects binary data disguised as txt", async () => {
    const file = new File(
      [new Uint8Array([0x41, 0x00, 0x42, 0x43])],
      "notice.txt",
      { type: "text/plain" },
    );

    await assert.rejects(
      () => extractLegalDocument(file),
      (error: unknown) =>
        error instanceof LegalDocumentError &&
        error.code === "invalid_txt" &&
        error.status === 422,
    );
  });
});
