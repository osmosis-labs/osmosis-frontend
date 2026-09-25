/**
 * Outcome of watching a submitted Solana transaction.
 *
 * - `confirmed`: landed at `confirmed` or `finalized` without error.
 * - `failed`: landed, but executed with an error. Nothing it would have
 *   moved has moved.
 * - `dropped`: never landed, and its blockhash has expired, so it never
 *   will. Nothing has moved.
 * - `unknown`: not yet provable either way (still unconfirmed when the
 *   watch gave up, or the node could not answer). Callers must NOT treat
 *   this as a failure: the transaction may still land.
 */
export type SolanaTxOutcome = "confirmed" | "failed" | "dropped" | "unknown";

/** The fields of an RPC `getSignatureStatuses` entry this watch reads. */
export type SolanaSignatureStatus = {
  err: unknown;
  confirmationStatus?: "processed" | "confirmed" | "finalized" | null;
} | null;

/**
 * Watches a submitted Solana transaction until its outcome is definite.
 *
 * Solana transactions are commonly DROPPED rather than failed: one that
 * does not land before its blockhash expires (roughly 60 to 90 seconds)
 * never will, and no indexer will ever report it. Treating that silence as
 * "still pending" leaves a transfer waiting forever on funds that never
 * moved, so a dropped transaction is detected explicitly: no status seen,
 * and the blockhash is no longer valid.
 *
 * The only definite negatives are `failed` and `dropped`. Anything this
 * cannot prove resolves to `unknown`, never to a failure, because a caller
 * that marks a transfer failed when it later lands strands the funds.
 *
 * RPC access is injected so the decision logic is testable without a node.
 */
export async function waitForSolanaSignature({
  getStatus,
  isBlockhashValid,
  intervalMs = 2_000,
  maxAttempts = 90,
}: {
  /** Reads the signature's status. `searchHistory` asks the node to look
   *  beyond its recent status cache (used for the final check before
   *  declaring a transaction dropped). */
  getStatus: (searchHistory: boolean) => Promise<SolanaSignatureStatus>;
  /** Whether the transaction's blockhash can still land. Omitted when the
   *  blockhash is unknown, in which case `dropped` is never concluded. */
  isBlockhashValid?: () => Promise<boolean>;
  intervalMs?: number;
  maxAttempts?: number;
}): Promise<SolanaTxOutcome> {
  const read = async (searchHistory: boolean) => {
    try {
      return { status: await getStatus(searchHistory) };
    } catch {
      return undefined; // transient RPC failure: undecided, not negative
    }
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await read(false);
    const status = result?.status;
    if (status?.err) return "failed";
    if (
      status?.confirmationStatus === "confirmed" ||
      status?.confirmationStatus === "finalized"
    ) {
      return "confirmed";
    }

    // Seen but not yet confirmed (processed): keep waiting. Only a
    // transaction that has NOT been seen can be dropped.
    if (result && status === null && isBlockhashValid) {
      let valid: boolean | undefined;
      try {
        valid = await isBlockhashValid();
      } catch {
        valid = undefined;
      }
      if (valid === false) {
        // The blockhash expired with no status in the recent cache. It may
        // still have landed at the edge of expiry, so look it up in full
        // history before concluding anything; an unanswerable lookup is not
        // proof it was dropped.
        const final = await read(true);
        if (!final) return "unknown";
        if (final.status?.err) return "failed";
        if (final.status === null) return "dropped";
        if (
          final.status.confirmationStatus === "confirmed" ||
          final.status.confirmationStatus === "finalized"
        ) {
          return "confirmed";
        }
        // landed but not yet confirmed: keep watching
      }
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  return "unknown";
}
