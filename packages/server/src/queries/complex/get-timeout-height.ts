import { Chain } from "@osmosis-labs/types";
import { Int } from "@osmosis-labs/unit";
import {
  ChainIdHelper,
  createMultiEndpointClient,
  getChain,
} from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryRPCStatus } from "../../queries/cosmos";
import { DEFAULT_LRU_OPTIONS } from "../../utils";

/**
 * How long an IBC transfer stays deliverable before it becomes refund-eligible.
 *
 * A packet that arrives after this window is rejected by the destination chain
 * and can only be refunded, so the window has to cover a slow relay rather than
 * a typical one.
 *
 * 15 minutes is the duration the previous flat 150-block offset produced on the
 * ~6s-block chains it was presumably chosen against (150 x 6s = 15 min), applied
 * uniformly here. It cuts both ways by design: fast chains gain a window they
 * were never meant to have as short as they did (Osmosis ~3.2 min, Nibiru
 * ~4.5 min), and slow chains lose windows that had grown incidentally long from
 * the flat block count (Babylon ~25 min, Optio ~152 min). Those long windows
 * were an artefact of block speed rather than an intended refund delay, and a
 * user waiting hours to become refund-eligible is its own failure.
 */
const TIMEOUT_WINDOW_SECONDS = 15 * 60;

/**
 * Height offset used when the destination chain's block time can't be measured.
 *
 * A flat count is necessarily a different duration on each chain (~2 min on a
 * 0.6s chain, ~19 min on a 6s one), so this is a deliberately conservative
 * stand-in rather than an equivalent of {@link TIMEOUT_WINDOW_SECONDS}: it keeps
 * an unmeasurable chain close to the offset this function returned historically
 * instead of extrapolating a window from a block time we don't actually know.
 *
 * It only applies when measurement fails. A failure is cached briefly to avoid
 * repeating an expensive multi-endpoint request on every quote, then measured
 * again after the short failure TTL expires.
 */
const FALLBACK_HEIGHT_OFFSET = 200;

/**
 * How many blocks back to sample when measuring block time. Large enough to
 * smooth over individual slow blocks, small enough to stay within the recent
 * history every node retains and to reflect the chain's *current* pace.
 */
const BLOCK_TIME_SAMPLE_SIZE = 1000;

/**
 * Bounds on a believable block time, in seconds, to reject bad node data.
 *
 * The upper bound sits above the slowest chain in the list rather than at a
 * round number: Optio produces a block roughly every 60.7s, so a 60s bound would
 * reject its genuine measurement and hand it the fallback offset, which at that
 * block speed is over three hours. A bound only guards against a misreporting
 * node, so it has to clear the real fleet with room to spare.
 */
const MIN_PLAUSIBLE_BLOCK_TIME_SECONDS = 0.1;
const MAX_PLAUSIBLE_BLOCK_TIME_SECONDS = 120;

/**
 * How long a measured block time is reused before being re-measured.
 *
 * Block time is a property of the chain, not of the requesting user, so this is
 * shared rather than per-user, and it is stable over hours.
 *
 * The staleness this can cause is bounded and one-directional. A chain that
 * *slows down* yields a longer window than intended, which is harmless. A chain
 * that *speeds up* yields a shorter one, so the exposure is a fraction of the
 * target window rather than of the TTL: a chain would have to roughly halve its
 * block time within the hour to bring 15 minutes below the ~4.5 that caused
 * packets to strand. Retunes of that size ship in a coordinated upgrade, not
 * mid-hour. Osmosis went from ~6s to ~1.3s blocks, but over releases.
 */
const BLOCK_TIME_TTL_MS = 1000 * 60 * 60;

/**
 * How long a *failed* measurement is remembered before retrying.
 *
 * Kept far shorter than {@link BLOCK_TIME_TTL_MS} so a transient RPC failure
 * doesn't pin a chain to the fallback offset, while still bounding the cost of a
 * persistent failure. Without this, a chain whose endpoints have all pruned the
 * sampled height would repeat the full hedged request on every quote: endpoints
 * are tried staggered by 1s, and the request only settles once all of them have
 * failed, so a median 6-endpoint chain would add ~5s to every quote.
 */
const BLOCK_TIME_FAILURE_TTL_MS = 1000 * 60;

const blockTimeCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/**
 * Clears the measured block times. Only for tests, which would otherwise leak
 * one case's block time into the next.
 */
export function resetBlockTimeCacheForTests() {
  blockTimeCache.clear();
}

