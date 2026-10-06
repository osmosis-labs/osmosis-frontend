import {
  SOLANA_PUBLIC_RPC_URL,
  SPL_TOKEN_2022_PROGRAM_ID,
  SPL_TOKEN_PROGRAM_ID,
} from "@osmosis-labs/bridge/build/utils/solana";
import { apiClient } from "@osmosis-labs/utils";

/** This app's Solana RPC route (pages/api/solana-rpc), which forwards to the
 *  keyed provider server-side. */
const SOLANA_RPC_PROXY_PATH = "/api/solana-rpc";

/**
 * Absolute URL of the Solana RPC route. `@solana/web3.js` `Connection`
 * requires an absolute URL; outside the browser the path is returned as-is.
 */
export function getSolanaRpcProxyUrl(): string {
  return typeof window === "undefined"
    ? SOLANA_RPC_PROXY_PATH
    : new URL(SOLANA_RPC_PROXY_PATH, window.location.origin).toString();
}

/**
 * Solana RPC endpoints for reads the browser makes, in preference order: the
 * app's RPC route (which holds the provider key server-side), then the
 * public endpoint in case the route itself fails. publicnode is deliberately
 * not listed: it rejects the indexed token-account queries that balances
 * depend on.
 */
export function getClientSolanaRpcUrls(): string[] {
  return [getSolanaRpcProxyUrl(), SOLANA_PUBLIC_RPC_URL];
}

/** Calls a Solana JSON-RPC method, trying each endpoint in order. Throws the
 *  last error when none answers, so callers never read a failure as an
 *  empty result. */
