import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractLegalDocument,
  LegalDocumentError,
} from "@/lib/legal/documentExtraction";

describe("legal document extraction", () => {
  it("extracts plain text without persistence", async () => {
    const result = await extractLegalDocument({
      name: "notice.txt",
      type: "text/plain",
      buffer: Buffer.from("NOTICE\nA response is requested by October 14, 2026.", "utf8"),
    });

    assert.equal(result.fileType, "txt");
    assert.match(result.text, /October 14, 2026/);
    assert.equal(result.truncated, false);
  });

  it("rejects unsupported extensions", async () => {
    await assert.rejects(
      () =>
        extractLegalDocument({
          name: "notice.rtf",
          type: "text/rtf",
          buffer: Buffer.from("hello", "utf8"),
        }),
      (error: unknown) =>
        error instanceof LegalDocumentError &&
        error.code === "unsupported_type" &&
        error.status === 415,
    );
  });

  it("rejects binary data disguised as txt", async () => {
    await assert.rejects(
      () =>
        extractLegalDocument({
          name: "notice.txt",
          type: "text/plain",
          buffer: Buffer.from([0x41, 0x00, 0x42, 0x43]),
        }),
      (error: unknown) =>
        error instanceof LegalDocumentError &&
        error.code === "invalid_txt" &&
        error.status === 422,
    );
  });
});
