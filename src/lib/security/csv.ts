export function escapeCsvField(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined) return "";
  let str = String(value);

  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}
