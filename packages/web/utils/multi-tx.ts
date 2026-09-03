import { IS_TESTNET } from "~/config";
import { ChainList } from "~/config/generated/chain-list";

/**
 * Pure helpers for multi-transaction bridge routes. Kept free of store and
 * hook imports so both the bridge components and the transfer-history store
 * can use them without an import cycle.
 */

/**
 * Polls Skip until the given tx's own route (the first leg of a multi-tx
 * transfer) completes, i.e. the funds have reached the intermediate chain.
 * `isActive` aborts the loop (e.g. on unmount); `maxAttempts` caps it for
 * one-shot resume checks.
 */
export async function waitForSkipStepArrival({
  chainId,
  txHash,
  isActive = () => true,
  maxAttempts,
  intervalMs = 10_000,
}: {
  chainId: string;
  txHash: string;
  isActive?: () => boolean;
  maxAttempts?: number;
  intervalMs?: number;
}): Promise<"success" | "failed" | "pending" | "aborted"> {
  const env = IS_TESTNET ? "testnet" : "mainnet";
  // prompt Skip to index the tx; the polling below tolerates failures
  await fetch(
    `/api/skip-track-tx?chainID=${chainId}&txHash=${txHash}&env=${env}`
  ).catch(() => undefined);

  for (let attempt = 0; !maxAttempts || attempt < maxAttempts; attempt++) {
    if (!isActive()) return "aborted";
    try {
      const response = await fetch(
        `/api/skip-tx-status?chainID=${chainId}&txHash=${txHash}&env=${env}`
      );
      if (response.ok) {
        const { state } = (await response.json()) as { state?: string };
        if (state === "STATE_COMPLETED_SUCCESS") return "success";
        if (state === "STATE_COMPLETED_ERROR" || state === "STATE_ABANDONED")
          return "failed";
      }
    } catch {
      // transient errors: keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return "pending";
}

/**
 * Balance of `denom` held by `address` on a cosmos chain, queried via the
 * chain's registry LCD. Returns undefined when it can't be determined, so
 * callers can choose to fail open or closed.
 */
export async function getChainBalance({
  chainId,
  address,
  denom,
}: {
  chainId: string;
  address: string;
  denom: string;
}): Promise<bigint | undefined> {
  const chain = ChainList.find((c) => c.chain_id === chainId);
  const rest = chain?.apis?.rest?.[0]?.address;
  if (!rest) return undefined;
  try {
    const response = await fetch(
      `${rest.replace(
        /\/$/,
        ""
      )}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${encodeURIComponent(
        denom
      )}`
    );
    if (!response.ok) return undefined;
    const { balance } = (await response.json()) as {
      balance?: { amount?: string };
    };
    return BigInt(balance?.amount ?? "0");
  } catch {
    return undefined;
  }
}
