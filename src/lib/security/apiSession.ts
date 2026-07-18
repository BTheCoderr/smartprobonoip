export function isValidPilotSessionId(value: string | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < 12 || trimmed.length > 128) return false;
  return !/[\r\n\t<>]/.test(trimmed);
}
