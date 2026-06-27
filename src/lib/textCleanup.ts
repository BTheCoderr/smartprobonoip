/** Normalize user-authored and generated packet text for display and PDF export. */

export function cleanText(text: string): string {
  if (!text?.trim()) return "";

  let out = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

  // Fix double (or more) periods while preserving ellipses
  out = out.replace(/\.{2,}/g, ".");
  out = out.replace(/\.\s+\./g, ".");

  // Remove space before punctuation
  out = out.replace(/\s+([,.;:!?])/g, "$1");

  // Ensure single space after sentence punctuation
  out = out.replace(/([.!?])([A-Za-z])/g, "$1 $2");

  // Trim stray punctuation runs at edges
  out = out.replace(/^[,;:\s]+/, "").replace(/[,;\s]+$/, "");

  return out.trim();
}

export function cleanSearchQuery(query: string): string {
  const cleaned = cleanText(
    query
      .toLowerCase()
      .replace(/\bpatent\b/g, "")
      .replace(/\binvention\b/g, "")
      .replace(/\bprior art\b/g, "")
      .replace(/https?:\/\/[^\s]+/g, " ")
      .replace(/www\.[^\s]+/g, " "),
  );
  return cleaned.replace(/\s+/g, " ").trim();
}

export function stripBlockedTokensFromQuery(query: string): string {
  const blocked = new Set([
    "https",
    "http",
    "www",
    "netlify",
    "vercel",
    "localhost",
    "smartprobonoip",
    "app",
    "start",
    "com",
    "netlifyapp",
  ]);
  return cleanSearchQuery(
    query
      .split(/\s+/)
      .filter((w) => !blocked.has(w.toLowerCase()))
      .join(" "),
  );
}

export function extractBrandName(whatCreated: string): string | null {
  const raw = whatCreated.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw) || /smartprobonoip/i.test(raw)) return null;

  const emDash = raw.split("—")[0]?.split(" - ")[0]?.trim();
  if (emDash && emDash.length <= 40 && /^[A-Z]/.test(emDash)) {
    return emDash.replace(/[.,!?]+$/, "");
  }

  const firstWord = raw.match(/^([A-Z][A-Za-z0-9]+)/)?.[1];
  if (firstWord && firstWord.length >= 3) return firstWord;

  return null;
}

export function joinSentences(parts: string[]): string {
  return parts
    .map((p) => cleanText(p))
    .filter((p) => p.length > 0)
    .map((p) => {
      if (!/[.!?]$/.test(p)) return `${p}.`;
      return p;
    })
    .join(" ")
    .replace(/\.+/g, ".")
    .replace(/\.\s+\./g, ".")
    .replace(/([.!?])\s*([.!?])+/g, "$1");
}

export function preserveBrandInText(text: string, brand: string | null): string {
  if (!brand) return cleanText(text);
  const cleaned = cleanText(text);
  const re = new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return cleaned.replace(re, brand);
}
