import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";

import { queryBalances } from "../../../cosmos";
import { PoolRawResponse, queryPools } from "../../../osmosis";
import { calcAssetValue, getAsset } from "../../assets";
import { DEFAULT_VS_CURRENCY } from "../../assets/config";
import { TransmuterPoolCodeIds } from "../env";
import { Pool, PoolType } from "../index";

/** Fetches cached pools from node and returns them as a more useful and simplified TS type.
 *  Pools are filtered by isValidPool, which checks if the pool has at least 2 valid and listed assets. */
export async function getPoolsFromNode(): Promise<Pool[]> {
  let rawPools = await getCachedRawPools();

  return (
    await Promise.all(
      rawPools.map(async (rawPool) => {
        // filter for only valid pools
        if (!isValidPool(rawPool)) return;

        const reserveCoins = await getListedPoolReservesFromRaw(rawPool);
        if (!reserveCoins) return;

        return {
          id: getPoolIdFromRaw(rawPool),
          type: getPoolTypeFromRaw(rawPool),
          raw: rawPool,
          reserveCoins,
          totalFiatValueLocked: await getTotalFiatValueLockedFromReserves(
            reserveCoins
          ),
        };
      })
    )
  ).filter((pool): pool is NonNullable<typeof pool> => Boolean(pool));
}

const rawPoolsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Pools from node, lightly cached. */
function getCachedRawPools(): Promise<PoolRawResponse[]> {
  return cachified({
    cache: rawPoolsCache,
    key: "raw-pools",
    ttl: 500,
    getFreshValue: () => queryPools().then(({ pools }) => pools),
  });
}

async function isValidPool(raw: PoolRawResponse) {
  const reserve = await getListedPoolReservesFromRaw(raw);

  if (!reserve || reserve.length < 2) return false;
  return true;
}

function getPoolIdFromRaw(raw: PoolRawResponse) {
  if (raw["@type"] === "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool") {
    return raw.pool_id;
  }
  return raw.id;
}

/** @throws Unknown pool type. */
function getPoolTypeFromRaw(raw: PoolRawResponse): PoolType {
  if (raw["@type"] === "/osmosis.gamm.v1beta1.Pool") {
    return "weighted";
  } else if (
    raw["@type"] === "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool"
  ) {
    return "stable";
  } else if (raw["@type"] === "/osmosis.concentratedliquidity.v1beta1.Pool") {
    return "concentrated";
  } else if (raw["@type"] === "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool") {
    if (TransmuterPoolCodeIds.includes(raw.code_id)) {
      return "cosmwasm-transmuter";
    }

    return "cosmwasm";
  }

  throw new Error("Unknown pool type");
}

/** Creates CoinPretty objects with asset list assets, and returns `undefined`
 *  if any asset in the pool is unknown or unlisted. */
export async function getListedPoolReservesFromRaw(raw: PoolRawResponse) {
  let reserveCoins: { denom: string; amount: string }[];

  if (raw["@type"] === "/osmosis.gamm.v1beta1.Pool") {
    reserveCoins = raw.pool_assets.map((asset) => asset.token);
  } else if (
    raw["@type"] === "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool"
  ) {
    reserveCoins = raw.pool_liquidity;
  } else if (raw["@type"] === "/osmosis.concentratedliquidity.v1beta1.Pool") {
    reserveCoins = await getCachedPoolReserves(raw.address);
  } else if (raw["@type"] === "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool") {
    reserveCoins = await getCachedPoolReserves(raw.contract_address);
  } else {
    console.error("Unknown pool type of id: " + getPoolIdFromRaw(raw));
    return;
  }

  if (reserveCoins.length < 2) return;

  const reserveAssets = await Promise.all(
    reserveCoins.map(async (coin) => {
      const asset = await getAsset({ anyDenom: coin.denom }).catch(() => null);
      // not listed
      if (!asset) return;
      return new CoinPretty(asset, coin.amount);
    })
  );

  // only return if all assets are valid and listed
  // it's expected many pools will have unlisted assets, so don't log or throw error
  if (!reserveAssets.some((asset) => !asset)) {
    return reserveAssets as NonNullable<(typeof reserveAssets)[number]>[];
  }
}

const poolReservesCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Lightly cached pool amounts from node. Returns empty array if balances are invalid. */
export function getCachedPoolReserves(
  poolAddress: string
): Promise<{ denom: string; amount: string }[]> {
  return cachified({
    cache: poolReservesCache,
    key: `pool-reserves-${poolAddress}`,
    ttl: 300,
    getFreshValue: async () => {
      try {
        const balances = (await queryBalances(poolAddress)).balances;

        return balances;
      } catch (e) {
        console.error(
          "Pool",
          poolAddress,
          ": failed to get pool reserves: " + e
        );
        return [];
      }
    },
  });
}

export async function getTotalFiatValueLockedFromReserves(
  reserves: CoinPretty[]
) {
  const assetValues = await Promise.all(
    reserves.map((coin) =>
      calcAssetValue({
        anyDenom: coin.currency.coinMinimalDenom,
        amount: coin.toCoin().amount,
      })
    )
  );

  const total = assetValues.reduce<Dec>(
    (acc, val) => (val ? acc.add(val) : acc),
    new Dec(0)
  );

  return new PricePretty(DEFAULT_VS_CURRENCY, total);
}
