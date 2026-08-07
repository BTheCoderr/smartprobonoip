/**
 * Pure claim-gate logic shared by tests and documentation of the SQL RPC.
 *
 * The live claim runs inside Postgres (`claim_smartprobonoip_recovery_token`)
 * with `SELECT … FOR UPDATE`. These helpers mirror that decision tree so we can
 * assert behaviour — including concurrent single-use consumes — without a
 * database.
 */

/** Pull the raw token out of a pasted recovery URL, or return the trimmed input. */
export function normalizeRecoveryTokenInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get("token");
    if (fromQuery?.trim()) return fromQuery.trim();
  } catch {
    // Not a URL — treat the whole string as the token.
  }

  const match = trimmed.match(/[?&]token=([^&\s]+)/);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1]).trim();
    } catch {
      return match[1].trim();
    }
  }

  return trimmed;
}

export type RecoveryClaimStatus = "ok" | "invalid" | "already_used";

export interface RecoveryTokenClaimState {
  /** False when no row matches the hash. */
  found: boolean;
  revoked: boolean;
  expired: boolean;
  singleUse: boolean;
  consumed: boolean;
  /** Anchor project missing or demo. */
  projectClaimable: boolean;
}

/**
 * Decide the claim outcome from token state after the row has been locked.
 * Matches the branches in claim_smartprobonoip_recovery_token.
 */
export function evaluateRecoveryClaim(
  state: RecoveryTokenClaimState,
): RecoveryClaimStatus {
  if (!state.found) return "invalid";
  if (state.revoked) return "invalid";
  if (state.expired) return "invalid";
  if (state.singleUse && state.consumed) return "already_used";
  if (!state.projectClaimable) return "invalid";
  return "ok";
}

export const RECOVERY_CLAIM_INVALID_MESSAGE =
  "Invalid or expired recovery link";

export const RECOVERY_CLAIM_ALREADY_USED_MESSAGE =
  "This recovery link has already been used. Create a new link from your packet or workspace.";

export function recoveryClaimErrorMessage(
  status: Exclude<RecoveryClaimStatus, "ok">,
): string {
  return status === "already_used"
    ? RECOVERY_CLAIM_ALREADY_USED_MESSAGE
    : RECOVERY_CLAIM_INVALID_MESSAGE;
}

/**
 * In-memory ledger that serializes claims the way `FOR UPDATE` does.
 * Used only in tests to prove two simultaneous single-use claims cannot both
 * succeed.
 */
export class ConcurrentRecoveryLedger {
  private readonly tokens = new Map<
    string,
    {
      singleUse: boolean;
      consumed: boolean;
      revoked: boolean;
      expired: boolean;
      projectClaimable: boolean;
    }
  >();
  private chain: Promise<void> = Promise.resolve();

  seed(
    hash: string,
    options: {
      singleUse: boolean;
      consumed?: boolean;
      revoked?: boolean;
      expired?: boolean;
      projectClaimable?: boolean;
    },
  ): void {
    this.tokens.set(hash, {
      singleUse: options.singleUse,
      consumed: options.consumed ?? false,
      revoked: options.revoked ?? false,
      expired: options.expired ?? false,
      projectClaimable: options.projectClaimable ?? true,
    });
  }

  /** Claim under an exclusive lock. Concurrent callers queue. */
  claim(hash: string): Promise<RecoveryClaimStatus> {
    const run = this.chain.then(() => this.claimLocked(hash));
    // Keep the queue alive even when a claim rejects (it should not).
    this.chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private claimLocked(hash: string): RecoveryClaimStatus {
    const token = this.tokens.get(hash);
    const status = evaluateRecoveryClaim({
      found: Boolean(token),
      revoked: token?.revoked ?? false,
      expired: token?.expired ?? false,
      singleUse: token?.singleUse ?? false,
      consumed: token?.consumed ?? false,
      projectClaimable: token?.projectClaimable ?? false,
    });

    if (status === "ok" && token?.singleUse) {
      token.consumed = true;
    }

    return status;
  }
}
