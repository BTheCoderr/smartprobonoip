// Verification helper: extracts text from the ShelfSnap test PDF.
// Requires pdf-parse (not a saved dependency): npm install --no-save pdf-parse
import { readFileSync, writeFileSync } from "node:fs";
import { PDFParse } from "pdf-parse";

const buf = readFileSync("test-output/shelfsnap-packet.pdf");
const parser = new PDFParse({ data: new Uint8Array(buf) });
const result = await parser.getText();
writeFileSync("test-output/shelfsnap-packet.txt", result.text);
console.log(`Extracted ${result.text.length} chars`);
await parser.destroy();
