/** Only confirmed account identities in an explicit allowlist can see global pilot data. */
export function isAllowedPlatformAdmin(
  user: { id?: string | null; email?: string | null; emailConfirmed?: boolean } | null,
  configuredEmails: string | null | undefined,
): boolean {
  if (!user?.id || !user.emailConfirmed || !user.email) return false;
  const email = user.email.trim().toLowerCase();
  if (!email) return false;
  return (configuredEmails ?? "").split(",").some((entry) => entry.trim().toLowerCase() === email);
}
