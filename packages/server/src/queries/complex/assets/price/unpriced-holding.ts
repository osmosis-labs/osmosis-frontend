import { AssetList } from "@osmosis-labs/types";
import { Dec, DecUtils } from "@osmosis-labs/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../../utils/cache";
import { queryPools } from "../../../sidecar";
import { getAsset } from "..";
import { getCoingeckoPrice } from "./providers/coingecko";
import { NoSqsPriceError } from "./providers/sidecar";

/** Pools fetched per asset when checking that all of them are drained. */
const POOLS_PAGE_SIZE = 100;

const drainedCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** True only when SQS lists at least one pool holding the denom and every one of them
 *  has a zero balance of it. Throws when the pools can't be read, and is false when the
 *  list may be incomplete (more pages) or a pool doesn't report the balance. Not a price,
 *  so a short cache is safe; a failed query is not cached. */
function isDrainedOnSqs(coinMinimalDenom: string): Promise<boolean> {
  return cachified({
    cache: drainedCache,
    key: `drained-${coinMinimalDenom}`,
    ttl: 1000 * 60, // 1 minute
    getFreshValue: async () => {
      const { data: pools, meta } = await queryPools({
        denoms: [coinMinimalDenom],
        pagination: { limit: POOLS_PAGE_SIZE },
      });
      if (meta.next_cursor !== undefined || pools.length === 0) return false;

      return pools.every((pool) => {
        const balance = pool.balances.find(
          ({ denom }) => denom === coinMinimalDenom
        );
        return balance !== undefined && new Dec(balance.amount).isZero();
      });
    },
  });
}

/** What a verified asset is worth when SQS says it has no price, or `undefined` when that
 *  can't be settled and the value stays unknown.
 *
 *  Only a definite "no price" answer from SQS (`NoSqsPriceError`, never a timeout or 5xx)
 *  is considered. Then, in order:
 *  1. the data services' price (Numia), when their data is available and fresh;
 *  2. CoinGecko's price, when the asset has a CoinGecko id;
 *  3. zero, only when every SQS pool holding the asset has a zero balance of it.
 *  Any error, an unavailable data source, or a pool with liquidity left leaves it
 *  unknown. A price is used for this call only, never kept. */
export async function resolveUnpricedHolding({
  assetLists,
  coinMinimalDenom,
  amount,
  error,
}: {
  assetLists: AssetList[];
  coinMinimalDenom: string;
  amount: string;
  error: unknown;
}): Promise<Dec | undefined> {
  if (!(error instanceof NoSqsPriceError)) return undefined;

  try {
    const asset = getAsset({ assetLists, anyDenom: coinMinimalDenom });
    const displayAmount = new Dec(amount).quo(
      DecUtils.getTenExponentN(asset.coinDecimals)
    );

    // Lazy import: market.ts imports the price module.
    const { getAssetMarketActivity, isMarketDataAvailable } =
      await import("../market");
    // Without fresh data services data, "no Numia price" can't be told from "unknown".
    if (!(await isMarketDataAvailable())) return undefined;
    const activity = await getAssetMarketActivity({ coinMinimalDenom });
    // a zero price is no price: it must not stand in for the drained-pool check
    const numiaPrice = activity?.price?.toDec();
    if (numiaPrice?.isPositive()) return displayAmount.mul(numiaPrice);

    if (asset.coinGeckoId) {
      const price = await getCoingeckoPrice({
        coinGeckoId: asset.coinGeckoId,
        currency: "usd",
      }).catch((e) => {
        // CoinGecko answered without a price for this id: nothing there.
        if (
          e instanceof Error &&
          e.message.startsWith("No CoinGecko price result")
        )
          return undefined;
        throw e;
      });
      if (price?.isPositive()) return displayAmount.mul(price);
    }

    return (await isDrainedOnSqs(coinMinimalDenom)) ? new Dec(0) : undefined;
  } catch {
    return undefined;
  }
}