export async function clientSolanaRpc<T>(
  method: string,
  params: unknown[],
  rpcUrls: string[] = getClientSolanaRpcUrls()
): Promise<T> {
  let lastError: unknown = new Error("No Solana RPC configured");
  for (const rpc of rpcUrls) {
    try {
      // JSON-RPC reports method errors inside a 200 response, so apiClient
      // (which throws on non-2xx) is checked for `error` as well.
      const json = await apiClient<{
        error?: { message?: string };
        result?: T;
      }>(rpc, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      if (json.error) {
        throw new Error(`Solana RPC ${method} failed: ${json.error.message}`);
      }
      return json.result as T;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

/**
 * One-shot, provable outcome of a submitted Solana transaction, for status
 * tracking that outlives the signing flow (e.g. a transfer restored after a
 * reload).
 *
 * - `confirmed` / `failed`: the tx is in history at `confirmed` or later,
 *   without or with an error.
 * - `dropped`: no record in full history and its blockhash has expired, so
 *   it can never land.
 * - `undefined`: nothing provable yet (not seen but the blockhash is still
 *   valid or unknown, seen only at `processed`, or the RPC didn't answer).
 *   Callers must keep waiting, never treat it as a failure.
 */
export async function checkSolanaSignatureOutcome({
  signature,
  recentBlockhash,
}: {
  signature: string;
  recentBlockhash?: string;
}): Promise<"confirmed" | "failed" | "dropped" | undefined> {
  const readStatus = async () => {
    const statuses = await clientSolanaRpc<{
      value?: (SolanaSignatureStatus | undefined)[];
    }>("getSignatureStatuses", [
      [signature],
      { searchTransactionHistory: true },
    ]);
    return statuses?.value?.[0];
  };
  const settled = (status: NonNullable<SolanaSignatureStatus>) => {
    if (
      status.confirmationStatus === "confirmed" ||
      status.confirmationStatus === "finalized"
    ) {
      return status.err ? "failed" : "confirmed";
    }
    return undefined; // processed only: may still be on a skipped fork
  };

  try {
    const status = await readStatus();
    if (status) return settled(status);

    if (!recentBlockhash) return undefined;
    const validity = await clientSolanaRpc<{ value?: boolean }>(
      "isBlockhashValid",
      [recentBlockhash, { commitment: "confirmed" }]
    );
    if (validity?.value !== false) return undefined;

    // The blockhash expired, but the tx may have landed between the status
    // read above and the expiry check. Re-read full history before calling
    // it dropped, as the live watcher (waitForSolanaSignature) does.
    const finalStatus = await readStatus();
    return finalStatus ? settled(finalStatus) : "dropped";
  } catch {
    return undefined; // unanswered: undecided, not negative
  }
}

/** The SPL Token and Token-2022 programs, which own every token account
 *  and mint. */
const SPL_TOKEN_PROGRAM_IDS = new Set([
  SPL_TOKEN_PROGRAM_ID,
  SPL_TOKEN_2022_PROGRAM_ID,
]);

/**
 * Whether a Solana address can receive a bridge withdrawal.
 *
 * A token account (or mint) address passes format validation but is not a
 * wallet: CCTP mints to the token account derived from the address it is
 * given, and one derived from a token account belongs to nobody, so funds
 * sent there are lost. Such addresses are easy to copy from an explorer.
 *
 * - `ok`: the account doesn't exist yet (a fresh wallet) or isn't owned by
 *   a token program.
 * - `token-account`: owned by the SPL Token or Token-2022 program.
 *
 * Throws when the account can't be read, so an unanswered lookup is never
 * taken as a pass.
 */
export async function checkSolanaRecipient(
  address: string
): Promise<"ok" | "token-account"> {
  const result = await clientSolanaRpc<{
    value?: { owner?: string } | null;
  }>("getAccountInfo", [
    address,
    // Only the owner is needed, so skip the account data.
    { encoding: "base64", dataSlice: { offset: 0, length: 0 } },
  ]);
  const owner = result?.value?.owner;
  return owner && SPL_TOKEN_PROGRAM_IDS.has(owner) ? "token-account" : "ok";
}

/**
 * What a pre-signing simulation of a Solana transaction says about whether
 * it is worth opening the wallet.
 *
 * - `needs-sol`: the fee payer cannot cover the network fee or the rent for
 *   an account the transaction creates. The wallet would only fail.
 * - `expired`: the transaction's blockhash is no longer valid, so it can
 *   never land; the quote must be rebuilt.
 * - `ok`: nothing actionable found. Any OTHER simulation failure is also
 *   reported as `ok`: only the two cases above are definite and actionable,
 *   and blocking on anything else would risk refusing a transaction the
 *   cluster would accept (the wallet runs its own simulation regardless).
 */
export type SolanaPreflightResult = "ok" | "needs-sol" | "expired";

/** Classifies a `simulateTransaction` result. `err` is the RPC's
 *  TransactionError value; `logs` its program logs. */
export function classifySolanaSimulation(
  err: unknown,
  logs: string[] | null | undefined
): SolanaPreflightResult {
  if (err == null) return "ok";
  if (err === "BlockhashNotFound") return "expired";
  // The fee payer has never been funded (no SOL at all), or cannot pay.
  if (err === "AccountNotFound" || err === "InsufficientFundsForFee") {
    return "needs-sol";
  }
  if (typeof err === "object" && "InsufficientFundsForRent" in err) {
    return "needs-sol";
  }
  // A system-program transfer (e.g. funding a new account's rent) that the
  // payer cannot afford fails with this log line.
  if ((logs ?? []).some((line) => /insufficient lamports/i.test(line))) {
    return "needs-sol";
  }
  return "ok";
}

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

  // An outcome, success or error, is final only once the slot is confirmed:
  // a status seen at `processed` can belong to a fork that is later skipped,
  // and the same signature can then still land on the canonical chain.
  const settled = (status: SolanaSignatureStatus | undefined) =>
    status?.confirmationStatus === "confirmed" ||
    status?.confirmationStatus === "finalized"
      ? status.err
        ? "failed"
        : "confirmed"
      : undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await read(false);
    const status = result?.status;
    const outcome = settled(status);
    if (outcome) return outcome;

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
        if (final.status === null) return "dropped";
        const finalOutcome = settled(final.status);
        if (finalOutcome) return finalOutcome;
        // landed but not yet confirmed: keep watching
      }
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  return "unknown";
}
