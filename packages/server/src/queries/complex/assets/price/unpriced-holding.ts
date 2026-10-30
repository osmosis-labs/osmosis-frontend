import { AssetList } from "@osmosis-labs/types";
import { Dec, DecUtils } from "@osmosis-labs/unit";

import { queryPools } from "../../../sidecar";
import { getAsset } from "..";
import { getAssetMarketActivity, isMarketDataAvailable } from "../market";
import { getCoingeckoPrice } from "./providers/coingecko";
import { NoSqsPriceError } from "./providers/sidecar";

/** Pools fetched per asset when checking that all of them are drained. */
const POOLS_PAGE_SIZE = 100;

/** Checks in flight, by denom, so concurrent sums (a portfolio load runs several per
 *  pool) share one pools request. Only the pending request is shared, never a result. */
const pendingDrainedChecks = new Map<string, Promise<boolean>>();

/** True only when SQS lists at least one pool for the denom and every one of them is
 *  empty: every balance zero, the denom's and every other asset's. SQS lists an empty
 *  Balancer or CL pool with no balances at all, which counts as empty. A pool with none
 *  of the denom left but other assets in it can still buy the denom, so it isn't
 *  drained. Throws when the pools can't be read, and is false when the list may be
 *  incomplete (more pages). Read fresh each time: a cached "drained" could outlive
 *  liquidity being added back. */
function isDrainedOnSqs(coinMinimalDenom: string): Promise<boolean> {
  const pending = pendingDrainedChecks.get(coinMinimalDenom);
  if (pending) return pending;

  const check = (async () => {
    const { data: pools, meta } = await queryPools({
      denoms: [coinMinimalDenom],
      pagination: { limit: POOLS_PAGE_SIZE },
    });
    if (meta.next_cursor !== undefined || pools.length === 0) return false;

    return pools.every((pool) =>
      pool.balances.every(({ amount }) => new Dec(amount).isZero())
    );
  })().finally(() => pendingDrainedChecks.delete(coinMinimalDenom));
  pendingDrainedChecks.set(coinMinimalDenom, check);
  return check;
}

/** What a verified asset is worth when SQS says it has no price, or `undefined` when that
 *  can't be settled and the value stays unknown.
 *
 *  Only a "no price" answer from SQS (`NoSqsPriceError`, never a transport timeout or
 *  5xx) is considered. Then, in order:
 *  1. the data services' price (Numia), when their data is available and fresh and they
 *     report liquidity for the asset (without it the price may be a last trade);
 *  2. CoinGecko's price, when the asset has a CoinGecko id;
 *  3. zero, only when the data services' data is available and every SQS pool holding
 *     the asset is empty.
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

    // Without fresh data services data, "no Numia price" can't be told from "unknown",
    // so only CoinGecko can still settle it.
    const marketDataAvailable = await isMarketDataAvailable();
    if (marketDataAvailable) {
      const activity = await getAssetMarketActivity({ coinMinimalDenom });
      // a zero price is no price: it must not stand in for the drained-pool check. A
      // price without liquidity behind it may be the last trade before the pools emptied.
      const numiaPrice = activity?.price?.toDec();
      if (numiaPrice?.isPositive() && activity?.liquidity?.toDec().isPositive())
        return displayAmount.mul(numiaPrice);
    }

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

    if (!marketDataAvailable) return undefined;
    return (await isDrainedOnSqs(coinMinimalDenom)) ? new Dec(0) : undefined;
  } catch {
    return undefined;
  }
}