export async function getTimeoutHeight({
  chainList,
  chainId,
  destinationAddress,
}: {
  chainList: Chain[];
  chainId?: string;
  /**
   * WARNING: bech32 prefix may be the same across different chains,
   * retulting in the use of an unintended chain.
   */
  destinationAddress?: string;
}) {
  const destinationCosmosChain = getChain({
    chainList,
    chainId,
    destinationAddress,
  });

  if (!destinationCosmosChain) {
    throw new Error("Could not find destination Cosmos chain");
  }

  const rpcUrls = destinationCosmosChain.apis.rpc.map((rpc) => rpc.address);

  if (rpcUrls.length === 0) {
    throw new Error(
      `No RPC endpoints available for chain ${destinationCosmosChain.chain_id}`
    );
  }

  const destinationNodeStatus = await queryRPCStatus({ rpcUrls });

  const network = destinationNodeStatus.result.node_info.network;
  const latestBlockHeight =
    destinationNodeStatus.result.sync_info.latest_block_height;

  if (!network) {
    throw new Error(
      `Failed to fetch the network chain id of ${destinationCosmosChain.chain_id}`
    );
  }

  if (!latestBlockHeight || latestBlockHeight === "0") {
    throw new Error(
      `Failed to fetch the latest block of ${destinationCosmosChain.chain_id}`
    );
  }

  const revisionNumber = ChainIdHelper.parse(network).version.toString();

  const heightOffset = await getHeightOffset({
    chainId: destinationCosmosChain.chain_id,
    rpcUrls,
    latestBlockHeight,
    latestBlockTime: destinationNodeStatus.result.sync_info.latest_block_time,
  });

  return {
    /**
     * Omit the revision_number if the chain's version is 0.
     * Sending the value as 0 will cause the transaction to fail.
     */
    ...(revisionNumber !== "0" && { revisionNumber }),
    revisionHeight: new Int(latestBlockHeight)
      .add(new Int(heightOffset.toString()))
      .toString(),
  };
}

/**
 * Converts {@link TIMEOUT_WINDOW_SECONDS} into a block count for the
 * destination chain, so the timeout is the same wall-clock duration regardless
 * of how fast the chain produces blocks.
 *
 * Falls back to {@link FALLBACK_HEIGHT_OFFSET} if block time can't be measured,
 * so a timeout is always set: leaving it unset would remove the user's only path
 * to a refund.
 */
async function getHeightOffset({
  chainId,
  rpcUrls,
  latestBlockHeight,
  latestBlockTime,
}: {
  chainId: string;
  rpcUrls: string[];
  latestBlockHeight: string;
  latestBlockTime?: string;
}): Promise<number> {
  /**
   * Only the block time is cached, never the resulting height: the offset is
   * added to a live block height, so caching the height would hand out a stale
   * (and eventually already-expired) timeout.
   *
   * A failure is cached too, under a much shorter TTL, so that a chain whose
   * endpoints have all pruned the sampled height doesn't repeat the full hedged
   * request on every quote. `null` is the cached marker for "measurement
   * failed"; `cachified` picks the TTL per outcome via `getFreshValue`'s
   * metadata.
   */
  const blockTimeSeconds = await cachified({
    cache: blockTimeCache,
    key: `ibc-timeout-block-time-${chainId}`,
    ttl: BLOCK_TIME_TTL_MS,
    getFreshValue: async ({ metadata }) => {
      const measured = await queryBlockTimeSeconds({
        rpcUrls,
        latestBlockHeight,
        latestBlockTime,
      });

      if (measured === undefined) {
        metadata.ttl = BLOCK_TIME_FAILURE_TTL_MS;
        return null;
      }

      return measured;
    },
  });

  if (blockTimeSeconds === null) return FALLBACK_HEIGHT_OFFSET;

  return Math.ceil(TIMEOUT_WINDOW_SECONDS / blockTimeSeconds);
}

/**
 * Measures average seconds per block from the interval between the latest block
 * and one {@link BLOCK_TIME_SAMPLE_SIZE} blocks earlier.
 *
 * The retained range reported in `sync_info` is deliberately not used: it is
 * bounded by each node's pruning config, so it varies between endpoints for the
 * same chain and averages over historical periods whose pace may differ from
 * today's.
 *
 * @returns Average seconds per block, or undefined if it can't be measured.
 */
async function queryBlockTimeSeconds({
  rpcUrls,
  latestBlockHeight,
  latestBlockTime,
}: {
  rpcUrls: string[];
  latestBlockHeight: string;
  latestBlockTime?: string;
}): Promise<number | undefined> {
  if (!latestBlockTime) return undefined;

  const latestHeight = Number(latestBlockHeight);
  const priorHeight = latestHeight - BLOCK_TIME_SAMPLE_SIZE;

  // Chain too young to sample; the fallback offset is the safer choice.
  if (!Number.isFinite(latestHeight) || priorHeight < 1) return undefined;

  // Constructed outside the try so a client misconfiguration surfaces rather
  // than being mistaken for an unreachable node.
  const client = createMultiEndpointClient(
    rpcUrls.map((url) => ({ address: url }))
  );

  let priorBlockTime: string | undefined;
  try {
    const response = await client.fetch<{
      result?: { block?: { header?: { time?: string } } };
    }>(`/block?height=${priorHeight}`);
    priorBlockTime = response?.result?.block?.header?.time;
  } catch {
    // Every endpoint has pruned this height or is unreachable; fall back below.
    return undefined;
  }

  if (!priorBlockTime) return undefined;

  const elapsedMs =
    new Date(latestBlockTime).getTime() - new Date(priorBlockTime).getTime();
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return undefined;

  const blockTimeSeconds = elapsedMs / 1_000 / BLOCK_TIME_SAMPLE_SIZE;

  // Guard against nonsense values from a stalled or misreporting node.
  if (
    blockTimeSeconds < MIN_PLAUSIBLE_BLOCK_TIME_SECONDS ||
    blockTimeSeconds > MAX_PLAUSIBLE_BLOCK_TIME_SECONDS
  ) {
    return undefined;
  }

  return blockTimeSeconds;
}
