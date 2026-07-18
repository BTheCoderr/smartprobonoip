import { createHash } from "crypto";

export function hashRecoveryToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}
